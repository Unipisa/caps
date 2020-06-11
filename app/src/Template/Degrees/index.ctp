<?php echo $this->element('update_navigation'); ?>

<h2>Corsi di Laurea</h2>
<?php echo $this->Form->create(); ?>
<table>
    <tr>
        <th></th>
        <th>Nome</th>
        <th>Anni</th>
        <th>Richiesta parere</th>
    </tr>
    <?php foreach ($degrees as $degree): ?>
        <tr>
            <td class="caps-admin-degrees-id"><input type=checkbox name="selection[]" value="<?php echo $degree['id']; ?>"></td>
            <td class="caps-admin-degrees-name">
              <?php
                  echo $this->Html->link(
                      $degree['name'],
                      [   'controller' => 'degrees',
                          'action' => 'view',
                          $degree['id']]
                  );
              ?>
            </td>
            <td class="caps-admin-degrees-years">
                <?php echo ($degree['years']) ?>
            </td>
            <td class="caps-admin-degrees-enable-sharing">
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

<div class="caps-admin-actions">
    <ul>
        <li>
            <?php
            echo $this->Html->link(
                'Aggiungi corso di laurea',
                [ 'action' => 'edit']
            );
            ?>
        </li>
        <li>
            <div class="submit"><input class="red" type="submit" name="delete" style="width:100%" onclick="return confirm('Confermi di voler rimuovere i corsi selezionati?')" value="Elimina i corsi selezionati"/></div>
        </li>
    </ul>
</div>
<?php echo $this->Form->end(); ?>
