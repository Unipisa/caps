<?php echo $this->element('updating_navigation'); ?>

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
