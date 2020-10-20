<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
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
    <?= $exam->isNew() ? 'Aggiungi esame' : 'Modifica esame' ?>
</h1>

<?= $this->element('card-start') ?>
    <?php
    echo $this->Form->create($exam);
    echo $this->Form->control(
        'id',
        ['type' => 'hidden']);
    echo $this->Form->control(
        'code',
        ['label' => 'Codice']);
    echo $this->Form->control(
        'name',
        ['label' => 'Nome']);
    echo $this->Form->control(
        'sector',
        ['label' => 'Settore']);
    echo $this->Form->control(
        'credits',
        ['label' => 'Crediti',
            'type' => 'number']);
    echo $this->Form->control('tags._ids', [
        'label' => 'Tags'
    ]);
    echo $this->Form->control('new-tags', [
        'label' => 'Nuovi tag (separati da virgola)',
        'class' => 'tags-entry'
    ]);
    echo $this->Form->control(
        'groups._ids',
        ['label' => 'Gruppi',
            'size' => 20]);
    if ($exam->isNew()):
        echo $this->Form->submit('Salva esame');
    else:
        echo $this->Form->submit('Aggiorna esame');
    endif;
    echo $this->Form->end();
    ?>
<?= $this->element('card-end') ?>

