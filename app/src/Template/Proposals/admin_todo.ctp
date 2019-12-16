<?php echo $this->element('admin_navigation'); ?>

<h2>Piani di Studio da valutare</h2>
<table class="caps-todo">
    <tr>
        <th>Nome</th>
        <th>Piano di Studio</th>
        <th>Azioni</th>
    </tr>
<?php foreach ($proposalsTodo as $proposal): ?>
    <tr>
        <td class="caps-admin-proposal-name"><?php echo $proposal['User']['name']; ?></td>
        <td class="caps-admin-proposal-pds">
            <?php
                echo $this->Html->link(
                    $proposal['Curriculum'][0]['name'],
                    array('action' => 'admin_review', $proposal['Proposal']['id'])
                );
            ?>
        </td>
        <td class="caps-admin-proposal-actions">
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            'Approva ✓',
                            array('action' => 'approve', $proposal['Proposal']['id']),
                            array('class' => 'accept')
                        );
                    ?>
                </li>
                <li>
                    <?php
                        echo $this->Html->link(
                            'Rifiuta ✗',
                            array('action' => 'reject', $proposal['Proposal']['id']),
                            array('class' => 'reject')
                        );
                    ?>
                </li>
            </ul>
        </td>
    </tr>
<?php endforeach; ?>
<?php unset($proposal); ?>
</table>

<?php echo $this->element('pagination'); ?>
