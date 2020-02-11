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
                    $curriculum->toString(),
                    ['controller' => 'curricula',
                        'action' => 'edit',
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
                            [
                              'class' => 'reject',
                              'confirm' => __('Sei sicuro di voler cancellare il curriculum "{0}"?', $curriculum['name'])
                            ]
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
                        'action' => 'add']
                );
            ?>
        </li>
    </ul>
</div>
