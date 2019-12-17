<?php echo $this->element('updating_navigation'); ?>

<h2>Aggiungi gruppo</h2>
<?php
    echo $this->Form->create(
        'Group',
        array(
            'action' => 'adminAdd'
        )
    );
    echo $this->Form->input(
        'name',
        array(
            'label' => 'Nome'
        )
    );
    echo $this->Form->control(
        'exams._ids',
        array(
            'label' => 'Esami',
            'size' => 20
        )
    );
    echo $this->Form->submit('Salva gruppo');
    echo $this->Form->end();
?>
