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

<div class="d-flex align-items-center justify-content-between">
        <h2>Nuovo piano di studio</h2>
        <div id="loadingIcon" class="spinner-border spinner-border-sm text-primary float-right"
             role="status" style="position: relative; top: -12px;">
            <span class="sr-only">Loading...</span>
        </div>
</div>

<div id="completeForm">
<?php
echo $this->Form->create('Proposal');
?>
<div class="row my-2">
    <div class="col-12">
        <div class="card shadow">
            <div class="card-body">
                <div id="curriculum-select"></div>
                <div id="proposalNotes"></div>
            </div>
        </div>
    </div>
</div>

<div id=proposalForm></div>

<div class="row my-2" id="submit-block" style="display: none">
    <div class="col-12">
        <div class="card shadow">
            <div class="card-body">
                <div id="proposalWarning"></div>
                <div class="form-group btn-group">
                    <input id="submit-button" type="submit" class="btn btn-success" name="action-close" value="Sottometti piano di studio">
                    <input id="save-button" type="submit" class="btn btn-primary" name="action-save" value="Salva bozza">
                </div>
            </div>
        </div>
    </div>
</div>
<?php
echo $this->Form->end();
?>
</div>
