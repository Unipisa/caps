<h2>Esami</h2>

<table>
    <tr>
        <th>Id</th>
        <th>Nome</th>
        <th>Codice</th>
        <th>Settore</th>
        <th>Crediti</th>
    </tr>
<?php foreach ($exams as $exam): ?>
    <tr>
        <td><?php echo $exam['id']; ?></td>
        <td>
            <?php
                echo $this->Html->link(
                    $exam['name'],
                    array('action' => 'view', $exam['id'])
                );
            ?>
        </td>
        <td><?php echo $exam['code']; ?></td>
        <td><?php echo $exam['sector']; ?></td>
        <td><?php echo $exam['credits']; ?></td>
    </tr>
<?php endforeach; ?>
</table>
