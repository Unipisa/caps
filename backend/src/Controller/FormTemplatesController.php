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

    use App\Model\Entity\FormTemplate;
    use Cake\ORM\TableRegistry;
    use App\Controller\AppController;
    use Cake\Http\Exception\ForbiddenException;
    use Cake\Http\Exception\NotFoundException;
    use App\Form\FormTemplatesFilterForm;

    class FormTemplatesController extends AppController
    {
        public function index()
        {
            $form_templates = $this->FormTemplates->find('all',['order' => 'name']);
            if (!$this->user['admin']) {
                // avoid to make public information which is not yet marked as enabled
                $form_templates = $form_templates->where(['enabled' => true]);
            }

            $filterForm = new FormTemplatesFilterForm($form_templates);
            $form_templates = $filterForm->validate_and_execute($this->request->getQuery());
            $this->set('filterForm', $filterForm);    

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
                        if ($this->deleteIfNotUsed($form_template_id)) {
                            $delete_count++;
                        }
                    }
                    if ($delete_count > 1) {
                        $this->Flash->success(__('{delete_count} modelli cancellati con successo', ['delete_count' => $delete_count]));
                    } elseif ($delete_count == 1) {
                        $this->Flash->success(__('un modello cancellato con successo'));
                    } else {
                        $this->Flash->success(__('nessun modello cancellato'));
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

            $form_templates = $this->FormTemplates;

            if (!$this->user['admin']) {
                $form_templates = $form_templates->where(["enabled" => true]);
            }

            $form_template = $form_templates->get($id);

            $this->set('form_template', $form_template);
            $this->viewBuilder()->setOption('serialize', 'form_template');
        }

        protected function deleteIfNotUsed($form_template_id): bool
        {
            $form_template = $this->FormTemplates->findById($form_template_id)->firstOrFail();
            $form_count = TableRegistry::getTableLocator()->get('forms')->find('all')
                ->where(['form_template_id' => $form_template_id])
                ->count();
            if ($form_count == 0) {
                if ($this->FormTemplates->delete($form_template)) {
                    return true;
                } else {
                    $this->flash->error(__('Cancellazione del modello non riuscita'));
                }
            } else {
                $this->Flash->error(__(
                    'Il modello {name} non può essere rimosso perché ci sono {count} moduli collegati',
                    ['name' => $form_template['name'], 'count' => $form_count]
                ));
            }
    
            return false;
        }
    
    }