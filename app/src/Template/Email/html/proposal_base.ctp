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
    Nome e cognome: <?= $proposal['user']['name'] ?><br>
    Matricola: <?= $proposal['user']['number'] ?><br>
    Curriculum: <?= $proposal['curriculum']['name'] ?><br>
    Anno di immatricolazione: <?= $proposal['curriculum']['academic_year'] ?>/<?= $proposal['curriculum']['academic_year']+1 ?><br>
    <?= $proposal['curriculum']['degree']['name'] ?><br>
    <?= $settings['department'] ?><br>
<?php
/* At the moment we do not have the information on the academic
* year inside the database,so we guess based on the deadline. */
$year = $proposal['modified']->year;
$month = $proposal['modified']->month;

if ($month <= 8)
$year = $year - 1;
?>
Anno Accademico <?= $year ?> / <?=  ($year + 1) ?><br>
</p>

<?php for ($year = 1; $year <= 3; $year++): ?>

    <?php
    $this_year_exams = array_filter($proposal['chosen_exams'],
        function ($e) use ($year) {
            return $e['chosen_year'] == $year;
        });

    $this_year_free_choice_exams = array_filter($proposal['chosen_free_choice_exams'],
        function ($e) use ($year) {
            return $e['chosen_year'] == $year;
        });

    if (max(count($this_year_exams), count($this_year_free_choice_exams)) > 0): ?>
        <div>
            <?php
            echo "<h3>";
            switch ($year) {
                case 1:
                    echo "Primo anno";
                    break;
                case 2:
                    echo "Secondo anno";
                    break;
                case 3:
                    echo "Terzo anno";
                    break;
                default:
                    echo "Anno " . $year;
                    break;
            }
            echo "</h3>";
            $year_credits = 0;
            ?>

            <table>
                <tr>
                    <th>Codice</th>
                    <th>Nome</th>
                    <th>Settore</th>
                    <th>Crediti</th>
                    <th>Gruppo</th>
                </tr>
                <?php foreach ($this_year_exams as $chosen_exam): ?>
                    <?php
                    $exam = $chosen_exam['exam'];
                    $code = $exam['code'];
                    $name = $exam['name'];
                    $sector = $exam['sector'];
                    $year_credits = $year_credits + $chosen_exam['credits'];
                    ?>
                    <tr>
                        <td><?php echo $code ?></td>
                        <td><?php echo $name ?>
                            <?php if (count($exam['tags']) > 0): ?>
                                <div class="proposal-tag">
                                    <?php echo $exam->tagsToString(); ?>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td><?php echo $sector ?></td>
                        <td><?php echo $chosen_exam['credits']; ?></td>
                        <td><?php
                            $cg = $chosen_exam['compulsory_group'];
                            $ce = $chosen_exam['compulsory_exam'];
                            $cf = $chosen_exam['free_choice_exam'];

                            if ($cg != null) {
                                echo $cg['group']['name'];
                            }
                            else if ($ce != null) {
                                echo "Obbligatorio";
                            }
                            else if ($cf != null) {
                                echo "A scelta libera";
                            }
                            ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
                <?php unset($chosen_exam); ?>
                <?php foreach ($this_year_free_choice_exams as $exam): ?>
                    <tr>
                        <td></td>
                        <td><?php echo $exam['name']; ?></td>
                        <td></td>
                        <td><?php echo $exam['credits']; ?></td>
                        <?php $year_credits = $year_credits + $exam['credits']; ?>
                    </tr>
                <?php endforeach; ?>
                <?php unset($exam); ?>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong><?php echo $year_credits; ?></strong></td>
                    <td></td>
                </tr>
            </table>
        </div>
    <?php endif; ?>
<?php endfor; ?>
