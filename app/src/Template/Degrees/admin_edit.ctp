<?php echo $this->element('updating_navigation'); ?>

<h2>Modifica corso di laurea</h2>
<?php
echo $this->Form->create($degree);
echo $this->Form->control(
    'name'
);
echo $this->Form->submit('Aggiorna');
echo $this->Form->end();
?>
