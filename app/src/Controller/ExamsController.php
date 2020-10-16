<?php

namespace App\Controller;

use App\Auth\UnipiAuthenticate;
use App\Controller\Event;
use Cake\ORM\TableRegistry;
use Cake\Http\Exception\ForbiddenException;
use App\Form\ExamsFilterForm;

class ExamsController extends AppController
{
    public $paginate = [
        'limit' => 15,
        'order' => [
            'Exams.name' => 'asc'
        ]
    ];

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

    public function beforeFilter($event)
    {
        parent::beforeFilter($event);
        $this->Auth->deny();
    }

    public function index()
    {
        $exams = $this->Exams->find()
            ->order([ 'Exams.name' => 'asc' ])
            ->contain([ 'Tags']);

        $filterForm = new ExamsFilterForm($exams);
        $exams = $filterForm->validate_and_execute($this->request->getQuery());
        $this->set('filterForm', $filterForm);

        if ($this->request->is("post")) {
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }
            if ($this->request->getData('payload')) {
                // csv bulk upload
                $good_count = 0;
                $bad_count = 0;
                $payload = json_decode($this->request->getData()['payload'], true);
                $exams = $this->Exams->newEntities($payload);
                $result = $this->Exams->saveMany($exams);
                if ($result) {
                    $this->Flash->success('Inseriti ' . count($result) . ' esami.');
                } else {
                    // collect error messages
                    foreach ($exams as $exam) {
                        foreach ($exam->errors() as $field => $errors) {
                            foreach ($errors as $error) {
                                $this->Flash->error('Errore nel campo "' . $field . '" dell\'esame "' . $exam['name'] . '" ' . $error);
                            }
                        }
                    }
                    // debug($payload);
                    // debug($exams);
                    // debug($result);
                }

                return $this->redirect([ 'action' => 'index']);
            }

            if ($this->request->getData('delete')) {
                $selected = $this->request->getData('selection');
                if (!$selected) {
                    $this->Flash->error(__('nessun esame selezionato'));

                    return $this->redirect(['action' => 'index']);
                }

                $delete_count = 0;
                foreach ($selected as $exam_id) {
                    if ($this->deleteIfNotUsed($exam_id)) {
                        $delete_count++;
                    }
                }
                if ($delete_count > 1) {
                    $this->Flash->success(__('{delete_count} esami cancellati con successo', ['delete_count' => $delete_count]));
                } elseif ($delete_count == 1) {
                    $this->Flash->success(__('esame cancellato con successo'));
                } else {
                    $this->Flash->success(__('nessun esame cancellato'));
                }

                return $this->redirect(['action' => 'index']);
            }
        }
        $this->set('exams', $exams);
        $this->set('_serialize', [ 'exams' ]);
        $this->set('paginated_exams', $this->paginate($exams->cleanCopy()));
    }

    /**
     * @brief Get a single exam in JSON format. URL: caps/exams/view/1.json
     */
    public function view($id = null)
    {
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }

        $exam = $this->Exams->get($id, [
            'contain' => 'Tags'
        ]);

        $this->set('exam', $exam);
        $this->set('_serialize', [ 'exam' ]);
    }

    public function edit($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($id) { // edit
            $exam = $this->Exams->get($id, [
                'contain' => [ 'Groups', 'Tags' ]
            ]);
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

            // If there are new tags to add, do it
            foreach (explode(',', $this->request->getData('new-tags')) as $tag) {
                $tag = trim($tag);
                if ($tag != "") {
                    $t = $this->Exams->Tags->newEntity();
                    $t['name'] = $tag;
                    $exam['tags'][] = $t;
                }
            }

            // If the code is '', make it null => this works on MySQL that allows
            // multiple null keys even when forced to be unique.
            if ($exam->code == '') {
                $exam->code = null;
            }

            if ($this->Exams->save($exam)) {
                $this->Flash->success($success_message);

                // If an exam is saved, we may have to cleanup the tags, so that the unused ones get
                // removed from the database.
                foreach ($this->Exams->Tags->find('all')->contain([ 'Exams' ]) as $tag) {
                    if (count($tag['exams']) == 0) {
                        $this->Exams->Tags->delete($tag);
                    }
                }

                return $this->redirect(['action' => $then]);
            }
            $this->Flash->error($failure_message);
        }

        $this->set('exam', $exam);
        $this->set('tags', $this->Exams->Tags->find('list'));
        $this->set('groups', $this->Exams->Groups->find('list'));
    }

    public function delete($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }
        if ($this->deleteIfNotUsed($id)) {
            $this->Flash->success(__('Esame cancellato con successo.'));
        }

        return $this->redirect(['action' => 'index']);
    }

    protected function deleteIfNotUsed($exam_id)
    {
        $exam = $this->Exams->findById($exam_id)->firstOrFail();
        $use_count = 0;
        foreach (['ChosenExams', 'CompulsoryExams'] as $related_table) {
            $use_count += TableRegistry::getTableLocator()->get($related_table)->find('all')
                ->where(['exam_id' => $exam_id])
                ->count();
        }
        if ($use_count > 0) {
            $this->Flash->error(__(
                'L\'esame {code} non può essere rimosso perché viene utilizzato {count} volte',
                ['code' => $exam['codice'], 'count' => $use_count]
            ));

            return false;
        }
        if (!$this->Exams->delete($exam)) {
            $this->Flash->error(__('Cancellazione non riuscita'));

            return false;
        }

        return true;
    }
}
