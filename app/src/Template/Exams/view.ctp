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
        <td><?php echo $exam['Exam']['id']; ?></td>
        <td><?php echo $exam['Exam']['name']; ?></td>
        <td><?php echo $exam['Exam']['code']; ?></td>
        <td><?php echo $exam['Exam']['sector']; ?></td>
        <td><?php echo $exam['Exam']['credits']; ?></td>
    </tr>
</table>
