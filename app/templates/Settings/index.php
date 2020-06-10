<?php
/**
 * @var \App\View\AppView $this
 * @var \App\Model\Entity\Setting[]|\Cake\Collection\CollectionInterface $settings
 */
?>
<h2>Impostazioni</h2>

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
