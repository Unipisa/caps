<?php
$this->extend('/Email/html/proposal_base');
?>
<h3>Piano di studi approvato</h3>
<p>
    Il piano di studi presentato per la <?= $proposal['curriculum']['degree']['name'] ?>,
    <?= $settings['department'] ?>, curriculum <?= $proposal['curriculum']['name'] ?>
    è stato <strong>approvato</strong>.
</p>
