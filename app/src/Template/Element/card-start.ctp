<?php
// Parse the options
if (isset($border)) {
    $border_class = " border-left-" . $border;
}
else {
    $border_class = "";
}
?>
<div class="row my-2">
    <div class="col">
        <div class="card shadow<?= $border_class ?>">
            <?php
                // We only generate a header if it has been explicitly passed to the variables for this element
            ?>
            <?php if (isset($header)): ?>
            <div class="card-header bg-primary text-white">
                <h3 class="h5 mb-0">
                    <?= $header ?>
                </h3>
            </div>
            <?php endif; ?>
            <div class="card-body">
