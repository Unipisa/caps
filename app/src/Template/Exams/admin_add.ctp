<?php echo $this->element('updating_navigation'); ?>

<h2>Aggiungi esame</h2>
<?php
    echo $this->Form->create(
        'Exam',
        array(
            'action' => 'add'
        )
    );
    echo $this->Form->input(
        'name',
        array(
            'label' => 'Nome'
        )
    );
    echo $this->Form->input(
        'code',
        array(
            'label' => 'Codice'
        )
    );
    echo $this->Form->input(
        'sector',
        array(
            'label' => 'Settore'
        )
    );
    echo $this->Form->input(
        'credits',
        array(
            'label' => 'Crediti',
            'type' => 'number'
        )
    );
    echo $this->Form->input(
        'Group',
        array(
            'label' => 'Gruppi'
        )
    );
    echo $this->Form->end('Salva esame');
?>
