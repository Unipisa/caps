<nav class="caps-admin-navigation actions">
    <ul>
        <li class="caps-admin-link">
            <?php
                echo $this->Html->link(
                    '↑&nbsp;Indietro',
                    ['action' => 'index'],
                    ['escape' => false]
                );
            ?>
        </li>
        <li class="caps-admin-link">
            <?php
                echo $this->Html->link(
                    '✎&nbsp;Modifica',
                    ['action' => 'edit', $group['id']],
                    ['escape' => false]
                );
            ?>
        </li>
        <li class="">
            <?php
                echo $this->Form->postLink(
                    '✗&nbsp;Elimina',
                    ['action' => 'delete', $group['id']],
                    ['escape' => false,
                     'class' => 'action reject',
                     'confirm' => __('Sei sicuro di voler cancellare questo gruppo?')
                    ]
                );
            ?>
        </li>
    </ul>
</nav>

<h2><?php echo $group['name']; ?></h2>

<table>
    <tr>
        <th>Id</th>
        <th>Nome</th>
        <th>Codice</th>
        <th>Settore</th>
        <th>Crediti</th>
    </tr>
    <?php foreach ($group['exams'] as $exam): ?>
    <tr>
        <td><?php echo $exam['id']; ?></td>
        <td>
            <?php echo $this->Html->link($exam['name'],
                ['controller' => 'exams', 'action' => 'edit', $exam['id']]); ?>
        </td>
        <td><?php echo $exam['code']; ?></td>
        <td><?php echo $exam['sector']; ?></td>
        <td><?php echo $exam['credits']; ?></td>
    </tr>
    <?php endforeach ?>
    <?php unset($exam); ?>
</table>
