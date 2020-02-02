<?php echo $this->element('updating_navigation'); ?>

<h2>Modifica esame</h2>
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
        ['label' => 'Crediti']);
    echo $this->Form->control(
        'groups._ids',
        ['label' => 'Gruppi',
            'size' => 20]);
    echo $this->Form->submit('Aggiorna esame');
    echo $this->Form->end();
?>
