<?php if ($proposal != null): ?>
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
        var Caps = {
            'cds': "<?php echo $settings['cds']; ?>"
        }
    </script>
<?php endif; ?>
<?php
    // This revision number needs to be incremented when adjusting the JS code,
    // so that the browser will be forced to drop the cache on the older versions.
    // We may want to handle this automatically at some point.
    echo $this->Html->script('proposals/add.js?rev=4');
?>

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
<div id="proposalNotes"></div>
<div id=proposalForm></div>
<div id="proposalWarning"></div>
<div class="form-group btn-group">
    <input id="submit-button" type="submit" class="btn btn-success" name="action-close" value="Sottometti piano di studio">
    <input id="save-button" type="submit" class="btn btn-primary" name="action-save" value="Salva bozza">
</div>
<?php
echo $this->Form->end();
?>
</div>
