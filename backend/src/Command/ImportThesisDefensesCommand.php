<?php
declare(strict_types=1);

namespace App\Command;

use App\Utility\LegacyThesisDefenseImporter;
use Cake\Command\Command;
use Cake\Console\Arguments;
use Cake\Console\ConsoleIo;
use Cake\Console\ConsoleOptionParser;
use DateTimeImmutable;
use Throwable;

class ImportThesisDefensesCommand extends Command
{
    protected function buildOptionParser(ConsoleOptionParser $parser): ConsoleOptionParser
    {
        return $parser
            ->setDescription('Converte i moduli di laurea inviati, conservando i moduli originali.')
            ->addArgument('template_id', ['required' => true, 'help' => 'ID del tipo di modulo (form_template_id).'])
            ->addArgument('since', ['required' => true, 'help' => 'Data di invio minima inclusa, YYYY-MM-DD.'])
            ->addArgument('type', ['required' => true, 'choices' => ['bachelor', 'master'], 'help' => 'Tipo di laurea per individuare gli appelli.'])
            ->addOption('dry-run', ['boolean' => true, 'help' => 'Verifica la conversione e annulla tutte le scritture.'])
            ->addOption('session-id', ['help' => 'Appello da usare per tutti i moduli, invece della ricerca per data.']);
    }

    public function execute(Arguments $args, ConsoleIo $io): ?int
    {
        $templateId = $args->getArgument('template_id');
        $since = $args->getArgument('since');
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $since);
        $sessionId = $args->getOption('session-id');
        if (!ctype_digit($templateId) || (int)$templateId < 1 || !$date || $date->format('Y-m-d') !== $since
            || ($sessionId !== null && (!ctype_digit($sessionId) || (int)$sessionId < 1))) {
            $io->err('ID o data non validi; usare ID positivi e una data YYYY-MM-DD.');
            return self::CODE_ERROR;
        }
        if (!$this->fetchTable('FormTemplates')->exists(['id' => (int)$templateId])) {
            $io->err('Tipo di modulo inesistente.');
            return self::CODE_ERROR;
        }
        $forms = $this->fetchTable('Forms')->find()->where([
            'form_template_id' => (int)$templateId,
            'date_submitted >=' => $since,
            'state !=' => 'draft',
        ])->orderBy(['date_submitted' => 'DESC', 'id' => 'DESC']);
        $defenses = $this->fetchTable('ThesisDefenses');
        if (!$defenses->getSchema()->hasColumn('source_form_id')) {
            $io->err('Eseguire prima bin/cake migrations migrate.');
            return self::CODE_ERROR;
        }
        $importer = new LegacyThesisDefenseImporter($this->getTableLocator());
        $counts = ['converted' => 0, 'skipped' => 0, 'duplicates' => 0, 'errors' => 0];
        $dryRun = (bool)$args->getOption('dry-run');
        $connection = $defenses->getConnection();
        $connection->enableSavePoints(true);
        // The outer transaction makes a simulation detect conflicts between imported forms too.
        if ($dryRun) {
            $connection->begin();
        }
        $latestForms = [];
        try {
            foreach ($forms as $form) {
                try {
                    $session = $importer->resolveSession(
                        $form, $args->getArgument('type'), $sessionId === null ? null : (int)$sessionId,
                    );
                    $key = $form->user_id . ':' . $session->id;
                    if (isset($latestForms[$key])) {
                        $counts['duplicates']++;
                        $io->warning("Modulo {$form->id}: duplicato ignorato; mantenuto il modulo più recente {$latestForms[$key]} (studente {$form->user_id}, appello {$session->id}).");
                        continue;
                    }
                    // Reserve the latest submission even if its conversion fails: never fall back silently.
                    $latestForms[$key] = $form->id;
                    if ($defenses->exists(['source_form_id' => $form->id])) {
                        $counts['skipped']++;
                        $io->out("Modulo {$form->id}: già convertito.");
                        continue;
                    }
                    $defense = $connection->transactional(fn () => $importer->convert(
                        $form, $args->getArgument('type'), (int)$session->id,
                    ));
                    $counts['converted']++;
                    $io->out("Modulo {$form->id}: " . ($dryRun ? 'convertibile' : "creata domanda {$defense->id}") . ".");
                } catch (Throwable $e) {
                    $counts['errors']++;
                    $io->err("Modulo {$form->id}: {$e->getMessage()}");
                }
            }
        } finally {
            if ($dryRun) {
                $connection->rollback();
            }
        }
        $io->out(($dryRun ? 'SIMULAZIONE — ' : '') . "Convertiti: {$counts['converted']}; già convertiti: {$counts['skipped']}; errori: {$counts['errors']}; duplicati ignorati: {$counts['duplicates']}.");
        return $counts['errors'] ? self::CODE_ERROR : self::CODE_SUCCESS;
    }
}
