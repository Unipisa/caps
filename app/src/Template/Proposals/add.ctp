<?php if ($proposal != null) {
    ?>
      <script type="text/javascript">
        var proposal = <?php echo json_encode($proposal); ?>;
				var curriculumURL = "<?php echo $this->Url->build(
					[ 'action' => 'view', 'controller' => 'curricula' ]);
				?>/";
				var examsURL = "<?php echo $this->Url->build(
					[ 'controller' => 'exams', 'action' => 'index', '_ext' => 'json']);
					?>";
				var groupsURL = "<?php echo $this->Url->build(
					[ 'controller' => 'groups', 'action' => 'index', '_ext' => 'json']);
					?>";
      </script>
    <?php
}?>
<?php echo $this->Html->script('proposals/add.js'); ?>

<h2>Nuovo piano di studio</h2>
<div id="completeForm">
<?php
echo $this->Form->create('Proposal');
echo $this->Form->control('Curriculum.0.curriculum_id',
    ['empty' => ['text" disabled="disabled" selected="selected' => 'Scegli un curriculum'],
        'label' => '',
        'options' => $curricula]);
?>
<div id=proposalForm></div>
<div id="proposalWarning"></div>
<?php
echo $this->Form->submit('Chiudi Piano di Studio');
echo $this->Form->end();
?>
</div>
