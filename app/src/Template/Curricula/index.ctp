<h2>Curricula</h2>

<table>
    <tr>
        <th>Id</th>
        <th>Nome</th>
    </tr>
    <?php foreach ($curricula as $curriculum): ?>
    <tr>
        <td><?php echo $curriculum['Curriculum']['id']; ?></td>
        <td>
            <?php echo $this->Html->link(
                $curriculum['Curriculum']['name'],
                array('controller' => 'curricula', 'action' => 'view', $curriculum['Curriculum']['id'])); ?>
        </td>
    </tr>
    <?php endforeach ?>
    <?php unset($curriculum); ?>
</table>
