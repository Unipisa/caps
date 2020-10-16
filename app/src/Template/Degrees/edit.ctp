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
    <?= $degree->isNew() ? "Aggiungi corso di Laurea" : "Modifica corso di Laurea" ?>
</h1>

<?= $this->element('card-start'); ?>
    <?php
        echo $this->Form->create($degree);
        echo $this->Form->control('name', ['label' => 'Nome']);
        echo $this->Form->control('years', ['label' => 'Anni']);
    ?>
    <div class="form-check mb-2">
        <?php echo $this->Form->control('enable_sharing', ['label' => 'Richiesta parere abilitata']); ?>
    </div>
    <?php
        if ($degree->isNew()):
            echo $this->Form->submit('Salva corso di laurea');
        else:
            echo $this->Form->submit('Aggiorna');
        endif;
        echo $this->Form->end();
    ?>
<?= $this->element('card-end') ?>

