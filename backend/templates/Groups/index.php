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
<h1>Gruppi</h1>

<?= $this->element('card-start') ?>
    <div class="d-flex mb-2">
        <?= $this->element('filter-button', ['items' => [
                        'academic_year' => __('anno'),
                        'name' => __('nome')]]) ?>

        <a href="<?= $this->Url->build([ 'action' => 'edit' ]); ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary">
                <i class="fas fa-plus"></i><span class="d-none d-md-inline ml-2">Aggiungi gruppo</span>
            </button>
        </a>

        <button type="button" class="btn btn-sm btn-danger"
            onclick="Caps.submitForm('groups-form', { 'delete': 1 }, 'Confermi di voler rimuovere i gruppi selezionati?')">
            <i class="fas fa-times"></i><span class="d-none d-md-inline ml-2">Elimina i gruppi selezionati</span>
        </button>

        <div class="flex-fill"></div>

        <button class="btn btn-sm btn-primary mr-2" type="button" onclick="Caps.downloadCSV()">
            <i class="fas fa-download"></i><span class="d-none d-md-inline ml-2">Esporta in CSV</span>
        </button>

    </div>

    <?php echo $this->element('filter_badges', [
                  'fields' => [ 'name', 'academic_year', 'years' ]
                ]); ?>

    <?php echo $this->Form->create(null, [ 'id' => 'groups-form' ]); ?>
    <div class="table-responsive-md">
    <table class="table">
        <tr>
            <th></th>
            <th><?= $this->Paginator->sort('Degrees.academic_year', 'Anno'); ?></th>
            <th><?= $this->Paginator->sort('Degrees.name', 'Laurea'); ?></th>
            <th><?= $this->Paginator->sort('name', 'Nome'); ?></th>
            <th>Numerosità</th>
            <th>Esami</th>
        </tr>
        <?php foreach ($paginated_groups as $group): ?>
            <tr>
                <td><input type=checkbox name="selection[]" value="<?php echo $group['id']; ?>"></td>
                <td>
                    <?= $group['degree']->academic_years(); ?>
                </td>
                <td>
                    <?= $group['degree']['name'] ?>
                </td>
                <td>
                    <?php
                    echo $this->Html->link(
                        $group['name'],
                        [   'action' => 'view',
                            $group['id']]
                    );
                    ?>
                </td>
                <td>
                    <?php echo count($group['exams']); ?>
                </td>
                <td>
                    <?php echo $group->shortExamList(); ?>
                </td>
            </tr>
        <?php endforeach ?>
    </table>
    </div>

    <?php echo $this->element('pagination'); ?>

    <?php echo $this->Form->end(); ?>
<?= $this->element('card-end') ?>

