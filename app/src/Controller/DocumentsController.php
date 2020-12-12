<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */
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

        // Only administrators can see documents
        if ($this->user['admin']) {
            return $this->response
                ->withStringBody(stream_get_contents($document['data']))
                ->withType($document['mimetype'])
                ->withDownload($document['filename']);
        } else {
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
            } else {
                $document['filename'] = null;
            }

            // We check that the uploading user is an administrator
            if ($this->user['admin']) {
                if ($this->Documents->save($document)) {
                    $this->Flash->success(__('Il documento è stato salvato'));
                } else {
                    $this->Flash->error(__('Impossibile salvare il documento'));
                }

                return $this->redirect([
                    'controller' => 'users',
                    'action' => 'view',
                    $document['user_id']
                ]);
            } else {
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
        if ($this->user['admin']) {
            if ($this->Documents->delete($document)) {
                $this->Flash->success(__('Il documento è stato eliminato.'));
            } else {
                $this->Flash->error(__('Il documento non è stato eliminato.'));
            }
        } else {
            $this->Flash->error(__("Impossibile eliminare il documento."));
        }

        return $this->redirect([
            'controller' => 'users',
            'action' => 'view',
            $user_id
        ]);
    }

    public function signatures($id = null) {
        $document = $this->Documents->get($id);
        /* come controllo i permessi?!?
        if (! $this->user || ! $this->user->canViewAttachment($attachment))
        */
        if (!$this->user['admin']) {
            throw new ForbiddenException('Impossibile visualizzare il file selezionato');
        }
        $signatures = $document->signatures();
        $this->set('signatures', $signatures);
        $this->set('_serialize', [ 'signatures' ]);
    }
}