<?php
if (!isset($params['escape']) || $params['escape'] !== false) {
    $message = h($message);
}
?>
<div id="flash-element" class="row mb-4" onclick="document.getElementById('flash-element').style.display='none'">
    <div class="col-12">
        <div class="card shadow border-left-success">
            <div class="card-body">
                <?= $message ?>
            </div>
        </div>
    </div>
</div>
