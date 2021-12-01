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
<style>
    table, td, tr, th {
        text-align: left;
    }
    .proposal-tag {
        display: inline-block;
        border-radius: 2px;
        border: 1px solid black;
        padding: 1px 4px 1px 4px;
        font-size: 80%;
        margin-left: 6px;
        font-weight: bold;
    }
</style>

<?= $this->fetch('content') ?>

<p>
<?= $this->Html->link("Visualizza modulo", 
        ['controller' => 'Forms', 'action' => 'view', '_full' => true, $form['id']]) ?>
</p>
<p>
    Nome e cognome: <?= $form['user']['name'] ?><br>
    Matricola: <?= $form['user']['number'] ?><br>
    Modello: <?= $form['form_template']['name'] ?><br>
    <?= $settings['department'] ?><br>
<p>
