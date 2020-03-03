<div class="bureaucracy">
    <div class="heading">
        <img class="left" src="/css/img/cherubino_black.png"/>
        <h2 class="department">Dipartimento di Matematica — Università di Pisa</h2>
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
        <h3 class="name">Nome e cognome: <?php echo $proposal['user']['name']; ?></h3>
        <h3 class="number">Matricola: <?php echo $proposal['user']['number']; ?></h3>
        <h3 class="email">Email: </h3>
        <h3 class="telephone">Telefono: </h3>
    </div>
    <div class="plea">
        <p>chiede l'approvazione del seguente Piano di Studio:</p>
    </div>
</div>

<div class="heading--web">
    <h2>Piano di Studi di <?php echo $proposal['user']['name']; ?></h2>
    <h3>Curriculum: <?php echo $proposal['curriculum']['name']; ?></h3>
</div>

<?php if($proposal['state'] === 'approved'): ?>
<div class="success">
    Il tuo Piano di Studi è stato approvato.
</div>
<?php elseif($proposal['state'] === 'submitted'): ?>
<div class="notice">
    Stampa il tuo Piano di Studi, firmalo e consegnalo in Segreteria Studenti.
</div>
<?php endif; ?>

<div class="notice">
    Se desideri modificarlo manda una mail alla Segreteria Studenti.
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
        <td><?php echo $name ?></td>
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
        <div class="date">Data di presentazione</div><br>
        <div class="examined">Esaminato dal CdS in data</div><br>
        <div class="result">
            Esito: <ul>
                <li>Approvato ☐</li>
                <li>Rifiutato ☐</li>
            </ul>
        </div><br>
        <div class="confirmation">Firma del Presidente</div>
    </div>

    <div class="right">
        <div class="signature">Firma dello studente</div>
    </div>
</div>

<div class="attachments">
  <h3>Allegati</h3>
    <ul>
    <?php foreach ($proposal['attachments'] as $att): ?>
      <li>
          <?php
          echo $this->Html->link($att['filename'], [
              'controller' => 'attachments',
              'action' => 'view',
              $att['id']
          ]);
          ?> —
          <?php
          echo $this->Form->postLink('Elimina', [
              'controller' => 'attachments',
              'action' => 'delete',
              $att['id']
          ], [
              'confirm' => 'Cancellare definitivamente l\'allegato?'
          ]);
          ?>
      </li>
    <?php endforeach ?>
    </ul>
    <?php
        echo $this->Form->create('Attachment', [
            'url' => [ 'controller' => 'attachments', 'action'=> 'add' ],
            'type' => 'file'
        ]);
        echo $this->Form->file('data');
        echo $this->Form->hidden('proposal_id', [ 'value' => $proposal['id'] ]);
        echo $this->Form->submit('Allega nuovo file');
        echo $this->Form->end();
    ?>
</div>

<?php if ($owner['admin']): ?>
    <!-- Toolbar per l'amministratore //-->
    <ul class=planActions>
        <!-- FIXME: simplify this logic -->
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
