<?php
namespace App\Controller;

use App\Model\Entity\Form;
use App\Controller\AppController;
use App\Form\FormsFilterForm;
use Cake\Http\Exception\ForbiddenException;
use Cake\Http\Exception\NotFoundException;
use Cake\I18n\Time;
use Cake\Mailer\Email;


class FormsController extends AppController
{    
    public function index()
    {
        $forms = $this->Forms->find()
            ->contain([ 'Users', 'FormTemplates' ]);

        if ($this->user['admin']) {
            // admin può vedere tutti i proposal
        } else {
            // posso vedere solo i miei proposal
            $forms = $forms->where(['Users.id' => $this->user['id']]);
        }

        $filterForm = new FormsFilterForm($forms);
        $forms = $filterForm->validate_and_execute($this->request->getQuery());

        if ($this->request->is("post")) {
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }

            $action = null;
            foreach (['approve', 'reject', 'resubmit', 'redraft', 'delete'] as $i) {
                if ($this->request->getData($i)) {
                    if ($action) {
                        $this->Flash->error(__('Richiesta non valida'));
                        return $this->redirect($this->referer());
                    }
                    $action = $i;
                }
            }

            if ($action) {
                $context = [
                  'approve' => [
                      'state' => 'approved',
                      'plural' => __('approvati'),
                      'singular' => __('approvato')
                  ],
                  'reject' => [
                      'state' => 'rejected',
                      'plural' => __('rifiutati'),
                      'singular' => __('rifiutato')
                  ],
                  'resubmit' => [
                      'state' => 'submitted',
                      'plural' => __('risottomessi'),
                      'singular' => __('risottomesso')
                  ],
                  'redraft' => [
                      'state' => 'draft',
                      'plural' => __('riportati in bozza'),
                      'singular' => __('riportato in bozza')
                  ],
                  'delete' => [
                      'plural' => __('eliminati'),
                      'singular' => __('eliminato')
                  ]][$action];

                $selected = $this->request->getData('selection');
                if (!$selected) {
                    $this->Flash->error(__('Nessun modulo selezionato'));
                    return $this->redirect($this->referer());
                }

                $count = 0;
                foreach ($selected as $form_id) {
                    $form = $this->Forms->get($form_id);
                    if ($action === 'delete') {
                        if ($this->Forms->delete($form)) {
                            $count++;
                        }
                    } else {
                        $form['state'] = $context['state'];

                        switch ($context['state']) {
                            case 'approved': // cascade
                            case 'rejected':
                                $form['managed_date'] = Time::now();
                                break;
                        }

                        if ($this->Forms->save($form)) {
                            if ($context['state'] == 'approved') {
                                $this->notifyApproval($form['id']);
                            }
                            if ($context['state'] == 'rejected') {
                                $this->notifyRejection($form['id']);
                            }

                            $count++;
                        }
                    }
                }
                if ($count > 1) {
                    $this->Flash->success(__('{count} moduli {what}', ['count' => $count, 'what' => $context['plural']]));
                } elseif ($count == 1) {
                    $this->Flash->success(__('modulo {what}', ['what' => $context['singular']]));
                } else {
                    $this->Flash->success(__('Nessun modulo {what}', ['what' => $context['singular']]));
                }

                return $this->redirect([]);
            }
        }

        $this->set('data', $forms);
        $this->viewBuilder()->setOption('serialize', 'data');
        $this->set('filterForm', $filterForm);
        $this->set('forms', $this->paginate($forms->cleanCopy()));
        $this->set('selected', 'index');
    }  

    public function edit($form_id = null)
    {
        if (!$this->user) throw new ForbiddenException();

        if ($form_id == null) {
            $form = new Form();
            $form->user = $this->user;
            $form->state = 'draft';
        } else {
            $form = $this->Forms->find()->contain([
                'Users'])
                ->where(['Forms.id' => $form_id])
                ->firstOrFail();

            // Check if the user has permission
            if ($form['user']['id'] != $this->user['id']) {
                throw new ForbiddenException();
            }
        }

        if ($form['state'] != 'draft') {
            throw new ForbiddenException();
        }

        if ($this->request->is('post')) {
            $data = $this->request->getData();
            $form = $this->Forms->patchEntity($form, $data);
            $form->user_id = $this->user['id'];
            if ($data['action'] == 'submit') {
                $form->date_submitted = Time::now();
                $form->state = "submitted";
            } else {
                $form->state = "draft";
            }

            if ($this->Forms->save($form)) {
                if ($form['state'] == "submitted") {
                    if ($this->notifySubmission($form['id'])) {
                        $this->Flash->success("Ho inviato un email di notifica");
                    } else {
                        $this->Flash->error("Non sono riuscito ad inviare l'email di notifica");
                    }
                }
                return $this->redirect([ 'controller' => 'users', 'action' => 'view' ]);
            } else {
                foreach ($form->errors() as $field => $errors) {
                    foreach ($errors as $error) {
                        $this->Flash->error('Errore nel campo "' . $field . '" del modulo: ' . $error);
                    }
                }
                return $this->redirect(['action' => 'edit', $form['id']]);
            }
        }   
        $this->set('form', $form);
    }

    public function view($id) {
        $query = $this->request->getQuery();
        if (!$id) {
            throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
        }
        $form = $this->Forms->get($id, ['contain' => ['FormTemplates', 'Users']]);

        if ($form['user_id'] != $this->user['id'] && !$this->user['admin']) {
            throw new ForbiddenException();
        }

        $this->set('form', $form);
        $_serialize = [ 'form' ];
        $this->set('_serialize', $_serialize);
    }

    public function delete($id)
    {
        if (! $id) {
            throw new NotFoundException();
        }

        $form = $this->Forms->get($id, ['contain' => [ 'Users' ]]);

        // Check that the user matches, otherwise he/she may not be allowed to see, let alone delete
        // the given form.
        if ($form['user']['id'] != $this->user['id'] && !$this->user['admin']) {
            throw new ForbiddenException('Utente non autorizzato a eliminare questo modulo');
        }

        if ($form['state'] != 'draft') {
            throw new ForbiddenException('Impossibile eliminare un modulo se non è in stato \'bozza\'');
        }

        if ($this->Forms->delete($form)) {
            $this->Flash->success('Modulo eliminato');
        } else {
            $this->log('Errore nella cancellazione del modulo con ID = ' . $form['id']);
            $this->Flash->error('Impossibile eliminare il modulo');
        }

        return $this->redirect([ 'controller' => 'forms', 'action' => 'view' ]);
    }

    private function get_form($id)
    {
        return $this->Forms->get($id, [
            "contain" => [ 'Users', 'FormTemplates']
            ]);
    }

    private function createEmail($form)
    {
        $email = new Email();

        // Find the address that need to be notified in Cc, if any
        $cc_addresses = array_map(
            function ($address) {
                return trim($address);
            },
            explode(',', $form['form_template']['notify_emails'])
        );
        $cc_addresses = array_filter($cc_addresses, function ($address) {
            return trim($address) != "";
        });
        if (count($cc_addresses) > 0) {
            $email->addCc($cc_addresses);
        }

        $email->setViewVars([ 'settings' => $this->getSettings(), 'form' => $form ])
            ->setEmailFormat('html');

        return $email;
    }

    private function notify($form_id, $template_name, $subject): bool
    {
        $form = $this->get_form($form_id);

        if ($form['user']['email'] == "" || $form['user']['email'] == null) {
            return False;
        }

        $email = $this->createEmail($form)
            ->setTo($form['user']['email'])
            ->setSubject($subject);
        $email->viewBuilder()->setTemplate($template_name);
        try {
            $email->send();
            return True;
        } catch (\Exception $e) {
            $this->log("Could not send email: " . $e->getMessage());
            return False;
        }
    }

    private function notifySubmission($form_id): bool {
        return $this->notify($form_id, 'form_submission', 'modulo inviato');
    }

    private function notifyApproval($form_id): bool {
        return $this->notify($form_id, 'form_approval', 'richiesta approvata');
    }

    private function notifyRejection($form_id): bool {
        return $this->notify($form_id, 'form_rejection', 'modulo inviato');
    }

}

