<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;

/**
 * Attachment Controller
 *
 * @property \App\Model\Table\AttachmentsTable $Attachments
 *
 * @method \App\Model\Entity\Attachment[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class AttachmentsController extends AppController
{
    /**
     * View method
     *
     * @param string|null $id Attachment id.
     * @return \Cake\Http\Response|null
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function view($id = null)
    {
        $attachment = $this->Attachments->get($id, [
            'contain' => ['Users', 'Proposals', 'Proposals.Users' ]
        ]);

        if (! $this->user || ! $this->user->canViewAttachment($attachment)) {
            throw new ForbiddenException('Impossibile visualizzare il file selezionato');
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
        $attachment = $this->Attachments->newEntity();

        if ($this->request->is('post')) {
            $user = $this->Attachments->Users->find()->where([ 'username' => $this->user['username'] ])->firstOrFail();
            $attachment['user_id'] = $user['id'];
            $attachment['proposal_id'] = $this->request->getData('proposal_id');
            $attachment['comment'] = $this->request->getData('comment');

            $secret = $this->request->getData('secret');
            $data = $this->request->getData('data');

            if ($data['tmp_name'] == "" && $attachment['comment'] == "") {
                $this->Flash->error('Selezionare un file da caricare, o inserire un commento');
                return $this->redirect([
                    'controller' => 'proposals',
                    'action' => 'view',
                    $attachment['proposal_id']
                ]);
            }

            if ($data['tmp_name'] != "") {
                $attachment['data'] = fopen($data['tmp_name'], 'r');

                if ($attachment['data'] == "") {
                    $this->Flash->error('Impossibile caricare un file vuoto');
                    return $this->redirect([
                        'controller' => 'proposals',
                        'action' => 'view',
                        $attachment['proposal_id']
                    ]);
                }

                $attachment['mimetype'] = $data['type'];
                $attachment['filename'] = $data['name'];
            }

            // Check that the user owns the given proposal, or is an adminstrator
            $proposal = $this->Attachments->Proposals->get($attachment['proposal_id'], [
                'contain' => [ 'Users', 'ProposalAuths' ]
            ]);

            if (! $this->user || ! $this->user->canAddAttachment($proposal, $secret)) {
                throw new ForbiddenException('Impossibile allegare file a questo piano');
            }

            if ($this->Attachments->save($attachment)) {
                $this->Flash->success(__('The attachment has been saved.'));
            }
            else {
                $this->Flash->error(__('The attachment could not be saved. Please, try again.'));
            }

            return $this->redirect([
                        'controller' => 'proposals',
                        'action' => 'view',
                        $attachment['proposal_id'],
                        "secret" => $secret
                    ]
                );
        }
        else {
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
    public function delete($id = null, $secret = null)
    {
        $attachment = $this->Attachments->get($id, [
            'contain' => [ 'Users', 'Proposals' ]
        ]);

        if (! $this->user || ! $this->user->canDeleteAttachment($attachment)) {
            throw new ForbiddenException('Impossibile cancellare il file selezionato');
        }

        $proposal_id = $attachment['proposal_id'];
        $user = $attachment['user'];

        if ($this->Attachments->delete($attachment)) {
            $this->Flash->success(__('The attachment has been deleted.'));
        } else {
            $this->Flash->error(__('The attachment could not be deleted. Please, try again.'));
        }

        return $this->redirect([
            'controller' => 'proposals',
            'action' => 'view',
            $proposal_id,
            "secret" => $secret
        ]);
    }
}
