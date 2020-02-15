<?php echo $this->element('update_navigation'); ?>

<h2>Esami</h2>
<table class="caps-exams">
    <tr>
        <th>Id</th>
        <th>Nome</th>
        <th>Codice</th>
        <th>Settore</th>
        <th>Crediti</th>
        <th>Azioni</th>
    </tr>
<?php foreach ($exams as $exam): ?>
    <tr>
        <td class="caps-admin-exams-id"><?php echo $exam['id']; ?></td>
        <td class="caps-admin-exams-name">
            <?php
                echo $this->Html->link(
                    $exam['name'],
                    ['action' => 'view',
                        $exam['id']]
                );
            ?>
        </td>
        <td class="caps-admin-exams-code"><?php echo $exam['code']; ?></td>
        <td class="caps-admin-exams-sector"><?php echo $exam['sector']; ?></td>
        <td class="caps-admin-exams-credits"><?php echo $exam['credits']; ?></td>
        <td class="caps-admin-exams-actions">
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            __('Modifica'),
                            [
                                'action' => 'edit',
                                $exam['id']],
                            ['class' => 'accept']
                        ) ." ".
                        $this->Form->postLink(
                            __('Cancella'),
                            ['action' => 'delete', $exam['id']],
                            [
                              'class' => 'reject',
                              'confirm' => __('Sei sicuro di voler cancellare l\'esame "{0}"?', $exam['name'])
                            ]
                        );
                    ?>
                </li>
            </ul>
        </td>
    </tr>
<?php endforeach; ?>
</table>

<?php echo $this->element('pagination'); ?>

<div class="caps-admin-add">
    <ul>
        <li>
            <?php
                echo $this->Html->link(
                    'Aggiungi esame',
                    ['controller' => 'exams',
                        'action' => 'edit']
                );
            ?>
        </li>
    </ul>
</div>
