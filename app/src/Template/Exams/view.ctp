<h2><?php echo $exam['Exam']['name']; ?></h2>

<table>
    <tr>
        <th>Id</th>
        <th>Nome</th>
        <th>Codice</th>
        <th>Settore</th>
        <th>Crediti</th>
    </tr>
    <tr>
        <td><?php echo $exam['id']; ?></td>
        <td><?php echo $exam['name']; ?></td>
        <td><?php echo $exam['code']; ?></td>
        <td><?php echo $exam['sector']; ?></td>
        <td><?php echo $exam['credits']; ?></td>
    </tr>
</table>
