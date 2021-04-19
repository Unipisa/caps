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
<h1><?php echo $group['name']; ?></h1>

<?= $this->element('card-start') ?>
    <div class="d-flex mb-2">
        <a href="<?= $this->Url->build(['action' => 'index']) ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary"><i class="fas fa-arrow-left mr-2"></i>Tutti i gruppi</button>
        </a>
        <a href="<?= $this->Url->build(['action' => 'edit', $group['id']]) ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary">Modifica</button>
        </a>
        <a href="<?= $this->Url->build(['action' => 'delete', $group['id']]) ?>"
           onclick="return confirm('Sei sicuro di voler cancellare questo gruppo?')" class="mr-2">
            <button type="button" class="btn btn-sm btn-danger">Elimina</button>
        </a>
    </div>

    <table class="table">
        <tr><thead>
            <th>Nome</th>
            <th>Codice</th>
            <th>Settore</th>
            <th>Crediti</th>
            </thead>
        </tr>
        <?php foreach ($group['exams'] as $exam): ?>
            <tr>
                <td>
                    <?php echo $this->Html->link($exam['name'],
                        ['controller' => 'exams', 'action' => 'edit', $exam['id']]); ?>
                </td>
                <td><?php echo h($exam['code']); ?></td>
                <td><?php echo h($exam['sector']); ?></td>
                <td><?php echo h($exam['credits']); ?></td>
            </tr>
        <?php endforeach ?>
    </table>

<?= $this->element('card-end') ?>
