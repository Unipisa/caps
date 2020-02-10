<?php echo $this->element('update_navigation'); ?>

<h2>Corsi di Laurea</h2>
<table>
    <tr>
        <th>Id</th>
        <th>Nome</th>
        <th>Azioni</th>
    </tr>
    <?php foreach ($degrees as $degree): ?>
        <tr>
            <td class="caps-admin-curricula-id"><?php echo $degree['id']; ?></td>
            <td class="caps-admin-curricula-name">
                <?php
                echo $this->Html->link(
                    $degree['name'],
                    ['controller' => 'degrees',
                        'action' => 'admin_edit',
                        $degree['id']]
                );
                ?>
            </td>
            <td class="caps-admin-curricula-actions">
                <ul class="actions">
                    <li>
                        <?php
                        echo $this->Form->postLink(
                            __('Cancella'),
                            ['action' => 'admin_delete',
                                $degree['id']],
                            ['class' => 'reject'],
                            __('Sei sicuro di voler cancellare il curriculum "%s"?', $degree['name'])
                        );
                        ?>
                    </li>
                </ul>
            </td>
        </tr>
    <?php endforeach ?>
    <?php unset($degree); ?>
</table>

<div class="caps-admin-add">
    <ul>
        <li>
            <?php
            echo $this->Html->link(
                'Aggiungi corso di laurea',
                [ 'action' => 'admin_add']
            );
            ?>
        </li>
    </ul>
</div>
