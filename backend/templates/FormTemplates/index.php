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
?>
<h1>Modelli</h1>

<div class="row">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <div class="d-flex mb-3">
                    <a href="<?= $this->Url->build([ 'action' => 'edit' ]) ?>">
                        <button class="btn btn-sm btn-primary mr-2">
                            <i class="fas fa-plus"></i><span class="ml-2 d-none d-lg-inline">Aggiungi modello</span>
                        </button>
                    </a>

                    <?php if ($form_templates->count()>0): ?>
                    <a href="#" >
                        <button class="btn btn-sm btn-danger mr-2"
                                onclick="Caps.submitForm('form-templates-form', {'delete' : 1}, 'Eliminare i moduli selezionati?')">
                            <i class="fas fa-times"></i><span class="d-none d-lg-inline ml-2">Elimina modello</span>
                        </button>
                    </a>
                    <?php endif ?>

                </div>

                <?php echo $this->Form->create(null, [ 'id' => 'form-templates-form' ]); ?>

                <?php if ($form_templates->count() == 0): ?>
                  Nessun modello inserito.
                <?php else: ?>
                    <div class="table-responsive-sm">
                    <table class="table">
                        <tr><thead>
                            <th></th>
                            <th><?= $this->Paginator->sort('enabled', 'Attivo'); ?></th>
                            <th><?= $this->Paginator->sort('name', 'Titolo'); ?></th>
                        </thead></tr>
                        <?php foreach ($paginated_form_templates as $form_template): ?>
                            <tr>
                                <td><input type=checkbox name="selection[]" value="<?php echo $form_template['id']; ?>"></td>
                                <td>
                                    <?= $form_template->enabled ? "Attivo" : "Non attivo" ?>
                                </td>
                                <td>
                                    <?= $this->Html->link(
                                        $form_template['name'],
                                        [   'controller' => 'form_templates',
                                            'action' => 'view',
                                            $form_template['id']])?>
                                </td>
                            </tr>
                        <?php endforeach ?>
                    </table>
                    </div>
                <?php echo $this->element('pagination'); ?>
                <?php endif ?>

                <?php echo $this->Form->end(); ?>
            </div>
        </div>
    </div>
</div>
