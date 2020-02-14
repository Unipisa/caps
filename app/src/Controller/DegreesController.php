<?php
namespace App\Controller;

use App\Controller\AppController;

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
        $degrees = $this->paginate($this->Degrees);
        $this->set(compact('degrees'));
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
        if ($id) {
          $degree = $this->Degrees->get($id, [
              'contain' => []
          ]);
        } else {
          $degree = $this->Degrees->newEntity();
        }
        if ($this->request->is(['patch', 'post', 'put'])) {
            $degree = $this->Degrees->patchEntity($degree, $this->request->getData());
            if ($this->Degrees->save($degree)) {
                $this->Flash->success(__('Il corso di laurea è stato salvato'));
                return $this->redirect(['action' => 'index']);
            }
            else {
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
    public function adminDelete($id = null)
    {
        $this->request->allowMethod(['post', 'delete']);
        $degree = $this->Degrees->get($id);

        if ($this->Degrees->delete($degree)) {
            $this->Flash->success(__('Il corso di laurea è stato cancellato.'));
        } else {
            $this->Flash->error(__('Non è stato possibile cancellare il corso di laurea.'));
        }

        return $this->redirect(['action' => 'index']);
    }
}
