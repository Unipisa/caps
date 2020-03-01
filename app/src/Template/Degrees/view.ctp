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
                    ['action' => 'edit', $degree['id']],
                    ['escape' => false]
                );
            ?>
        </li>
        <li class="">
            <?php
                echo $this->Form->postLink(
                    '✗&nbsp;Elimina',
                    ['action' => 'delete', $degree['id']],
                    ['escape' => false,
                     'class' => 'action reject',
                     'confirm' => __('Sei sicuro di voler cancellare questo corso?')
                    ]
                );
            ?>
        </li>
    </ul>
</nav>

<h2><?php echo $degree['name']; ?></h2>

<table class="view">
    <tr>
        <th>Nome</th>
        <td><?php echo $degree['name']; ?></td>
    </tr>
    <tr>
        <th>Anni</th>
        <td><?php echo $degree['years']; ?></td>
    </tr>
</table>
