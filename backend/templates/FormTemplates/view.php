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
<h1>Modello <?= $form_template['name']?></h1>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <div class="d-flex mb-2">
                    <a href="<?= $this->Url->build(['action' => 'index']) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary"><i class="fas fa-arrow-left mr-2"></i>Tutti i modelli</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'edit', $form_template['id']]) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary">Modifica</button>
                    </a>
                    <a href="<?= $this->Url->build(['controller' => 'forms', 'action' => 'edit',
                        '?' => ['form_template_id' => $form_template['id']]]) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary">Inserisci modulo</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'delete', $form_template['id']]) ?>"
                       onclick="return confirm('Sei sicuro di voler cancellare questo modello?')">
                        <button type="button" class="btn btn-sm mr-2 btn-danger">Elimina</button>
                    </a>
                </div>

                <table class="table">
                    <tr>
                        <th>Attivato</th>
                        <td><?= $form_template['enabled'] ? 'Attivo' : 'Non attivo' ?></td>
                    </tr>
                    <tr>
                        <th>Nome</th>
                        <td><?= h($form_template['name']) ?></td>
                    </tr>
                    <tr>
                        <th>Notifiche</th>
                        <td><?= h($form_template['notify_emails']) ?></td>
                    </tr>
                    <tr>
                        <th>Richiede approvazione</th>
                        <td><?= h($form_template['require_approval'] ? 'Sì' : 'No') ?></td>
                    </tr>
                </table>

                <h4>Modello</h4>
                <p>
                    <?= $form_template['text'] ?>
                </p>
                <? if ($form_template['code']) :?>
                <h4>Codice [non ancora implementato]</h4>
                <pre>
                    <?= $form_template['code'] ?>
                </pre>
                </p>
                <? endif; ?>
            </div>
        </div>
    </div>
</div>