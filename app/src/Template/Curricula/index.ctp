<h2>Curricula</h2>

<table>
    <tr>
        <th>Id</th>
        <th>Nome</th>
    </tr>
    <?php foreach ($curricula as $curriculum): ?>
    <tr>
        <td><?php echo $curriculum['id']; ?></td>
        <td>
            <?php echo $this->Html->link(
                $curriculum['name'],
                ['controller' => 'curricula', 'action' => 'view', $curriculum['id']]); ?>
        </td>
    </tr>
    <?php endforeach ?>
    <?php unset($curriculum); ?>
</table>
