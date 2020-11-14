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
<h1>Corsi di Laurea</h1>

<?= $this->element('card-start'); ?>
    <?php echo $this->Form->create('', ['id' => 'form-degree']); ?>

    <div class="mb-2 d-flex">
        <a href="<?= $this->Url->build([ 'action' => 'edit']); ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary">
                <i class="fas fa-plus"></i><span class="d-none d-md-inline ml-2">Aggiungi corso di laurea</span>
            </button>
        </a>

        <button class="btn btn-sm btn-danger" type="button"
               onclick="Caps.submitForm('form-degree', { 'delete': 1 }, 'Confermi di voler rimuovere i corsi selezionati?')">
            <i class="fas fa-times"></i><span class="d-none d-md-inline ml-2">Elimina i corsi selezionati</span>
        </button>

        <div class="flex-fill"></div>

        <button class="btn btn-sm btn-primary mr-2" type="button" onclick="Caps.downloadCSV()">
            <i class="fas fa-download"></i><span class="ml-2 d-none d-md-inline">Esporta in CSV</span>
        </button>
    </div>

    <div class="table-responsive-sm">
    <table class="table">
        <thead>
        <tr>
            <th></th>
            <th>Nome</th>
            <th>Anni</th>
            <th>Richiesta parere</th>
        </tr>
        </thead>
        <?php foreach ($degrees as $degree): ?>
            <tr>
                <td >
                    <input type=checkbox name="selection[]" value="<?php echo $degree['id']; ?>">
                </td>
                <td>
                    <?php
                    echo $this->Html->link(
                        $degree['name'],
                        [   'controller' => 'degrees',
                            'action' => 'view',
                            $degree['id']]
                    );
                    ?>
                </td>
                <td>
                    <?php echo ($degree['years']) ?>
                </td>
                <td>
                    <?php
                    if ($degree['enable_sharing']) {
                        echo "Abilitata";
                    }
                    else {
                        echo "Non abilitata";
                    }
                    ?>
                </td>
            </tr>
        <?php endforeach ?>
    </table>
    </div>
    <?php echo $this->Form->end(); ?>
<?= $this->element('card-end'); ?>

