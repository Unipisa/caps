<?php echo $this->element('updating_navigation'); ?>

<h2>Modifica esame</h2>
<?php
    echo $this->Form->create($exam);
    echo $this->Form->control(
        'id',
        array(
            'type' => 'hidden'
        )
    );
    echo $this->Form->control(
        'code',
        array(
            'label' => 'Codice'
        )
    );
    echo $this->Form->control(
        'name',
        array(
            'label' => 'Nome'
        )
    );
    echo $this->Form->control(
        'sector',
        array(
            'label' => 'Settore'
        )
    );
    echo $this->Form->control(
        'credits',
        array(
            'label' => 'Crediti'
        )
    );
    echo $this->Form->control(
        'groups._ids',
        array(
            'label' => 'Gruppi',
            'size' => 20
        )
    );
    echo $this->Form->submit('Aggiorna esame');
    echo $this->Form->end();
?>
