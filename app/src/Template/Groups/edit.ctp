<?php echo $this->element('updating_navigation'); ?>

<?php if ($group->isNew()): ?>
<h2>Aggiungi gruppo</h2>
<?php else: ?>
<h2>Modifica gruppo</h2>
<?php endif; ?>
<?php
    // debug($group);
    echo $this->Form->create($group);
    echo $this->Form->input(
        'name',
        ['label' => 'Nome']
    );
    echo $this->Form->control('exams._ids', [ 'size' => 20 ]);
    if ($group->isNew()):
      echo $this->Form->submit('Salva gruppo');
    else:
      echo $this->Form->submit('Modifica gruppo');
    endif;
    echo $this->Form->end();
?>
