<script src="../../js/proposals/add.js" type="text/javascript"></script>

<h2>Nuovo piano di studio</h2>

<?php echo $this->Form->create('Proposal'); ?>
<?php echo $this->Form->input('id', [ 'hidden' => 'true' ]); ?>
<?php echo $this->Form->control('Curriculum.0.curriculum_id',
    array(
        'empty' => array('text" disabled="disabled" selected="selected' => 'Scegli un curriculum'),
        'label' => '',
        'options' => $curricula
    ));
?>
<div id=proposalForm></div>
<?php
echo $this->Form->submit('Chiudi Piano di Studio');
echo $this->Form->end();
?>
