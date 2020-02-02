<?php echo $this->element('updating_navigation'); ?>

<h2>Aggiungi curriculum</h2>
<?php
    echo $this->Form->create(
        'Curriculum',
        ['action' => 'adminAdd']
    );
    echo $this->Form->input(
        'name',
        ['label' => 'Nome']
    );
    echo $this->Form->submit('Salva curriculum');
    echo $this->Form->end();
?>
