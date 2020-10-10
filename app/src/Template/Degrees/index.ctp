<h1>Corsi di Laurea</h1>

<?= $this->element('card-start'); ?>
    <?php echo $this->Form->create('', ['id' => 'form-degree']); ?>

    <div class="mb-2 d-flex">
        <a href="<?= $this->Url->build([ 'action' => 'edit']); ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary">
                Aggiungi corso di laurea
            </button>
        </a>

        <input class="btn btn-sm btn-danger" type="submit" name="delete"
               onclick="return confirm('Confermi di voler rimuovere i corsi selezionati?')"
               value="Elimina i corsi selezionati"/>
    </div>

    <table class="table">
        <thead>
        <tr>
            <th></th>
            <th>Nome</th>
            <th>Anni</th>
            <th>Richiesta parere</th>
        </tr>
        </thead>
        <?php foreach ($degrees as $degree): ?>
            <tr>
                <td >
                    <input type=checkbox name="selection[]" value="<?php echo $degree['id']; ?>">
                </td>
                <td>
                    <?php
                    echo $this->Html->link(
                        $degree['name'],
                        [   'controller' => 'degrees',
                            'action' => 'view',
                            $degree['id']]
                    );
                    ?>
                </td>
                <td>
                    <?php echo ($degree['years']) ?>
                </td>
                <td>
                    <?php
                    if ($degree['enable_sharing']) {
                        echo "Abilitata";
                    }
                    else {
                        echo "Non abilitata";
                    }
                    ?>
                </td>
            </tr>
        <?php endforeach ?>
        <?php unset($degree); ?>
    </table>
    <?php echo $this->Form->end(); ?>
<?= $this->element('card-end'); ?>

