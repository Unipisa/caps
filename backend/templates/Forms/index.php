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
<div id="app">
</div>

<?php if (false): ?>

<h1>Moduli</h1>

<?php if ($user['admin']): ?>
<?php echo $this->element('card-start') ?>
    <div class="d-flex mb-2">
        <?= $this->element('filter-button', ['items' => [
                    'state' => [
                        'label' => __('stato'),
                        'type' => 'select',
                        'options' => [
                            '' => __('tutti'),
                            'draft' => __('bozze'),
                            'submitted' => __('da valutare'),
                            'approved' => __('approvati'),
                            'rejected' => __('rifiutati')
                        ]],
                    'surname' => __('cognome'),
                    'formTemplate' => __('modello'),
                    'name' => __('nome') ]]) ?>

        <div class="dropdown">
            <button type="button" class="btn btn-sm btn-primary dropdown-toggle" id="dropDownActions"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Azioni
            </button>
            <div class="dropdown-menu p-2 shadow" style="width: 450px;">
                <button class="my-1 btn btn-success" style="width: 100%"
                        onclick="Caps.submitForm('form-form', { 'approve': 1 }, 'Confermi di voler accettare i moduli selezionati?');">
                    ✓ Approva i moduli selezionati
                </button>
                <button class="my-1 btn btn-danger" style="width: 100%"
                        onclick="Caps.submitForm('form-form', { 'reject' : 1 }, 'Confermi di voler rifiutare i moduli selezionati?');">
                    ✗ Rifiuta i moduli selezionati
                </button>
                <button class="my-1 btn btn-warning" style="width: 100%"
                        onclick="Caps.submitForm('form-form', { 'resubmit': 1}, 'Confermi di voler riportare in valutazione i moduli selezionati?')">
                    ⎌ Riporta in valutazione i moduli selezionati
                </button>
                <button class="my-1 btn btn-warning" style="width: 100%"
                        onclick="Caps.submitForm('form-form', { 'redraft': 1 }, 'Confermi di voler riportare in bozza i moduli selezionati?')">
                    ⎌ Riporta in bozza i moduli selezionati
                </button>
                <button class="my-1 btn btn-danger" style="width: 100%"
                        onclick="Caps.submitForm('form-form', { 'delete': 1 }, 'Confermi di voler eliminare i moduli selezionati?')">
                    🗑 Elimina i moduli selezionati
                </button>
            </div>
        </div>

        <div class="flex-fill"></div>

        <div class="col-auto">
            <button type="button" class="btn btn-sm btn-primary" onclick="Caps.downloadCSV();">
                <i class="fas fw fa-download"></i><span class="ml-2 d-none d-md-inline">Esporta in CSV</span>
            </button>
        </div>
    </div>

    <?php endif; ?>

    <?php echo $this->Form->create(null, [ 'id' => 'form-form' ]); ?>

    <?php echo $this->element('filter_badges', [
      'fields' => [ 'state', 'surname', 'form_template', 'name' ]
    ]); ?>

    <div class="table-responsive-lg">
    <table class="table">
        <tr><thead>
            <th></th>
            <th><a href="#">Stato</a></th>
            <th><?= $this->Paginator->sort('Users.surname', 'Nome'); ?></th>
            <th><?= $this->Paginator->sort('FormTemplates.name', 'Modello'); ?></th>
            <th><?= $this->Paginator->sort('date_submitted', 'Inviato'); ?></th>
            <th><?= $this->Paginator->sort('date_managed', 'Gestito'); ?></th>
            <th></th>
            </thead>
        </tr>
        <?php foreach ($forms as $form): ?>
            <?php
            $form_template = $form['form_template'];
            ?>
            <tr>
                <td><input type=checkbox name="selection[]" value="<?php echo $form['id']; ?>"></td>
                <td>
                    <a href="<?= $this->Url->build([ 'controller' => 'forms', 'action' => 'view', $form['id'] ]) ?>">
                        <?= $this->Caps->badge($form) ?>
                    </a>
                    </td>
                <td>
                    <?php echo $this->Html->link(
                        $form['user']['name'],
                        ['controller' => 'users', 'action' => 'view', $form['user']['id']]);
                    ?></td>
                <td>
                    <?php
                    echo $this->Html->link(
                        $form_template['name'],
                        ['controller' => 'form_templates', 'action' => 'view', $form_template['id']]
                    );
                    ?>
                </td>
                <td>
                    <?= $this->Caps->formatDate($form['date_submitted']); ?>
                </td>
                <td>
                    <?= $this->Caps->formatDate($form['date_managed']); ?>
                </td>
                <td>
                    <div class="d-none d-xl-inline-flex flex-row align-items-center">
                        <a href="<?= $this->Url->build([ 'controller' => 'forms', 'action' => 'view', $form['id'] ]) ?>">
                        <button type="button" class="btn btn-sm btn-primary mr-2">
                            <i class="fas fa-eye mr-2"></i>
                            Visualizza
                        </button>
                        </a>
                        <a href="<?= $this->Url->build([ 'controller' => 'forms', 'action' => 'pdf', $form['id'] ]) ?>">
                            <button type="button" class="btn btn-sm btn-secondary mr-2">
                                <i class="fas fa-file-pdf mr-2"></i>
                                Scarica
                            </button>
                        </a>
                    </div>
                    <div class="d-xl-none">
                        <div class="dropdown">
                            <a class="btn-sm btn-secondary dropdown-toggle" href="#" role="button"
                                id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-cog"></i>
                            </a>
                            <ul class="dropdown-menu">
                                <li>
                                    <a class="dropdown-item" href="<?= $this->Url->build([ 'controller' => 'forms', 'action' => 'view', $form['id'] ]) ?>">
                                        <i class="fas fa-eye mr-2"></i>Visualizza
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="<?= $this->Url->build([ 'controller' => 'forms', 'action' => 'pdf', $form['id'] ]) ?>">
                                    <i class="fas fa-file-pdf mr-2"></i>Scarica
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="<?= $this->Url->build([ 'controller' => 'forms', 'action' => 'pdf', $form['id'] ]) ?>?show_comments=1">
                                    <i class="fas fa-file-pdf mr-2"></i>Scarica (con commenti)
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php unset($form); ?>
    </table>
    </div>
    <?php echo $this->element('pagination'); ?>
    <?php echo $this->Form->end(); ?>

<?php endif; ?>

<?php echo $this->element('card-end'); ?>

