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
<h1><?php echo $exam['name']; ?></h1>

<?= $this->element('card-start') ?>
    <div class="d-flex mb-2">
        <a href="<?= $this->Url->build(['action' => 'index']) ?>">
            <button type="button" class="btn btn-sm mr-2 btn-primary"><i class="fas fa-arrow-left mr-2"></i>Tutti gli esami</button>
        </a>
        <a href="<?= $this->Url->build(['action' => 'edit', $exam['id']]) ?>">
            <button type="button" class="btn btn-sm mr-2 btn-primary">Modifica</button>
        </a>
        <a href="<?= $this->Url->build(['action' => 'delete', $exam['id']]) ?>"
           onclick="return confirm('Sei sicuro di voler cancellare questo esame?')">
            <button type="button" class="btn btn-sm mr-2 btn-danger">Elimina</button>
        </a>

        <div class="flex-fill"></div>

        <div class="btn btn-sm btn-primary mr-2" type="button" onclick="Caps.downloadCSV()">
            <i class="fas fa-download mr-2"></i>Esporta in CSV
        </div>
    </div>

    <table class="table">
        <tr><thead>
            <th>Nome</th>
            <td><?php echo h($exam['name']); ?></td>
            </thead>
        </tr>
        <tr>
            <th>Codice</th>
            <td><?php echo h($exam['code']); ?></td>
        </tr>
        <tr>
            <th>Settore</th>
            <td><?php echo h($exam['sector']); ?></td>
        </tr>
        <tr>
            <th>Crediti</th>
            <td><?php echo $exam['credits']; ?></td>
        </tr>
        <tr>
            <th>Tags</th>
            <td><?php echo $exam->tagsToString(); ?></td>
        </tr>
        <tr>
            <th>Note</th>
            <td><?php echo $exam['notes']; ?></td>
        </tr>
    </table>

    <?= $this->element('card-end') ?>

    <?php if ($chosen_exams): ?>

    <?= $this->element('card-start', ['header' => __("Scelte dell'esame nei piani di studio")]) ?>
    <div class="d-flex mb-2">
        <div class="flex-fill"></div>

        <a class="btn btn-sm btn-primary mr-2" type="button" href="<?= $exam->id ?>.csv?chosen_exams">
            <i class="fas fa-download mr-2"></i>Esporta in CSV
        </a>
    </div>

    <table class="table">
    <tr>
        <thead>
            <th>Piani approvati</th>
            <th>Anno accademico</th>
            <th>Curriculum</th>
            <th>Laurea</th>
        </thead>
    </tr>
        <?php foreach($chosen_exams as $chosen_exam): ?>
        <!--?php debug($chosen_exam); ?-->
        <tr>
            <td><?= $chosen_exam->count ?></td>
            <td><?= $chosen_exam->academic_year ?>/<?= $chosen_exam->academic_year + 1 ?></td>
            <td><?= h($chosen_exam->curriculum_name) ?></td>
            <td><?= h($chosen_exam->degree_name) ?></td>
        </tr>
        <?php endforeach ?>
    </table>

    <?= $this->element('card-end') ?>
    <?php endif; ?>
