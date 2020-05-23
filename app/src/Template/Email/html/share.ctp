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

<h3>Richiesta di parere sul piano di studi</h3>
<p>
    Ti chiediamo di prendere visione del piano di studi sottomesso 
    dallo studente <?= $proposal['user']['name'] ?> 
    (matricola: <?= $proposal['user']['number'] ?>). <br>
    Curriculum: <?= $proposal['curriculum']['name'] ?><br>
    Anno di immatricolazione: <?= $proposal['curriculum']['academic_year'] ?>/<?= $proposal['curriculum']['academic_year']+1 ?><br>
    <?= $proposal['curriculum']['degree']['name'] ?><br>
    <?= $settings['department'] ?><br>
</p>

<p>
    Ti chiediamo di
    <?= $this->Html->link("visualizzare il piano di studi ed inserire un tuo commento ", [
        "controller" => "proposals",
        "action" => "view",
        $proposal['id'],
        "?" => ["secret" => $proposal_auth['secret']],
        "_full" => true ])
    ?>
    accedendo alla pagina.<br>
</p>

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
