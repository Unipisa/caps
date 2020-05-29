<script>
    var proposal_json = <?= $proposal_json ?>;

    var caps_json = {
        curriculumURL: <?= json_encode($this->Url->build([ 'action' => 'view', 'controller' => 'curricula' ])) ?>,
        examsURL: <?= json_encode($this->Url->build([ 'controller' => 'exams', 'action' => 'index', '_ext' => 'json'])) ?>,
        groupsURL: <?= json_encode($this->Url->build([ 'controller' => 'groups', 'action' => 'index', '_ext' => 'json'])) ?>,
        curriculaURL: <?= json_encode($this->Url->build([ 'controller' => 'curricula', 'action' => 'index', '_ext' => 'json'])) ?>,
        cds: <?= json_encode($settings['cds']) ?>
    };
</script>

<?= $this->Html->script('proposals/view.js?rev=3') ?>

<div class="bureaucracy">
    <div class="heading">
        <?php echo $this->Html->image('cherubino_black.png', [ 'class' => 'left' ]) ?>
        <h2 class="department"><?php echo $settings['department'] ?></h2>
        <h2 class="degree"><?php echo $proposal['curriculum']['degree']['name']; ?>
        </h2>
        <h2 class="year"><?php
            /* At the moment we do not have the information on the academic
             * year inside the database,so we guess based on the deadline. */
            $year = $proposal['modified']->year;
            $month = $proposal['modified']->month;

            if ($month <= 8)
              $year = $year - 1;

            echo "Anno Accademico " . $year . "/" . ($year + 1);
        ?></h2>
    </div>
    <div class="data">
        <h3 class="curriculum">Curriculum: <?php echo $proposal['curriculum']['name']; ?></h3>
        <h3 class="curriculum">Anno di immatricolazione: <?= $proposal['curriculum']['academic_year'] ?>/<?= $proposal['curriculum']['academic_year']+1 ?></h3>
        <h3 class="name">Nome e cognome: <?php echo $proposal['user']['name']; ?></h3>
        <h3 class="number">Matricola: <?php echo $proposal['user']['number']; ?></h3>
        <h3 class="email">Email: <?= $proposal['user']['email'] ?></h3>
        <!-- h3 class="telephone">Telefono: </h3> //-->
    </div>
    <div class="plea">
        <p>chiede l'approvazione del seguente Piano di Studio:</p>
    </div>
</div>

<div class="heading--web">
    <h2>Piano di Studi di <?php echo $proposal['user']['name']; ?></h2>
    <h3>
      <?= $proposal['curriculum']['degree']['name'] ?> —
      Curriculum <?php echo $proposal['curriculum']['name']; ?>
      (anno di immatricolazione <?= $proposal['curriculum']['academic_year'] ?>/<?= $proposal['curriculum']['academic_year']+1 ?>)
    </h3>
</div>

<?php if ($message != ""): ?>
<div class="notice">
    <?php echo $message; ?>
</div>
<?php endif; ?>

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

<div class="bureaucracy">
    <div class="left">
        <div class="date">Data di presentazione: <?=
            ($proposal['submitted_date'] != null) ?
                $proposal['submitted_date']->setTimezone($Caps['timezone'])->i18nformat('dd/MM/yyyy, HH:mm') : 'non ancora presentato';
        ?></div><br>
        <?php if ($proposal['state'] == 'approved'): ?>
        <div class="examined">Esaminato in data: <?=
            ($proposal['approved_date'] != null) ?
                $proposal['approved_date']->setTimezone($Caps['timezone'])->i18nformat('dd/MM/yyyy, HH:mm') :
                'data non disponibile'
            ?></div><br>
        <div class="result">
            Esito: <ul>
                <li>Approvato ☒</li>
                <!-- <li>Rifiutato ☐</li> //-->
            </ul>
        </div>
        <br>
        <div class="confirmation"><?= $settings['approval-signature-text']; ?></div>
        <?php endif; ?>
    </div>

    <div class="right">
        <div class="signature"><!-- Firma dello studente //--></div>
    </div>
</div>

<div class="attachments">

    <?php
      $secret = $this->request->getQuery('secret');

      $visible_attachments = array_filter(
          $proposal['attachments'],
          function ($a) use ($user, $secret) { return $user && $user->canViewAttachment($a, $secret); }
      );

      $authorizations = $proposal->auths;

      // Construct an array with the attachments and the authorizations, and sort it
      $attachments_and_auths = array_merge($visible_attachments, $authorizations);
      usort($attachments_and_auths, function ($a, $b) {
          return $a->created->getTimestamp() - $b->created->getTimestamp();
      });

      $events_count = count($attachments_and_auths);
     ?>

  <?php if ($events_count > 0): ?>
    <h3>Allegati e commenti</h3>
  <?php endif ?>
    <p>
    <ul class="attachments">
    <?php foreach ($attachments_and_auths as $att): ?>
    <?php if ($att instanceof \App\Model\Entity\Attachment): ?>

            <?php
                // Determiniamo se si tratta di commento e/o allegato
                $obj_name = "allegato";
                if ($att->filename == null) {
                    $obj_name = "commento";
                }
            ?>

          <li class="attachment">
              <?php if ($att['comment'] != ""): ?>
                <?= $att['comment'] ?><br><br>
              <?php endif ?>

              <?php if($att['filename'] != null): ?>
                  <strong>Allegato</strong>:
                  <?php
                  echo $this->Html->link($att['filename'], [
                      'controller' => 'attachments',
                      'action' => 'view',
                      $att['id']
                  ]);
                  ?><br><br>
              <?php endif ?>
              <strong><?php echo $att['user']['name'] ?></strong>
              <?php if ($att['created'] != null) {
                  ?>  — <?php
                  echo $att['created']->setTimezone($Caps['timezone'])->i18nformat('dd/MM/yyyy, HH:mm');
              }
              ?>

                  <?php if ($user && $user->canDeleteAttachment($att)): ?>
                  — [
                  <?php
                  echo $this->Form->postLink('Elimina questo ' . $obj_name, [
                      'controller' => 'attachments',
                      'action' => 'delete',
                      $att['id'], $secret
                  ], [
                      'confirm' => 'Cancellare definitivamente l\'' . $obj_name . '?',
                  ]);
                  ?> ]
              <?php endif ?>
          </li>
    <?php else: ?>
        <li class="authorization">
            Richiesta di parere inviata a <strong><?= $att['email'] ?></strong> <?php if ($att['created'] != null) {
                ?>  — <?php
                echo $att['created']->setTimezone($Caps['timezone'])->i18nformat('dd/MM/yyyy, HH:mm');
            }
            ?>
        </li>
    <?php endif ?>
    <?php endforeach ?>
    </ul>
    <?php
        if ($user && $user->canAddAttachment($proposal, $secret)) { ?>
            <h3>Inserisci un nuovo allegato o commento</h3>
            <?php
            echo $this->Form->create('Attachment', [
                'url' => ['controller' => 'attachments', 'action' => 'add'],
                'type' => 'file'
            ]);
            ?>
            <p>&Egrave; possibile aggiungere allegati e/o commenti a questo piano di studi.</p>
            <?php
            echo $this->Form->hidden('secret', [ 'value' => $secret]);
            echo $this->Form->textarea('comment');
            echo $this->Form->file('data');
            echo $this->Form->hidden('proposal_id', ['value' => $proposal['id']]);
            echo $this->Form->submit('Aggiungi commento e/o allegato');
            echo $this->Form->end();
        }
    ?></p>

    <?php if ($proposal['state'] == 'submitted'): ?>
        <h3>Richiesta parere</h3>
        <?php
            echo $this->Form->create('ProposalAuth', [
                'url' => ['controller' => 'proposals', $proposal['id'], 'action' => 'share']
            ]);
            echo $this->Form->control(
                'email',
                ['label' => 'Email']);
            echo $this->Form->submit('Richiedi parere');

            echo $this->Form->end();
        ?>

    <?php endif ?>


</div>

<?php if ($user['admin']): ?>
    <!-- Toolbar per l'amministratore //-->
    <h3>Azioni disponibili</h3>
    <ul class=planActions>
        <?php if ($proposal['state'] === 'submitted'): ?>
        <li>
            <?php
                echo $this->Html->link(
                    'Accetta&nbsp;✓',
                    ['action' => 'admin_approve',
                        $proposal['id']],
                    ['class' => 'accept',
                        'escape' => false]
                );
            ?>
        </li>
        <li>
            <?php
                echo $this->Html->link(
                    'Rifiuta&nbsp;✗',
                    ['action' => 'admin_reject',
                        $proposal['id']],
                    ['class' => 'reject',
                        'escape' => false]
                );
            ?>
        </li>
        <?php endif ?>
        <li>
            <?php
                echo $this->Html->link(
                    'Indietro&nbsp;↩',
                    $this->request->referer(),
                    ['class' => 'back',
                        'escape' => false]
                );
            ?>
        </li>
    </ul>
<?php endif; ?>

<div id="proposal_div">
</div>
