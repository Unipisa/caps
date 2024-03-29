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
<h1>
    <?= $group->isNew() ? 'Aggiungi gruppo' : 'Modifica gruppo' ?>
</h1>

<?= $this->element('card-start') ?>
    <?php
    // debug($group);
    echo $this->Form->create($group);
    echo $this->Form->input('name', ['label' => 'Nome']);
    echo $this->Form->control('degree_id', ['label' => 'Corso']);
    echo $this->Form->control('exams._ids', [ 'label' => 'Esami', 'size' => 15 ]);
    if ($group->isNew()):
        echo $this->Form->submit('Salva gruppo');
    else:
        echo $this->Form->submit('Modifica gruppo');
    endif;
    echo $this->Form->end();
    ?>
<?= $this->element('card-end') ?>
