<h1>Domanda di partecipazione</h1>
<?= $this->element('card-start') ?>
<?= $this->element('thesis-defense-details', ['defense' => $defense]) ?>
<?php if ($user['admin']): ?>
    <?= $this->Html->link('Gestisci domanda', ['action' => 'manage', $defense->id], ['class' => 'btn btn-primary mt-3']) ?>
<?php endif; ?>
<?= $this->element('card-end') ?>
