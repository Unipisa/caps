<?php echo $this->element('updating_navigation'); ?>

<h2>Aggiungi curriculum</h2>
<?php
echo $this->Form->create('Curriculum');
echo $this->Form->control(
    'degree_id'
);
echo $this->Form->control(
    'name'
);
echo $this->Form->control(
    'academic_year'
);
echo $this->Form->submit('Salva curriculum');
echo $this->Form->end();
?>
