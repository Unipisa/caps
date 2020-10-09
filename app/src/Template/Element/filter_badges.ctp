<?php
$query_params = $this->request->getQueryParams();
?>

<?php if (count($query_params) > 0): ?>

    <div class="d-flex align-left my-2">
        <?php foreach ($query_params as $key => $value): ?>
            <?php if ($value != ""): ?>
                <a href="#" onclick="Caps.removeQueryParam('<?= $key ?>');">
                    <span class="badge badge-secondary mr-2"><?= $key ?>: <?= $value ?> X</span>
                </a>
            <?php endif; ?>
        <?php endforeach; ?>
        </a>
    </div>

<?php endif; ?>
