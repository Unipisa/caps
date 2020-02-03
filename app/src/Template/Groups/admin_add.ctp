<?php echo $this->element('updating_navigation'); ?>

<h2>Aggiungi gruppo</h2>
<?php
    echo $this->Form->create(
        'Group',
        ['action' => 'adminAdd']
    );
    echo $this->Form->input(
        'name',
        ['label' => 'Nome']
    );
    echo $this->Form->control(
        'exams._ids',
        ['label' => 'Esami',
            'size' => 20]
    );
    echo $this->Form->submit('Salva gruppo');
    echo $this->Form->end();
?>
