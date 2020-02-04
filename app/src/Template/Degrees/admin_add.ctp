<?php echo $this->element('updating_navigation'); ?>

<h2>Aggiungi corso di laurea</h2>
<?php
echo $this->Form->create('Degree');
echo $this->Form->control(
    'name'
);
echo $this->Form->submit('Salva corso di laurea');
echo $this->Form->end();
?>
