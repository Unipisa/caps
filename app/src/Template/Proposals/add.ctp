<?php if ($proposal != null) {
    ?>
      <script type="text/javascript">
        var proposal = <?php echo json_encode($proposal); ?>;
	var curriculumURL = "<?php echo $this->Url->build('/'); ?>curricula/view/";
	var examsURL = "<?php echo $this->Url->build('/'); ?>exams.json";
	var groupsURL = "<?php echo $this->Url->build('/'); ?>groups.json";
      </script>
    <?php
}?>
<script src="<?php echo $this->Url->build('/'); ?>js/proposals/add.js" type="text/javascript"></script>

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
