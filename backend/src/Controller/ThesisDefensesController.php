<?php
namespace App\Controller;

use Cake\Datasource\ConnectionManager;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use Cake\I18n\FrozenTime;

class ThesisDefensesController extends AppController
{
    public function index()
    {
        $this->requireAdmin();
        $defenses = $this->ThesisDefenses->find()
            ->contain(['Users', 'DegreeSessions', 'DegreeSessions.Degrees', 'ThesisDefenseAdvisors'])
            ->order(['DegreeSessions.start_date' => 'DESC', 'ThesisDefenses.created' => 'DESC']);

        $state = $this->request->getQuery('state');
        if (in_array($state, ['submitted', 'approved', 'rejected'], true)) {
            $defenses->where(['ThesisDefenses.state' => $state]);
        }
        $this->set(compact('defenses', 'state'));
    }

    public function add()
    {
        if (!$this->user) {
            throw new ForbiddenException();
        }

        $defense = $this->ThesisDefenses->newEmptyEntity();
        if ($this->request->is('post')) {
            $data = $this->request->getData();
            $data['user_id'] = $this->user['id'];
            $data['state'] = 'submitted';
            $data['submitted_at'] = FrozenTime::now();
            $data['thesis_defense_advisors'] = array_values(array_filter(
                $data['thesis_defense_advisors'] ?? [],
                fn($advisor) => !empty(trim($advisor['name'] ?? '')) || !empty(trim($advisor['email'] ?? ''))
            ));
            $defense = $this->ThesisDefenses->patchEntity($defense, $data, [
                'associated' => ['ThesisDefenseAdvisors'],
            ]);

            if (count($data['thesis_defense_advisors']) === 0) {
                $defense->setError('thesis_defense_advisors', ['required' => 'Inserire almeno un relatore.']);
            }

            $files = array_values(array_filter(
                $this->request->getData('attachments') ?? [],
                fn($file) => $file && $file->getError() !== UPLOAD_ERR_NO_FILE
            ));

            if (!$defense->hasErrors()) {
                $connection = ConnectionManager::get('default');
                try {
                    $connection->transactional(function () use ($defense, $files): void {
                        $this->ThesisDefenses->saveOrFail($defense, [
                            'associated' => ['ThesisDefenseAdvisors'],
                        ]);
                        foreach ($files as $file) {
                            if ($file->getError() !== UPLOAD_ERR_OK) {
                                throw new \RuntimeException('Caricamento allegato non riuscito.');
                            }
                            $attachment = $this->ThesisDefenses->ThesisDefenseAttachments->newEntity([
                                'thesis_defense_id' => $defense->id,
                                'filename' => $file->getClientFilename(),
                                'mimetype' => $file->getClientMediaType() ?: 'application/octet-stream',
                                'data' => $file->getStream()->getContents(),
                            ]);
                            $this->ThesisDefenses->ThesisDefenseAttachments->saveOrFail($attachment);
                        }
                    });
                    $this->Flash->success('Domanda di partecipazione inviata.');
                    return $this->redirect(['controller' => 'Users', 'action' => 'view']);
                } catch (\Exception $e) {
                    $this->log($e->getMessage());
                    $this->Flash->error('Impossibile inviare la domanda. Controllare i dati inseriti.');
                }
            } else {
                $this->Flash->error('Controllare i dati inseriti.');
            }
        }

        $sessions = $this->ThesisDefenses->DegreeSessions->find('list', [
            'keyField' => 'id',
            'valueField' => function ($session) {
                return $session->degree->name . ' — ' . $session->name . ' (' . $session->start_date->format('d/m/Y') . ')';
            },
        ])->contain(['Degrees'])->where(['DegreeSessions.start_date >=' => date('Y-m-d')])
          ->order(['DegreeSessions.start_date' => 'ASC']);
        $this->set(compact('defense', 'sessions'));
    }

    public function view($id)
    {
        $defense = $this->getDefense($id);
        $this->assertCanView($defense);
        $this->set(compact('defense'));
    }

    public function manage($id)
    {
        $this->requireAdmin();
        $defense = $this->getDefense($id);

        if ($this->request->is(['post', 'put', 'patch'])) {
            $allowed = array_intersect_key($this->request->getData(), array_flip([
                'state', 'scheduled_at', 'venue',
            ]));
            if (!empty($allowed['scheduled_at'])) {
                $allowed['scheduled_at'] = (new FrozenTime($allowed['scheduled_at'], $this->Caps['timezone']))
                    ->setTimezone('UTC');
            }
            $allowed['managed_at'] = FrozenTime::now();
            $defense = $this->ThesisDefenses->patchEntity($defense, $allowed);
            if ($this->ThesisDefenses->save($defense)) {
                $this->Flash->success('Domanda aggiornata.');
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error('Impossibile aggiornare la domanda.');
        }
        $this->set(compact('defense'));
    }

    public function attachment($id)
    {
        $attachment = $this->ThesisDefenses->ThesisDefenseAttachments->get($id, [
            'contain' => ['ThesisDefenses'],
        ]);
        $this->assertCanView($attachment->thesis_defense);
        $this->response = $this->response
            ->withType($attachment->mimetype)
            ->withDownload($attachment->filename)
            ->withStringBody(stream_get_contents($attachment->data));
        return $this->response;
    }

    private function getDefense($id)
    {
        return $this->ThesisDefenses->get($id, ['contain' => [
            'Users', 'DegreeSessions', 'DegreeSessions.Degrees',
            'ThesisDefenseAdvisors', 'ThesisDefenseAttachments',
        ]]);
    }

    private function assertCanView($defense): void
    {
        if (!$this->user || (!$this->user['admin'] && $this->user['id'] !== $defense->user_id)) {
            throw new ForbiddenException();
        }
    }

    private function requireAdmin(): void
    {
        if (!$this->user || !$this->user['admin']) {
            throw new ForbiddenException();
        }
    }
}
