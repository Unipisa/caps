<h1>Richiedi parere</h1>

<?= $this->element('card-start'); ?>
<?php
    echo $this->Form->create($proposal_auth);
    echo $this->Form->control(
        'email',
        ['label' => 'Email']);
    echo $this->Form->submit('Invia richiesta');

    echo $this->Form->end();
?>
<?= $this->element('card-end'); ?>


