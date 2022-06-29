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
<h1>Curriculum <?= $curriculum['name']?> <?= $curriculum['degree']['name'] ?> <?= $curriculum['degree']->academic_years() ?></h1>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <div class="d-flex mb-2">
                    <a href="<?= $this->Url->build(['action' => 'index']) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary"><i class="fas fa-arrow-left mr-2"></i>Tutti i curricula</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'edit', $curriculum['id']]) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary">Modifica</button>
                    </a>
                    <a href="<?= $this->Url->build(['controller' => 'proposals', 'action' => 'edit',
                        '?' => ['degree_id' => $curriculum['degree_id'], 'curriculum_id' => $curriculum['id']]]) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary">Inserisci piano</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'delete', $curriculum['id']]) ?>"
                       onclick="return confirm('Sei sicuro di voler cancellare questo curriculum?')">
                        <button type="button" class="btn btn-sm mr-2 btn-danger">Elimina</button>
                    </a>
                </div>

                <table class="table">
                    <tr>
                        <th>Laurea</th>
                        <td><?php echo h($curriculum['degree']['name'] . " " . $curriculum['degree']->academic_years()); ?></td>
                    </tr>
                    <tr>
                        <th>Nome</th>
                        <td><?php echo h($curriculum['name']); ?></td>
                    </tr>
                </table>

                <h4>Crediti per anno</h4>
                <table class="table">
                <?php foreach ($curriculum['credits'] as $i => $cpy): ?>
                    <tr>
                        <td>Anno <?= $i+1 ?></td>
                        <td><?= $cpy ?></td>
                    </tr>
                <?php endforeach; ?>
                </table>

                <?php if ($curriculum['notes'] != ""): ?>
                    <h4>Nota</h4>
                    <p>
                        <?php echo h($curriculum['notes']); ?>
                    </p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h3 class="h5 mb-0">Esami obbligatori</h3>
            </div>
            <div class="card-body">

                <table class="table">
                    <tr>
                        <th>Nome Esame</th>
                        <th>Anno</th>
                    </tr>
                    <?php foreach ($curriculum['compulsory_exams'] as $compulsory_exam) { ?>
                        <tr>
                            <td>
                                <?= $this->Html->link(h($compulsory_exam['exam']['name']), ['controller' => 'exams', 'action' => 'view', $compulsory_exam['exam']['id']]) ?>
                            </td>
                            <td>
                                <?= $compulsory_exam['year'] ?>
                            </td>
                        </tr>
                    <?php } ?>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h3 class="h5 mb-0">Esami a scelta in un gruppo</h3>
            </div>
            <div class="card-body">
                <table class="table">
                    <tr>
                        <th>Nome Gruppo</th>
                        <th>Anno</th>
                    </tr>
                    <?php foreach ($curriculum['compulsory_groups'] as $compulsory_group) { ?>
                        <tr>
                            <td>
                                <?= $this->Html->link(h($compulsory_group['group']['name']), ['controller' => 'groups', 'action' => 'view', $compulsory_group['group']['id']]) ?>
                            </td>
                            <td>
                                <?= $compulsory_group['year']; ?>
                            </td>
                        </tr>
                    <?php } ?>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h3 class="h5 mb-0">Esami a scelta libera</h3>
            </div>
            <div class="card-body">
                <table class="table">
                    <tr>
                        <th>Nome Esame</th>
                        <th>Anno</th>
                    </tr>
                    <?php foreach ($curriculum['free_choice_exams'] as $free_choice_exam) { ?>
                        <tr>
                            <td><?php echo $free_choice_exam['group']?"Esame a scelta libera nel gruppo: ".$free_choice_exam['group']['name']:"esame a scelta libera qualunque"; ?></td>
                            <td><?php echo $free_choice_exam['year']; ?></td>
                        </tr>
                    <?php } ?>
                </table>
            </div>
        </div>
    </div>
</div>
