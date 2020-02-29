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
                    ['action' => 'edit', $exam['id']],
                    ['escape' => false]
                );
            ?>
        </li>
        <li class="">
            <?php
                echo $this->Form->postLink(
                    '✗&nbsp;Elimina',
                    ['action' => 'delete', $exam['id']],
                    ['escape' => false,
                     'class' => 'action reject',
                     'confirm' => __('Sei sicuro di voler cancellare questo esame?')
                    ]
                );
            ?>
        </li>
    </ul>
</nav>

<h2><?php echo $exam['name']; ?></h2>

<table class="view">
    <tr>
        <th>Nome</th>
        <td><?php echo $exam['name']; ?></td>
    </tr>
    <tr>
        <th>Codice</th>
        <td><?php echo $exam['code']; ?></td>
      </tr>
      <tr>
        <th>Settore</th>
        <td><?php echo $exam['sector']; ?></td>
      </tr>
      <tr>
        <th>Crediti</th>
        <td><?php echo $exam['credits']; ?></td>
    </tr>
</table>
