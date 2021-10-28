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
<h1><?= $form_template->isNew() ? 'Aggiungi modulo' : 'Modifica modulo' ?></h1>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <?= $this->Form->create($form_template) ?>
                <div class="form-check">
                    <?= $this->Form->control('enabled', ['label' => 'Attivato']); ?>
                </div>
                <?= $this->Form->control('name', [ 'label' => 'Nome' ]) ?>
                <?= $this->Form->control('text') ?>
                <?= $this->Form->submit($form_template->isNew() ? 'Crea' : 'Aggiorna') ?>
                <?= $this->Form->end() ?>
            </div>
        </div>
    </div>
</div>
