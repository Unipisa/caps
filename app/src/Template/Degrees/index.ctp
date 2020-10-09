<h1>Corsi di Laurea</h1>

<div class="row">
    <div class="col">
        <div class="card shadow my-2">
            <div class="card-body">
                <?php echo $this->Form->create('', ['id' => 'form-degree']); ?>
                <table class="table">
                    <tr><thead>
                        <th></th>
                        <th>Nome</th>
                        <th>Anni</th>
                        <th>Richiesta parere</th>
                        </thead>
                    </tr>
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

                <a href="<?= $this->Url->build([ 'action' => 'edit']); ?>">
                    <button type="button" class="btn btn-primary">
                        Aggiungi corso di laurea
                    </button>
                </a>

                <input class="btn btn-danger" type="submit" name="delete"
                       onclick="return confirm('Confermi di voler rimuovere i corsi selezionati?')"
                       value="Elimina i corsi selezionati"/>

                <?php echo $this->Form->end(); ?>
            </div>
        </div>
    </div>
</div>
