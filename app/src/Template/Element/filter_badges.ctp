<?php
$query_params = $this->request->getQueryParams();
?>

<?php if (count($query_params) > 0): ?>

    <div class="d-flex align-left my-2">
        <?php foreach ($query_params as $key => $value): ?>
            <?php if ($value != ""): ?>
                <a style="cursor: pointer;" onclick="Caps.removeQueryParam('<?= $key ?>');">
                    <span class="filter-badge badge badge-secondary mr-2" title="Rimuovi il filtro <?= $key ?>: <?= $value ?>"><?= $key ?>: <?= $value ?> X</span>
                </a>
            <?php endif; ?>
        <?php endforeach; ?>
        </a>
    </div>

    <script>
        // Add Bootstrap tooltips
        jQuery(function () {
            jQuery('span.filter-badge').tooltip()
        })
    </script>

<?php endif; ?>
