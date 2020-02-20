<?php echo $this->element('updating_navigation'); ?>

<?php if ($exam->isNew()): ?>
	<h2>Aggiungi esame</h2>
<?php else: ?>
	<h2>Modifica esame</h2>
<?php endif; ?>

<?php
    echo $this->Form->create($exam);
    echo $this->Form->control(
        'id',
        ['type' => 'hidden']);
    echo $this->Form->control(
        'code',
        ['label' => 'Codice']);
    echo $this->Form->control(
        'name',
        ['label' => 'Nome']);
    echo $this->Form->control(
        'sector',
        ['label' => 'Settore']);
    echo $this->Form->control(
        'credits',
        ['label' => 'Crediti',
				 'type' => 'number']);
    echo $this->Form->control(
        'groups._ids',
        ['label' => 'Gruppi',
            'size' => 20]);
		if ($exam->isNew()):
			echo $this->Form->submit('Salva esame');
		else:
    	echo $this->Form->submit('Aggiorna esame');
		endif;
    echo $this->Form->end();
?>
