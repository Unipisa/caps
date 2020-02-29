<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Form\ExamsFilterForm;

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
        $exams = $this->Exams->find()
            ->order([ 'Exams.name' => 'asc' ]);

        $filterForm = new ExamsFilterForm($exams);
        $filterData = $this->request->getQuery();
        if (!key_exists('name', $filterData) || !$filterForm->validate($filterData)) {
          // no filter form provided or data not valid: set defaults:
          $filterData = [
            'name' => '',
            'code' => '',
            'sector' => '',
            'credits' => null
          ];
        }
        $exams = $filterForm->execute($filterData);
        $this->set('filterForm', $filterForm);

        if ($this->request->is("post")) {
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }
            if ($this->request->getData('payload')) {
                // csv bulk upload
                $good_count = 0;
                $bad_count = 0;
                $payload = json_decode($this->request->getData()['payload'], True);
                $exams = $this->Exams->newEntities($payload);
                $result = $this->Exams->saveMany($exams);
                if ($result) {
                    $this->Flash->success('Inseriti ' . count($result) . ' esami.');
                    return $this->redirect([ 'action' => 'index']);
                    // ok! redirect?
                } else {
                    // collect error messages
                    foreach ($exams as $exam) {
                      foreach ($exam->errors() as $field => $errors) {
                        foreach ($errors as $error) {
                          $this->Flash->error('Errore nel campo "'.$field.'" dell\'esame "'.$exam['name'].'" '.$error);
                        }
                      }
                    }
                    // debug($payload);
                    // debug($exams);
                    // debug($result);
                }
            }

            if ($this->request->getData('delete')) {
                $selected = $this->request->getData('selection');
                if (!$selected) {
                    $this->Flash->error(__('nessun esame selezionato'));
                    return $this->redirect(['action' => 'index']);
                }

                $delete_count = 0;
                foreach($selected as $exam_id) {
                    if ($this->deleteIfNotUsed($exam_id)) {
                        $delete_count ++;
                    }
                }
                if ($delete_count > 1) {
                    $this->Flash->success(__('{delete_count} esami cancellati con successo', ['delete_count' => $delete_count]));
                } else if ($delete_count == 1) {
                    $this->Flash->success(__('esame cancellato con successo'));
                } else {
                    $this->Flash->success(__('nessun esame cancellato'));
                }
                return $this->redirect(['action' => 'index']);
            }
        }
        $this->set('exams', $exams);
        $this->set('_serialize', [ 'exams' ]);
        $this->set('paginated_exams', $this->Paginator->paginate($exams->cleanCopy()));
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
        if (!$this->user['admin']) {
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
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }
        if ($this->deleteIfNotUsed($id))
            $this->Flash->success(__('Esame cancellato con successo.'));
        return $this->redirect(['action' => 'index']);
    }

    protected function deleteIfNotUsed($exam_id) {
        $exam = $this->Exams->findById($exam_id)->firstOrFail();
        $use_count = 0;
        foreach(['ChosenExams', 'CompulsoryExams'] as $related_table) {
            $use_count += TableRegistry::getTableLocator()->get($related_table)->find('all')
                ->where(['exam_id' => $exam_id])
                ->count();
        }
        if ($use_count>0) {
            $this->Flash->error(__('L\'esame {code} non può essere rimosso perché viene utilizzato {count} volte',
            ['code' => $exam['codice'], 'count' => $use_count]));
            return False;
        }
        if (!$this->Exams->delete($exam)) {
            $this->Flash->error(__('Cancellazione non riuscita'));
            return False;
        }
        return True;
    }

}

?>
