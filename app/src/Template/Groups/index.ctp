<?php echo $this->element('update_navigation'); ?>

<h2>Gruppi</h2>
<?php echo $this->Form->create(); ?>
<table class="caps-groups">
    <tr>
        <th></th>
        <th>Nome</th>
    </tr>
    <?php foreach ($groups as $group): ?>
    <tr>
        <td class="caps-admin-groups-id"><input type=checkbox name="selection[]" value="<?php echo $group['id']; ?>"></td>
        <td class="caps-admin-groups-name">
            <?php
                echo $this->Html->link(
                    $group['name'],
                    [   'action' => 'view',
                        $group['id']]
                );
            ?>
        </td>
    </tr>
    <?php endforeach ?>
    <?php unset($group) ?>
</table>

<div class="caps-admin-add">
    <ul>
        <li>
            <?php
                echo $this->Html->link(
                    'Aggiungi gruppo',
                    ['controller' => 'groups',
                        'action' => 'edit']
                );
            ?>
        </li>
        <li>
            <div class="submit"><input type="submit" name="delete" style="width:100%" onclick="return confirm('Confermi di voler rimuovere i gruppi selezionati?')" value="Elimina i gruppi selezionati"/></div>
        </li>
    </ul>
</div>
<?php echo $this->Form->end(); ?>
