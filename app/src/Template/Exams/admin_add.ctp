<?php echo $this->element('updating_navigation'); ?>

<h2>Aggiungi esame</h2>
<?php
    echo $this->Form->create(
        $exam,
        array(
            'action' => 'admin_add'
        )
    );
    echo $this->Form->control(
        'name',
        array(
            'label' => 'Nome'
        )
    );
    echo $this->Form->control(
        'code',
        array(
            'label' => 'Codice'
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
            'label' => 'Crediti',
            'type' => 'number'
        )
    );
    echo $this->Form->control(
        'groups._ids',
        array(
            'label' => 'Gruppi'
        )
    );
    echo $this->Form->submit('Salva esame');
    echo $this->Form->end();
?>
