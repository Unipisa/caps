<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
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
use App\Model\Entity\FormAttachment;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;

/**
 * FormAttachment Controller
 *
 * @property \App\Model\Table\FormAttachmentsTable $Attachments
 *
 * @method \App\Model\Entity\FormAttachment[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class FormAttachmentsController extends AppController
{
    /**
     * View method
     *
     * @param string|null $id Attachment id.
     * @return \Cake\Http\Response|null
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function view(string $id = null) : \Cake\Http\Response
    {
        $attachment = $this->FormAttachments->get($id, [
            'contain' => ['Users', 'Forms', 'Forms.Users' ]
        ]);

        if (! $this->user || ! $this->user->canViewFormAttachment($attachment)) {
            throw new ForbiddenException('Impossibile visualizzare il file selezionato');
        }

        if ($attachment['data']===null) {
            throw new NotFoundException();
        }

        return $this->response
            ->withStringBody(stream_get_contents($attachment['data']))
            ->withType($attachment['mimetype'])
            ->withDownload($attachment['filename']);
    }

    /**
     * Add method
     *
     * @return \Cake\Http\Response|null Redirects on successful add, renders view otherwise.
     */
    public function add()
    {
        $attachment = new FormAttachment();

        if ($this->request->is('post')) {
            $user = $this->Attachments->Users->find()->where([ 'username' => $this->user['username'] ])->firstOrFail();
            $attachment['user_id'] = $user['id'];
            $attachment['proposal_id'] = $this->request->getData('proposal_id');
            $attachment['comment'] = $this->request->getData('comment');

            $secrets = $this->getSecrets();
            $data = $this->request->getData('data');

            if ($data->getClientFilename() == "" && $attachment['comment'] == "") {
                $this->Flash->error('Selezionare un file da caricare, o inserire un commento');

                return $this->redirect([
                    'controller' => 'proposals',
                    'action' => 'view',
                    $attachment['proposal_id']
                ]);
            }

            if ($data->getClientFilename() != "") {
                $attachment['data'] = $data->getStream()->getContents();

                if ($attachment['data'] == "") {
                    $this->Flash->error('Impossibile caricare un file vuoto');

                    return $this->redirect([
                        'controller' => 'proposals',
                        'action' => 'view',
                        $attachment['proposal_id']
                    ]);
                }

                $attachment['mimetype'] = $data->getClientMediaType();
                $attachment['filename'] = $data->getClientFilename();
            }

            // Check that the user owns the given proposal, or is an adminstrator
            $form = $this->FormAttachments->Forms->get($attachment['form_id'], [
                'contain' => [ 'Users' ]
            ]);

            if (! $this->user || ! $this->user->canAddFormAttachment($form, $secrets)) {
                throw new ForbiddenException('Impossibile allegare file a questo piano');
            }

            if ($this->FormAttachments->save($attachment)) {
                if ($attachment['filename']) {
                    $this->Flash->success(__('L\'allegato è stato salvato'));
                } else {
                    $this->Flash->success(__('Il commento è stato salvato'));
                }
            } else {
                $this->Flash->error(__('Impossibile salvare il commento/allegato'));
            }

            return $this->redirect(
                [ 'controller' => 'forms', 'action' => 'view', $attachment['form_id'] ]
            );
        } else {
            throw new NotFoundException('Page not found');
        }
    }

    /**
     * Delete method
     *
     * @param string|null $id Attachment id.
     * @return \Cake\Http\Response|null Redirects to index.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function delete($id = null)
    {
        $attachment = $this->FormAttachments->get($id, [
            'contain' => [ 'Users', 'Forms' ]
        ]);

        if (! $this->user || ! $this->user->canDeleteFormAttachment($attachment)) {
            throw new ForbiddenException('Impossibile cancellare il file selezionato');
        }

        $form_id = $attachment['form_id'];
        $user = $attachment['user'];

        if ($this->FormAttachments->delete($attachment)) {
            $this->Flash->success(__('The attachment has been deleted.'));
        } else {
            $this->Flash->error(__('The attachment could not be deleted. Please, try again.'));
        }

        return $this->redirect([
            'controller' => 'proposals',
            'action' => 'view',
            $form_id
        ]);
    }

    public function signatures($id = null) {
        $attachment = $this->FormAttachments->get($id, [
            'contain' => [ 'Users', 'Forms', 'Forms.Users' ]
        ]);

        if (! $this->user || ! $this->user->canViewFormAttachment($attachment)) {
            throw new ForbiddenException('Impossibile visualizzare il file selezionato');
        }

        $signatures = $attachment->signatures();
        $this->set('signatures', $signatures);
        $this->viewBuilder()->setOption('serialize', [ 'signatures' ]);
    }
}
