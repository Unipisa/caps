<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Http\Exception\ForbiddenException;

/**
 * Documents Controller
 *
 * @property \App\Model\Table\DocumentsTable $Documents
 *
 * @method \App\Model\Entity\Document[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class DocumentsController extends AppController
{

    /**
     * View method
     *
     * @param string|null $id Document id.
     * @return \Cake\Http\Response|null
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function view($id = null)
    {
        $document = $this->Documents->get($id, [
            'contain' => ['Users']
        ]);

        // Only the user relative to the document, its owner,
        //  and administrators are allowed to view the document.
        if ($document['user_id'] == $this->user['id'] ||
            $this->user['admin'] ||
            $document['owner_id'] == $this->user['id']) {
            return $this->response
                ->withStringBody(stream_get_contents($document['data']))
                ->withType($document['mimetype'])
                ->withDownload($document['filename']);
        }
        else {
            throw new ForbiddenException('Impossibile visualizzare il file selezionato');
        }
    }

    /**
     * Add method
     *
     * @return \Cake\Http\Response|null Redirects on successful add, renders view otherwise.
     */
    public function add()
    {
        $document = $this->Documents->newEntity();

        if ($this->request->is('post')) {
            // We make sure that the owner is set correctly, and we do not trust any input
            // coming from the user.
            $document['owner_id'] = $this->user['id'];
            $document['user_id']  = $this->request->getData('user_id');
            $document['comment'] = $this->request->getData('comment');
            $data = $this->request->getData('data');

            if ($data['tmp_name'] == "" && $document['comment'] == "") {
                $this->Flash->error('Selezionare un file da caricare, o inserire un commento');
                return $this->redirect([
                    'controller' => 'users',
                    'action' => 'view',
                    $document['user_id']
                ]);
            }

            if ($data['tmp_name'] != "") {
                $document['data'] = fopen($data['tmp_name'], 'r');

                if ($document['data'] == "") {
                    $this->Flash->error('Impossibile caricare un file vuoto');
                    return $this->redirect([
                        'controller' => 'users',
                        'action' => 'view',
                        $document['user_id']
                    ]);
                }

                $document['mimetype'] = $data['type'];
                $document['filename'] = $data['name'];
            }
            else {
                $document['filename'] = null;
            }


            // We check that the uploading user is either the target of the document,
            // or an administrator
            if ($this->user['admin'] || $this->user['id'] == $document['user_id']) {
                if ($this->Documents->save($document)) {
                    $this->Flash->success(__('Il documento è stato salvato'));
                }
                else {
                    $this->Flash->error(__('Impossibile salvare il documento'));
                }

                return $this->redirect([
                    'controller' => 'users',
                    'action' => 'view',
                    $document['user_id']
                ]);
            }
            else {
                throw new ForbiddenException("Impossibile caricare un documento per questo utente");
            }
        }

        throw new ForbiddenException("Metodo GET non supportato");
    }

    /**
     * Delete method
     *
     * @param string|null $id Document id.
     * @return \Cake\Http\Response|null Redirects to index.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function delete($id = null)
    {
        $this->request->allowMethod(['post', 'delete']);
        $document = $this->Documents->get($id);

        $user_id = $document['user_id'];

        // Check for permissions to delete this object
        if ($this->user['admin'] ||
            $this->user['id'] == $document['owner_id']) {

            if ($this->Documents->delete($document)) {
                $this->Flash->success(__('Il documento è stato eliminato.'));
            } else {
                $this->Flash->error(__('Il documento non è stato eliminato.'));
            }
        }
        else {
            $this->Flash->error(__("Impossibile eliminare il documento."));
        }

        return $this->redirect([
            'controller' => 'users',
            'action' => 'view',
            $user_id
        ]);
    }
}
