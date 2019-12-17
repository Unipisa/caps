<?php echo $this->element('updating_navigation'); ?>

<h2>Modifica gruppo</h2>
<?php
    // debug($group);
    echo $this->Form->create($group);
    echo $this->Form->input(
        'name',
        array(
            'label' => 'Nome'
        )
    );
    echo $this->Form->control('exams._ids', [ 'size' => 20 ]);
    echo $this->Form->submit('Modifica gruppo');
    echo $this->Form->end();
?>
