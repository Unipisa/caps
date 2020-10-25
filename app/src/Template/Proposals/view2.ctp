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
        <h2 class="degree">*** nome del curriculum ***</h2>
        <h2 class="year">Anno Accademico ????/????</h2>
    </div>
    <div class="data">
        <h3 class="curriculum">Curriculum: *** nome del curriculum ***</h3>
        <h3 class="curriculum">Anno di immatricolazione: ????/????</h3>
        <h3 class="name">Nome e cognome: *** nome e cognome ***</h3>
        <h3 class="number">Matricola: *** matricola ***</h3>
        <h3 class="email">Email: *** email ***</h3>
        <!-- h3 class="telephone">Telefono: </h3> //-->
    </div>
    <div class="plea">
        <p>*** chiede l'approvazione? qual e' lo stato ***</p>
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

<div class="notice">
*** eventuale messaggio ***
</div>

<div id="proposal_div">
</div>

<div class="bureaucracy">
    <div class="left">
        <div class="date">Data di presentazione: *** data di presentazione ***</div><br>
        <div class="examined">Esaminato in data: *** data approvazione ***</div><br>
        <div class="result">
            Esito: <ul>
                <li>Approvato ☒</li>
                <!-- <li>Rifiutato ☐</li> //-->
            </ul>
        </div>
        <br>
        <div class="confirmation"><?= $settings['approval-signature-text']; ?></div>
    </div>

    <div class="right">
        <div class="signature"><!-- Firma dello studente //--></div>
    </div>
</div>

<div class="attachments">

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
                      $att['id']
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
        if ($user && $user->canAddAttachment($proposal, $secrets)) { ?>
            <h3>Inserisci un nuovo allegato o commento</h3>
            <?php
            echo $this->Form->create('Attachment', [
                'url' => ['controller' => 'attachments', 'action' => 'add'],
                'type' => 'file'
            ]);
            ?>
            <p>&Egrave; possibile aggiungere allegati e/o commenti a questo piano di studi.</p>
            <?php
            echo $this->Form->textarea('comment');
            echo $this->Form->file('data');
            echo $this->Form->hidden('proposal_id', ['value' => $proposal['id']]);
            echo $this->Form->submit('Aggiungi commento e/o allegato');
            echo $this->Form->end();
        }
    ?></p>

    <?php if ($proposal['curriculum']['degree']['enable_sharing']): ?>
        <?php if (($proposal['state'] == 'submitted') && ($proposal['user_id'] == $user['id'] || $user['admin'])): ?>
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
    <?php endif ?>
</div>

<?php if ($user['admin']): ?>
    <!-- Toolbar per l'amministratore //-->
    <h3 class="planActions">Azioni disponibili</h3>
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

