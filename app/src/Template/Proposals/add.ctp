<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */ if ($proposal != null): ?>
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
        Caps.cds = "<?php echo h($settings['cds']); ?>";
    </script>
<?php endif; ?>
<?php
    // This revision number needs to be incremented when adjusting the JS code,
    // so that the browser will be forced to drop the cache on the older versions.
    // We may want to handle this automatically at some point.
    // echo $this->Html->script('proposals/add.js?rev=4');
?>

<div class="d-flex align-items-center justify-content-between">
        <h2>Nuovo piano di studio</h2>
        <div id="loadingIcon" class="spinner-border spinner-border-sm text-primary float-right"
             role="status">
            <span class="sr-only">Loading...</span>
        </div>
</div>

<div id="app">
</div>

<div id="completeForm">
<?php
echo $this->Form->create(null);
?>

<?php echo $this->element('card-start'); ?>
    <div id="curriculum-select"></div>
    <div id="proposalNotes"></div>
<?php echo $this->element('card-end'); ?>

<div id=proposalForm></div>

<?php echo $this->element('card-start', [ 'style' => 'display: none;', 'id' => 'submit-block' ]); ?>
    <div id="proposalWarning"></div>
    <div class="form-group btn-group">
        <input id="submit-button" type="submit" class="btn btn-success" name="action-close" value="Sottometti piano di studio">
        <input id="save-button" type="submit" class="btn btn-primary" name="action-save" value="Salva bozza">
    </div>
<?php echo $this->element('card-end'); ?>

<?php
echo $this->Form->end();
?>
</div>
