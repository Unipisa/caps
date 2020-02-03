<h2>Gruppi</h2>

<table>
    <tr>
        <th>Id</th>
        <th>Nome</th>
    </tr>
    <?php foreach ($groups as $group): ?>
    <tr>
        <td><?php echo $group['id']; ?></td>
        <td>
            <?php echo $this->Html->link($group['name'],
                ['controller' => 'groups', 'action' => 'view', $group['id']]); ?>
        </td>
    </tr>
    <?php endforeach ?>
    <?php unset($group) ?>
</table>
