<?php echo $this->element('updating_navigation'); ?>

	<h2>Richiedi parere</h2>

<?php
    echo $this->Form->create($proposal_auth);
    echo $this->Form->control(
        'email',
        ['label' => 'Email']);
    echo $this->Form->submit('Invia richiesta');
    
    echo $this->Form->end();
?>
