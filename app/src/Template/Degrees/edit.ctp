<?php echo $this->element('updating_navigation'); ?>

<?php if ($degree->isNew()): ?>
<h2>Aggiungi corso di laurea</h2>
<?php else: ?>
<h2>Modifica corso di laurea</h2>
<?php endif; ?>
<?php
echo $this->Form->create($degree);
echo $this->Form->control(
    'name'
);
echo $this->Form->control(
    'years'
);
if ($degree->isNew()):
  echo $this->Form->submit('Salva corso di laurea');
else:
  echo $this->Form->submit('Aggiorna');
endif;
echo $this->Form->end();
?>
