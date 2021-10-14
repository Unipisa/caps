<?php
    namespace App\Controller;

    use App\Model\Entity\FormTemplate;
    use App\Controller\AppController;
    use Cake\Http\Exception\ForbiddenException;
    use Cake\Http\Exception\NotFoundException;

    class FormTemplatesController extends AppController
    {
        public function index()
        {
            $form_templates = $this->FormTemplates->find('all');

            $this->set('form_templates', $form_templates);
            $this->viewBuilder()->setOption('serialize', [ 'form_templates' ]);
            $this->set('paginated_form_templates', $this->paginate($form_templates->cleanCopy()));

            if ($this->request->is(['post', 'put'])) {
                // azioni sulla selezione
                // clone / delete
                if (!$this->user['admin']) {
                    throw new ForbiddenException();
                }
                $selected = $this->request->getData('selection');
                if (!$selected) {
                    $this->Flash->error(__('nessun modulo selezionato'));

                    return $this->redirect(['action' => 'index']);
                }
                if ($this->request->getData('delete')) {
                    $delete_count = 0;
                    foreach ($selected as $form_template_id) {
                        if ($this->deleteIfNotUsed($curriculum_id)) {
                            $delete_count++;
                        }
                    }
                    if ($delete_count > 1) {
                        $this->Flash->success(__('{delete_count} moduli cancellati con successo', ['delete_count' => $delete_count]));
                    } elseif ($delete_count == 1) {
                        $this->Flash->success(__('un modulo cancellato con successo'));
                    } else {
                        $this->Flash->success(__('nessun modulo cancellato'));
                    }

                    return $this->redirect(['action' => 'index']);
                }
            }
        }
    
        public function edit($id = null)
        {
            if (!$this->user['admin']) {
                throw new ForbiddenException();
            }
    
            if ($id) {
                $form_template = $this->FormTemplates->findById($id)
                    ->firstOrFail();
                if (!$form_template) {
                    throw new NotFoundException(__('Errore: curriculum non esistente.'));
                }
                $success_message = __('Modulo aggiornato con successo.');
            } else {
                $form_template = new FormTemplate();
                $success_message = __('modulo creato con successo');
            }
    
            if ($this->request->is(['post', 'put'])) {
                $form_template = $this->FormTemplates->patchEntity($form_template, $this->request->getData());
    
                if ($this->FormTemplates->save($form_template)) {
                    $this->Flash->success($success_message);
    
                    return $this->redirect(['action' => 'view', $form_template['id']]);
                } else {
                    $this->Flash->error(__('Errore: modulo non aggiornato.'));
                    $this->Flash->error(Utils::error_to_string($form_template->errors()));
                }
            }
            $this->set('form_template', $form_template);
        }

        /**
         * @brief Get a single formTemplate
         */
        public function view($id = null)
        {
            if (!$id) {
                throw new NotFoundException(__('Richiesta non valida: manca l\'id.'));
            }

            $form_template = $this->FormTemplates->findById($id)
                ->firstOrFail();

            if (!$form_template) {
                throw new NotFoundException(__('Errore: il modulo non esistente.'));
            }

            $this->set('form_template', $form_template);
            $this->viewBuilder()->setOption('serialize', 'form_template');
        }

    }
