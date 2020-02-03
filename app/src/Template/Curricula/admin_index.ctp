<?php echo $this->element('update_navigation'); ?>

<h2>Curricula</h2>
<table>
    <tr>
        <th>Id</th>
        <th>Nome</th>
        <th>Azioni</th>
    </tr>
    <?php foreach ($curricula as $curriculum): ?>
    <tr>
        <td class="caps-admin-curricula-id"><?php echo $curriculum['id']; ?></td>
        <td class="caps-admin-curricula-name">
            <?php
                echo $this->Html->link(
                    $curriculum['name'],
                    ['controller' => 'curricula',
                        'action' => 'admin_edit',
                        $curriculum['id']]
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
                                $curriculum['id']],
                            ['class' => 'reject'],
                            __('Sei sicuro di voler cancellare il curriculum "%s"?', $curriculum['name'])
                        );
                    ?>
                </li>
            </ul>
        </td>
    </tr>
    <?php endforeach ?>
    <?php unset($curriculum); ?>
</table>

<div class="caps-admin-add">
    <ul>
        <li>
            <?php
                echo $this->Html->link(
                    'Aggiungi curriculum',
                    ['controller' => 'curricula',
                        'action' => 'admin_add']
                );
            ?>
        </li>
    </ul>
</div>
