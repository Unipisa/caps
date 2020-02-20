<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;

class ExamsController extends AppController {

    public function initialize()
    {
        parent::initialize();
        $this->loadComponent('Paginator');
        $this->loadComponent('RequestHandler');
    }

    private function exams()
    {
        return $this->Exams->find()
            ->order([ 'Exams.name' => 'asc' ]);
    }

    public function beforeFilter ($event) {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function index () {
        $user = $this->Auth->user();
        $this->set('exams', $this->exams());
        $this->set('_serialize', [ 'exams' ]);
        $this->set('paginated_exams', $this->Paginator->paginate($this->exams()->limit(4)));
    }

    /**
     * @brief Get a single exam in JSON format. URL: caps/exams/view/1.json
     */
    public function view ($id = null) {
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $exam = $this->Exams->findById($id)->firstOrFail();
        if (!$exam) {
            throw new NotFoundException(__('Errore: esame non esistente.'));
        }
        $this->set('exam', $exam);
    }

    public function edit($id = null) {
        $user =  $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if ($id) { // edit
            $exam = $this->Exams->findById($id)->contain([ 'Groups' ])->firstOrFail();
            if (!$exam) {
                throw new NotFoundException(__('Errore: esame non esistente.'));
            }
            $success_message = __('Esame aggiornato con successo.');
            $failure_message = __('Errore: esame non aggiornato.');
            $then = 'index';
        } else { // new
            $exam = $this->Exams->newEntity();
            $success_message = __('Esame aggiunto con successo.');
            $failure_message = __('Errore: esame non aggiunto.');
            $then = 'edit'; // questionabile: forse meglio 'index'
        }

        if ($this->request->is(['post', 'put'])) {
            $exam = $this->Exams->patchEntity($exam, $this->request->getData());
            if ($this->Exams->save($exam)) {
                $this->Flash->success($success_message);
                return $this->redirect(['action' => $then]);
            }
            $this->Flash->error($failure_message);
        }

        $this->set('exam', $exam);
        $this->set('groups', $this->Exams->Groups->find('list'));
    }

    public function delete ($id = null) {
        $user = $this->Auth->user();
        if (!$user['admin']) {
            throw new ForbiddenException();
        }

        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $exam = $this->Exams->findById($id)->firstOrFail();
        if (!$exam) {
            throw new NotFoundException(__('Errore: esame non esistente.'));
        }

        if ($this->request->is(['post', 'put'])) {
            if ($this->Exams->delete($exam)) {
                $this->Flash->success(__('Esame cancellato con successo.'));
                return $this->redirect(['action' => 'index']);
            }
        }

        $this->Flash->error(__('Error: esame non cancellato.'));
        $this->redirect(['action' => 'index']);
    }

}

?>
