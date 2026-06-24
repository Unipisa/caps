<?php
namespace App\Controller;

use Cake\Http\Exception\ForbiddenException;

class DegreeSessionsController extends AppController
{
    public function index()
    {
        $this->requireAdmin();
        $sessions = $this->DegreeSessions->find()
            ->contain(['Degrees'])
            ->order(['DegreeSessions.start_date' => 'DESC']);
        $this->set(compact('sessions'));
    }

    public function edit($id = null)
    {
        $this->requireAdmin();
        $session = $id ? $this->DegreeSessions->get($id) : $this->DegreeSessions->newEmptyEntity();

        if ($this->request->is(['post', 'put', 'patch'])) {
            $session = $this->DegreeSessions->patchEntity($session, $this->request->getData());
            if ($this->DegreeSessions->save($session)) {
                $this->Flash->success('Sessione di laurea salvata.');
                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error('Impossibile salvare la sessione di laurea.');
        }

        $degrees = $this->DegreeSessions->Degrees->find('list')
            ->order(['Degrees.academic_year' => 'DESC', 'Degrees.name' => 'ASC']);
        $this->set(compact('session', 'degrees'));
    }

    public function delete($id)
    {
        $this->requireAdmin();
        $this->request->allowMethod(['post', 'delete']);
        $session = $this->DegreeSessions->get($id);
        if ($this->DegreeSessions->delete($session)) {
            $this->Flash->success('Sessione di laurea eliminata.');
        } else {
            $this->Flash->error('La sessione non può essere eliminata perché contiene domande.');
        }
        return $this->redirect(['action' => 'index']);
    }

    private function requireAdmin(): void
    {
        if (!$this->user || !$this->user['admin']) {
            throw new ForbiddenException();
        }
    }
}
