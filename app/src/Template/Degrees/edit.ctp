<h1>
    <?= $degree->isNew() ? "Aggiungi corso di Laurea" : "Modifica corso di Laurea" ?>
</h1>

<?= $this->element('card-start'); ?>
    <?php
        echo $this->Form->create($degree);
        echo $this->Form->control('name', ['label' => 'Nome']);
        echo $this->Form->control('years', ['label' => 'Anni']);
    ?>
    <div class="form-check mb-2">
        <?php echo $this->Form->control('enable_sharing', ['label' => 'Richiesta parere abilitata']); ?>
    </div>
    <?php
        if ($degree->isNew()):
            echo $this->Form->submit('Salva corso di laurea');
        else:
            echo $this->Form->submit('Aggiorna');
        endif;
        echo $this->Form->end();
    ?>
<?= $this->element('card-end') ?>

