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
                var curriculaURL = "<?php echo $this->Url->build(
                    [ 'controller' => 'curricula', 'action' => 'index', '_ext' => 'json']);
                ?>";
      </script>
    <?php
}?>
<?php echo $this->Html->script('proposals/add.js'); ?>

<h2>Nuovo piano di studio
    <span id="loadingIcon">
        <?php echo $this->Html->image('loading32s.gif') ?>
    </span>
</h2>

<div id="completeForm">
<?php
echo $this->Form->create('Proposal');
?>
<div id="curriculum-select"></div>
<div id=proposalForm></div>
<div id="proposalWarning"></div>
<?php
echo $this->Form->submit('Chiudi Piano di Studio');
echo $this->Form->end();
?>
</div>
