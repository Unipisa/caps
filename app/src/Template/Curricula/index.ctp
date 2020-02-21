<?php echo $this->element('update_navigation'); ?>

<h2>Curricula</h2>
<table>
    <tr>
        <th>Id</th>
        <th>Anno</th>
        <th>Laurea</th>
        <th>Nome</th>
        <th>Azioni</th>
    </tr>
    <?php foreach ($curricula as $curriculum): ?>
    <tr>
        <td class="caps-admin-curricula-id"><?php echo $curriculum['id']; ?></td>
        <td class="caps-admin-curricula-year"><?php echo $curriculum['academic_year']; ?></td>
        <td class="caps-admin-curricula-degree"><?php echo $curriculum['degree']['name']; ?></td>
        <td class="caps-admin-curricula-name">
            <?php
                echo $this->Html->link(
                    $curriculum['name'],
                    [   'controller' => 'curricula',
                        'action' => 'view',
                        $curriculum['id']]
                );
            ?>
        </td>
        <td class="caps-admin-curricula-actions">
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            __('Modifica'),
                            ['controller' => 'curricula',
                                'action' => 'edit',
                                $curriculum['id']],
                            ['class' => 'accept']
                        )." ".$this->Form->postLink(
                            __('Cancella'),
                            ['action' => 'delete',
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
                        'action' => 'edit']
                );
            ?>
        </li>
    </ul>
</div>
