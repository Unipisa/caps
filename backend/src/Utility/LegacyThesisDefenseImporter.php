<?php
declare(strict_types=1);

namespace App\Utility;

use App\Model\Entity\Form;
use Cake\Datasource\EntityInterface;
use Cake\ORM\Locator\LocatorInterface;
use DateTimeImmutable;
use RuntimeException;

/** Maps the legacy Italian thesis form fields. Call inside a transaction. */
class LegacyThesisDefenseImporter
{
    public function __construct(private LocatorInterface $tables)
    {
    }

    public static function decodeData(mixed $data): array
    {
        // Cake's JSON column and old clients can each have encoded the payload.
        for ($i = 0; is_string($data) && $i < 3; $i++) {
            $data = json_decode($data, true, 512, JSON_THROW_ON_ERROR);
        }
        if (!is_array($data) || array_is_list($data)) {
            throw new RuntimeException('Il contenuto del modulo non è un oggetto JSON.');
        }
        return $data;
    }

    public function convert(Form $form, string $type, ?int $sessionId = null): EntityInterface
    {
        if (!in_array($form->state, ['submitted', 'approved', 'rejected'], true) || !$form->date_submitted) {
            throw new RuntimeException('Il modulo non è una domanda inviata.');
        }
        $data = self::decodeData($form->data);
        $field = static function (string $key) use ($data): string {
            $value = $data[$key] ?? '';
            if (!is_scalar($value) && $value !== null) {
                throw new RuntimeException("Campo $key non valido.");
            }
            return trim((string)$value);
        };
        $sessions = $this->tables->get('DegreeSessions');
        if ($sessionId !== null) {
            $session = $sessions->get($sessionId);
            if ($session->type !== $type) {
                throw new RuntimeException('Il tipo dell’appello indicato non corrisponde al tipo di laurea.');
            }
        } else {
            $date = null;
            foreach (['Y-m-d', 'd/m/Y', 'd-m-Y'] as $format) {
                $parsed = DateTimeImmutable::createFromFormat('!' . $format, $field('data'));
                if ($parsed && $parsed->format($format) === $field('data')) {
                    $date = $parsed->format('Y-m-d');
                    break;
                }
            }
            if ($date === null) {
                throw new RuntimeException('Data appello mancante o non valida; specificare --session-id.');
            }
            $matches = $sessions->find()->where(['type' => $type, 'start_date' => $date])->all();
            if ($matches->count() !== 1) {
                throw new RuntimeException("Occorre un solo appello $type in data $date: creare l’appello o usare --session-id.");
            }
            $session = $matches->first();
        }
        $public = mb_strtolower($field('display_pubblico'));
        if (!in_array($public, ['', 'si', 'sì', 'no'], true)) {
            throw new RuntimeException('Consenso alla visualizzazione pubblica non riconosciuto.');
        }
        $defenses = $this->tables->get('ThesisDefenses');
        $defense = $defenses->newEntity([
            'degree_session_id' => $session->id,
            'user_id' => $form->user_id,
            'enrollment_year' => $field('anno_immatricolazione'),
            'bachelor_degree' => $field('laurea_triennale'),
            'bachelor_university' => $field('conseguimento_lt'),
            'phone' => $field('tel_cellulare'),
            'title' => $field('titolo'),
            'proposed_second_examiners' => implode("\n", array_filter([
                $field('controrelatore_1'), $field('controrelatore_2'), $field('controrelatore_3'),
            ], static fn ($value) => $value !== '')),
            'public' => in_array($public, ['si', 'sì'], true),
            'state' => $form->state,
            'submitted_at' => new \Cake\I18n\DateTime($form->date_submitted->format('Y-m-d H:i:s')),
            'managed_at' => $form->date_managed
                ? new \Cake\I18n\DateTime($form->date_managed->format('Y-m-d H:i:s')) : null,
        ]);
        // Not mass assignable through the public API.
        $defense->set('source_form_id', $form->id);
        $this->save($defenses, $defense, ['legacyFormImport' => true]);

        $advisors = $this->tables->get('ThesisDefenseAdvisors');
        $advisor = $advisors->newEntity([
            'thesis_defense_id' => $defense->id,
            'name' => $field('relatore'), 'email' => $field('email_relatore'),
        ]);
        if ($field('relatore') === '' || $field('email_relatore') === '') {
            throw new RuntimeException('Nome o email del relatore mancanti.');
        }
        $this->save($advisors, $advisor);
        // This was a free-text field, with no separate names or email addresses.
        // Keep it intact as a single additional advisor entry, without inventing emails.
        if ($field('altri_relatori') !== '') {
            if (mb_strlen($field('altri_relatori')) > 255) {
                throw new RuntimeException('Il campo altri_relatori supera 255 caratteri.');
            }
            $other = $advisors->newEntity([
                'thesis_defense_id' => $defense->id, 'name' => $field('altri_relatori'), 'email' => '',
            ], ['validate' => false]);
            $this->save($advisors, $other);
        }
        $attachments = $this->tables->get('ThesisDefenseAttachments');
        foreach ($this->tables->get('FormAttachments')->find()->where(['form_id' => $form->id]) as $source) {
            $attachment = $attachments->newEntity([
                'thesis_defense_id' => $defense->id, 'filename' => $source->filename,
                'mimetype' => $source->mimetype, 'data' => $source->data, 'created' => $source->created,
            ]);
            $this->save($attachments, $attachment);
        }
        return $defense;
    }

    private function save(\Cake\ORM\Table $table, EntityInterface $entity, array $options = []): void
    {
        if (!$table->save($entity, $options)) {
            throw new RuntimeException($table->getAlias() . ': ' . json_encode($entity->getErrors(), JSON_UNESCAPED_UNICODE));
        }
    }
}
