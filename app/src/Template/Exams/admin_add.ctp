<?php echo $this->element('updating_navigation'); ?>

<h2>Aggiungi esame</h2>
<?php
<<<<<<< HEAD
    echo $this->Form->create($exam);
=======
    echo $this->Form->create(
        $exam,
        array(
            'action' => 'admin_add'
        )
    );
>>>>>>> 7f326f8ec968cb20f7b3c3e142fcab040562ef59
    echo $this->Form->control(
        'name', ['label' => 'Nome']);
    echo $this->Form->control(
        'code',
        ['label' => 'Codice']);
    echo $this->Form->control(
        'sector',
        ['label' => 'Settore']);
    echo $this->Form->control(
        'credits',
        ['label' => 'Crediti',
         'type' => 'number']);
    echo $this->Form->control(
        'groups._ids',
        ['label' => 'Gruppi']);
    echo $this->Form->submit('Salva esame');
    echo $this->Form->end();
?>
