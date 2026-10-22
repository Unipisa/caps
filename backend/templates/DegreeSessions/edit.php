<h1><?= $session->isNew() ? 'Nuova' : 'Modifica' ?> sessione di laurea</h1>

<?= $this->element('card-start') ?>
<?= $this->Form->create($session, ['url' => ['action' => 'edit', $session->id]]) ?>
<?= $this->Form->control('type', ['label' => 'Tipo di laurea', 'options' => \App\Model\Entity\DegreeSession::TYPES, 'class' => 'form-control']) ?>
<?= $this->Form->control('name', ['label' => 'Nome della sessione', 'class' => 'form-control', 'placeholder' => 'es. Sessione estiva']) ?>
<?= $this->Form->control('start_date', ['label' => 'Data iniziale', 'type' => 'date', 'class' => 'form-control']) ?>
<div class="form-check">
    <?= $this->Form->control('ask_bachelor_university', ['label' => 'Richiedi corso e ateneo della laurea triennale', 'type' => 'checkbox']) ?>
</div>
<div class="form-check">
    <?= $this->Form->control('ask_second_examiners', ['label' => 'Mostra la lista dei controrelatori proposti', 'type' => 'checkbox']) ?>
</div>
<?= $this->Form->control('instructions', [
    'label' => 'Istruzioni finali (facoltative)',
    'type' => 'textarea',
    'class' => 'form-control caps-settings-html',
    // The shared textarea template hard-codes class, hiding the editor class.
    'templates' => ['textarea' => '<textarea name="{{name}}"{{attrs}}>{{value}}</textarea>'],
    'rows' => 5,
    'help' => 'Testo mostrato alla fine della domanda, prima del pulsante di invio.',
]) ?>
<div class="mt-3">
    <?= $this->Form->button('Salva', ['class' => 'btn btn-primary']) ?>
    <?= $this->Html->link('Annulla', ['action' => 'index'], ['class' => 'btn btn-secondary ml-2']) ?>
</div>
<?= $this->Form->end() ?>
<?= $this->element('card-end') ?>
