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
    html {
        margin: 0;
    }

    body {
        font-family: "Helvetica";
        font-size: 0.7rem;
        margin: 0.8cm;
    }

    h2, h3, h4 {
        margin: 0;
        padding: 0;
    }

    h2 {
        font-size: 0.85rem;
        font-weight: normal;
    }

    h3 {
        font-size: 0.8rem;
    }

    h4 {
        font-size: 0.9rem;
        font-weight: normal;
        margin-bottom: 0.1cm;
        margin-top: 0.3cm;
    }

    table.table {
        border-collapse: collapse;
        width: 18cm;
        margin-bottom: 12px;
        margin-left: 0.3cm;
    }

    .heading {
      margin-bottom: 0.4cm;
    }

    td, th {
        border-bottom: 1px solid grey;
        margin: 0;
        padding: 3px;
        text-align: left;
    }

    th {
        border-bottom: 3px groove grey;
    }

    td.heading {
        padding: 6px;
        padding-right: 0.5cm;
        border: none;
    }

    .bottom {
        margin-top: 1cm;
    }

    .badge {
        display: inline;
        padding: 0.02cm;
        background-color: #eee;
        font-size: 0.5rem;
        font-weight: bold;
        margin-left: 4px;
        border: 1px solid black;
        border-left: ;: 1px solid black;
    }

</style>

<div class="heading">
    <table>
        <tr>
            <td class="heading">
                <img src="data:image/png;base64,<?= base64_encode(file_get_contents($app_path . '../webroot/img/cherubino.png')) ?>" />
            </td>
            <td class="heading">
                <h2><?php echo h($settings['department']) ?></h2>
                <h2><?php echo ($proposal['curriculum']['degree']['name']); ?></h2>
                <h2><?php
                    /* At the moment we do not have the information on the academic
                     * year inside the database,so we guess based on the deadline. */
                    $year = $proposal['modified']->year;
                    $month = $proposal['modified']->month;

                    if ($month <= 8)
                        $year = $year - 1;

                    echo "Anno Accademico " . $year . "/" . ($year + 1);
                    ?></h2>
            </td>
        </tr>
    </table>


</div>
<div class="data">
    <strong>Curriculum</strong>: <?php echo h($proposal['curriculum']['name']); ?><br>
    <strong>Anno di immatricolazione</strong>: <?= $proposal['curriculum']['academic_year'] ?>/<?= $proposal['curriculum']['academic_year']+1 ?><br>
    <strong>Nome e cognome</strong>: <?php echo h($proposal['user']['name']); ?></strong><br>
    <strong>Matricola</strong>: <?php echo h($proposal['user']['number']); ?><br>
    <strong>Email</strong>: <?= h($proposal['user']['email']) ?><br>
</div>
<div class="plea">
    <p>chiede l'approvazione del seguente Piano di Studio:</p>
</div>

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
            echo "<h4>";
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
            echo "</h4>";
            $year_credits = 0;
            ?>

            <table class="table">
                <thead>
                <tr>
                    <th>Codice</th>
                    <th>Nome</th>
                    <th>Settore</th>
                    <th>Crediti</th>
                    <th>Gruppo</th>
                </tr>
                </thead>
                <?php foreach ($this_year_exams as $chosen_exam): ?>
                    <?php
                    $exam = $chosen_exam['exam'];
                    $code = $exam['code'];
                    $name = $exam['name'];
                    $sector = $exam['sector'];
                    $year_credits = $year_credits + $chosen_exam['credits'];
                    ?>
                    <tr>
                        <td><?php echo h($code) ?></td>
                        <td><?php echo h($name) ?>
                            <?php if (count($exam['tags']) > 0): ?>
                                <div class="badge">
                                    <?php echo $exam->tagsToString(); ?>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td><?php echo h($sector) ?></td>
                        <td><?php echo h($chosen_exam['credits']); ?></td>
                        <td><?php
                            $cg = $chosen_exam['compulsory_group'];
                            $ce = $chosen_exam['compulsory_exam'];
                            $cf = $chosen_exam['free_choice_exam'];

                            if ($cg != null) {
                                echo h($cg['group']['name']);
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
                        <td><?php echo h($exam['name']); ?></td>
                        <td></td>
                        <td><?php echo $exam['credits']; ?></td>
                        <?php $year_credits = $year_credits + $exam['credits']; ?>
                        <td></td>
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

<div class="bottom">
<div class="left">
    <div class="date">Data di presentazione: <?= $this->Caps->formatDate($proposal['submitted_date'], 'non ancora presentato'); ?></div>
    <?php if ($proposal['state'] == 'approved'): ?>
        <div class="examined">Esaminato in data: <?=
          $this->Caps->formatDate($proposal['approved_date'], 'data non disponibile'); ?></div>
        <div class="result">
            Esito: <strong>Approvato</strong>
        </div>
        <br>
        <div class="confirmation"><?= h($settings['approval-signature-text']); ?></div>
    <?php endif; ?>
</div>

<div class="right">
    <div class="signature"><!-- Firma dello studente //--></div>
</div>

<?php if ($show_comments): ?>
<?= $this->element('card-start', [ 'header' => 'Allegati e commenti' ]) ?>
    <?php
      $visible_attachments = array_filter(
          $proposal['attachments'],
          function ($a) use ($user, $secrets) { return $user && $user->canViewAttachment($a, $secrets); }
      );

      $authorizations = $proposal->auths;

      // Construct an array with the attachments and the authorizations, and sort it
      $attachments_and_auths = array_merge($visible_attachments, $authorizations);
      usort($attachments_and_auths, function ($a, $b) {
          return $a->created->getTimestamp() - $b->created->getTimestamp();
      });

      $events_count = count($attachments_and_auths);
     ?>

    <p>
    <?php if ($user != $proposal->user && !$pdf): ?>
    Lo studente può vedere i commenti e gli allegati. <br />
    <?php endif ?>
    <ul class="attachments">
    <?php foreach ($attachments_and_auths as $att): ?>
    <?php if ($att instanceof \App\Model\Entity\Attachment): ?>
        <?= $this->element('attachment', [
                'attachment' => $att,
                'controller' => 'attachments',
                'name' => $att->filename == null ? 'Commento' : 'Allegato'
            ])
        ?>
    <?php else: ?>
        <li class="card border-left-warning mb-2">
            <div class="card-body p-1">
                Richiesta di parere inviata a <strong><?= $att['email'] ?></strong> <?php if ($att['created'] != null) {
                    ?>  — <?php
                    echo $this->Caps->formatDate($att['created']);
                }
                ?>
            </div>
        </li>
    <?php endif ?>
    <?php endforeach ?>
    </ul>
    <?php if ($user && $user->canAddAttachment($proposal, $secrets) && !$pdf): ?>

    <button type="button" class="dropdown-toggle btn btn-primary btn-sm" data-toggle="collapse" data-target="#add-attachment">
        Inserisci un nuovo allegato o commento
    </button>
    <div class="collapse my-3 mx-0" id="add-attachment">
        <div class="card border-left-primary p-3">
        <?php
        echo $this->Form->create('Attachment', [
            'url' => ['controller' => 'attachments', 'action' => 'add'],
            'type' => 'file'
        ]);
        ?>

        <div class="form-group">
            <?php echo $this->Form->textarea('comment'); ?>
        </div>
        <div class="form-group">
            <?php echo $this->Form->file('data'); ?>
        </div>
        <?php echo $this->Form->hidden('proposal_id', ['value' => $proposal['id']]); ?>
        <?php echo $this->Form->submit('Aggiungi commento e/o allegato'); ?>
        <?php echo $this->Form->end(); ?>
        <?php endif; ?>
        </div>
    </div>
<?= $this->element('card-end'); ?>
<?php endif; ?>
</div> 