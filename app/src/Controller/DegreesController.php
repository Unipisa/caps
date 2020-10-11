<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\ORM\TableRegistry;

/**
 * Degrees Controller
 *
 * @property \App\Model\Table\DegreesTable $Degrees
 *
 * @method \App\Model\Entity\Degree[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class DegreesController extends AppController
{
    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    {
        $degrees = $this->Degrees->find();

        if ($this->request->is("post")) {
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }

            if ($this->request->getData('delete')) {
                $selected = $this->request->getData('selection');
                if (!$selected) {
                    $this->Flash->error(__('nessun corso selezionato'));

                    return $this->redirect(['action' => 'index']);
                }

                $delete_count = 0;
                foreach ($selected as $degree_id) {
                    if ($this->deleteIfNotUsed($degree_id)) {
                        $delete_count++;
                    }
                }
                if ($delete_count > 1) {
                    $this->Flash->success(__('{delete_count} corsi cancellati con successo', ['delete_count' => $delete_count]));
                } elseif ($delete_count == 1) {
                    $this->Flash->success(__('corso cancellato con successo'));
                } else {
                    $this->Flash->success(__('nessun corso cancellato'));
                }

                return $this->redirect(['action' => 'index']);
            }
        }

        $paginated_degrees = $this->paginate($degrees->cleanCopy());
        $this->set(compact('degrees', 'paginated_degrees'));
        $this->set('_serialize', [ 'degrees' ]);
    }

    /**
     * View method
     *
     * @param string|null $id Degree id.
     * @return \Cake\Http\Response|null
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function view($id = null)
    {
        $degree = $this->Degrees->get($id, [
            'contain' => ['Curricula']
        ]);

        $this->set('degree', $degree);
    }

    /**
     * Edit method
     *
     * @param string|null $id Degree id.
     * @return \Cake\Http\Response|null Redirects on successful edit, renders view otherwise.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function edit($id = null)
    {
        if ($id != null) {
            $degree = $this->Degrees->get($id);
        } else {
            $degree = $this->Degrees->newEntity();
        }

        if ($this->request->is(['patch', 'post', 'put'])) {
            $degree = $this->Degrees->patchEntity($degree, $this->request->getData());

            if ($this->Degrees->save($degree)) {
                $this->Flash->success(__('Il corso di laurea è stato salvato'));

                return $this->redirect(['action' => 'index']);
            } else {
                $this->Flash->error(__('Impossibile salvare il corso di laurea'));
            }
        }
        $this->set(compact('degree'));
    }

    /**
     * Delete method
     *
     * @param string|null $id Degree id.
     * @return \Cake\Http\Response|null Redirects to index.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function delete($id = null)
    {
        if (!$this->user['admin']) {
            throw new ForbiddenException();
        }

        if ($this->deleteIfNotUsed($id)) {
            $this->Flash->success(__('Il corso di laurea è stato cancellato.'));
        }

        return $this->redirect(['action' => 'index']);
    }

    protected function deleteIfNotUsed($degree_id)
    {
        $degree = $this->Degrees->findById($degree_id)->firstOrFail();
        $use_count = 0;
        foreach (['Curricula'] as $related_table) {
            $use_count += TableRegistry::getTableLocator()->get($related_table)->find('all')
                ->where(['degree_id' => $degree_id])
                ->count();
        }
        if ($use_count > 0) {
            $this->Flash->error(__(
                'Il corso {name} non può essere rimosso perché viene utilizzato {count} volte',
                ['name' => $degree['name'], 'count' => $use_count]
            ));

            return false;
        }
        if (!$this->Degrees->delete($degree)) {
            $this->Flash->error(__('Cancellazione non riuscita'));

            return false;
        }

        return true;
    }
}
