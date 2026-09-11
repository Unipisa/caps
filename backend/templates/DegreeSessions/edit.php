<h1><?= $session->isNew() ? 'Nuova' : 'Modifica' ?> sessione di laurea</h1>

<?= $this->element('card-start') ?>
<?= $this->Form->create($session) ?>
<?= $this->Form->control('degree_id', ['label' => 'Corso di laurea', 'options' => $degrees, 'class' => 'form-control']) ?>
<?= $this->Form->control('name', ['label' => 'Nome della sessione', 'class' => 'form-control', 'placeholder' => 'es. Sessione estiva']) ?>
<?= $this->Form->control('start_date', ['label' => 'Data iniziale', 'type' => 'date', 'class' => 'form-control']) ?>
<div class="mt-3">
    <?= $this->Form->button('Salva', ['class' => 'btn btn-primary']) ?>
    <?= $this->Html->link('Annulla', ['action' => 'index'], ['class' => 'btn btn-secondary ml-2']) ?>
</div>
<?= $this->Form->end() ?>
<?= $this->element('card-end') ?>
