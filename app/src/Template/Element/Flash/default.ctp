<?php
$class = 'message';
if (!empty($params['class'])) {
    $class .= ' ' . $params['class'];
}
if (!isset($params['escape']) || $params['escape'] !== false) {
    $message = h($message);
}
?>
<div id="flash-element" class="row mb-4" onclick="document.getElementById('flash-element').style.display='none'">
    <div class="col-12">
        <div class="card shadow border-left-info">
            <div class="card-body">
                <button type="button" class="close" aria-label="Close" onclick="document.getElementById('flash-element').style.display='none'">
                    <span aria-hidden="true">&times;</span>
                </button>
                <?= $message ?>
            </div>
        </div>
    </div>
</div>
