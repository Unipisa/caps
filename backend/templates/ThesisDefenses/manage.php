<h1>Gestione domanda di partecipazione</h1>
<?= $this->element('card-start') ?>
<?= $this->element('thesis-defense-details', ['defense' => $defense]) ?>
<hr>
<?= $this->Form->create($defense) ?>
<?= $this->Form->control('state', ['label' => 'Stato', 'options' => [
    'submitted' => 'Da valutare', 'approved' => 'Approvata', 'rejected' => 'Respinta',
], 'class' => 'form-control']) ?>
<?= $this->Form->control('scheduled_at', [
    'label' => 'Data e ora della discussione (' . $Caps['timezone'] . ')',
    'type' => 'datetime-local',
    'class' => 'form-control',
    'value' => $defense->scheduled_at ? $defense->scheduled_at->setTimezone($Caps['timezone'])->format('Y-m-d\TH:i') : '',
]) ?>
<small class="form-text text-muted">Inserire l'orario nel fuso orario <?= h($Caps['timezone']) ?>.</small>
<?= $this->Form->control('venue', ['label' => 'Sede / aula', 'class' => 'form-control']) ?>
<div class="mt-3">
    <?= $this->Form->button('Salva', ['class' => 'btn btn-primary']) ?>
    <?= $this->Html->link('Annulla', ['action' => 'index'], ['class' => 'btn btn-secondary ml-2']) ?>
</div>
<?= $this->Form->end() ?>
<?= $this->element('card-end') ?>
