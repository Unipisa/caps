<h1>Impostazioni</h1>

<?= $this->element('card-start') ?>

    <?php echo $this->Form->create(); ?>
    <?php foreach ($settings_data as $setting): ?>
        <?php
            echo $this->Form->control($setting->field, [
                'label' => $setting->field,
                'value' => $setting->value,
                'type' => $setting->fieldtype
            ]);
        ?>
    <?php endforeach; ?>
    <?php
    echo $this->Form->submit('Salva impostazioni');
    ?>
    <?php echo $this->Form->end(); ?>
<?= $this->element('card-end') ?>
