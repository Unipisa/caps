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
<h1>Curricula</h1>

<div class="row">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <div class="d-flex mb-3">
                    <?= $this->element('filter-button', ['items' => [
                        'name' => __('nome'),
                        'academic_year' => __('anno'),
                        'degree' => __('laurea')]]) ?>

                    <a href="<?= $this->Url->build([ 'action' => 'edit' ]) ?>">
                        <button class="btn btn-sm btn-primary mr-2">
                            <i class="fas fa-plus"></i><span class="ml-2 d-none d-lg-inline">Aggiungi curriculum</span>
                        </button>
                    </a>

                    <a href="#" >
                        <button class="btn btn-sm btn-danger mr-2"
                                onclick="Caps.submitForm('curricula-form', {'delete' : 1}, 'Eliminare i curricula selezionati?')">
                            <i class="fas fa-times"></i><span class="d-none d-lg-inline ml-2">Elimina curriculum</span>
                        </button>
                    </a>

                    <div class="flex-fill"></div>

                    <div class="btn btn-sm btn-primary mr-2" type="button" onclick="Caps.downloadCSV()">
                        <i class="fas fa-download"></i><span class="ml-2 d-none d-lg-inline">Esporta in CSV</span>
                    </div>
                </div>

                <?php echo $this->element('filter_badges', [
                  'fields' => [ 'name', 'academic_year', 'degree' ]
                ]); ?>

                <?php echo $this->Form->create(null, [ 'id' => 'curricula-form' ]); ?>

                <div class="table-responsive-sm">
                <table class="table">
                    <tr><thead>
                        <th></th>
                        <th><?= $this->Paginator->sort('Degrees.academic_year', 'Anno'); ?></th>
                        <th><?= $this->Paginator->sort('Degrees.name', 'Laurea'); ?></th>
                        <th><?= $this->Paginator->sort('name', 'Nome'); ?></th>
                    </thead></tr>
                    <?php foreach ($paginated_curricula as $curriculum): ?>
                        <tr>
                            <td class="caps-admin-curricula-id"><input type=checkbox name="selection[]" value="<?php echo $curriculum['id']; ?>"></td>
                            <td class="caps-admin-curricula-year"><?php echo $curriculum['degree']->academic_years(); ?></td>
                            <td class="caps-admin-curricula-degree"><?php echo h($curriculum['degree']['name']); ?></td>
                            <td class="caps-admin-curricula-name">
                                <?php
                                echo $this->Html->link(
                                    $curriculum['name'],
                                    [   'controller' => 'curricula',
                                        'action' => 'view',
                                        $curriculum['id']]
                                );
                                ?>
                            </td>
                        </tr>
                    <?php endforeach ?>
                </table>
                </div>
                <?php echo $this->element('pagination'); ?>

                <?php echo $this->Form->end(); ?>
            </div>
        </div>
    </div>
</div>
