<?php echo $this->element('update_navigation'); ?>

<h2>Gruppi</h2>
<table class="caps-groups">
    <tr>
        <th>Id</th>
        <th>Nome</th>
        <th>Azioni</th>
    </tr>
    <?php foreach ($groups as $group): ?>
    <tr>
        <td class="caps-admin-groups-id"><?php echo $group['id']; ?></td>
        <td class="caps-admin-groups-name">
            <?php
                echo $this->Html->link(
                    $group['name'],
                    ['controller' => 'groups',
                        'action' => 'edit',
                        $group['id']]
                );
            ?>
        </td>
        <td class="caps-admin-groups-actions">
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Form->postLink(
                            __('Cancella'),
                            ['action' => 'adminDelete',
                                $group['id']],
                            [
                              'class' => 'reject',
                              'confirm' => __('Sei sicuro di voler cancellare il gruppo "{0}"?', $group['name'])
                            ]
                        );
                    ?>
                </li>
            </ul>
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
    </ul>
</div>
