<?php
  if (! isset($field)) {
    throw new Exception("The field argument is mandatory for html-element");
  }

  if (! isset($title)) {
    throw new Exception("The title argument is mandatory for html-element");
  }

  if (! isset($description)) {
    throw new Exception("The description argument is mandatory for html-element");
  }
?>

<div class="form-group">
  <label for="caps-setting-<?= $field ?>" class="caps-setting-header"><?= $title ?></label>
  <div class="caps-setting-description">
      <?= $description ?>
  </div>
  <textarea id="caps-setting-<?= $field ?>"
              name="<?= $field ?>" class="form-control caps-settings-html">
      <?= $value ?>
  </textarea>
</div>