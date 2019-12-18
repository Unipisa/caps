<?php echo $this->element('updating_navigation'); ?>

<h2>Aggiungi curriculum</h2>
<?php
    echo $this->Form->create(
        'Curriculum',
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
    echo $this->Form->end('Salva curriculum');
?>
