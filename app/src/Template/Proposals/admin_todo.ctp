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
        <td class="caps-admin-proposal-name">
            <?php echo $this->Html->link($proposal['user']['name'], [
                    'controller' => 'users',
                    'action' => 'view',
                    $proposal['user']['id']
                ]);
            ?></td>
        <td class="caps-admin-proposal-pds">
            <?php
                echo $this->Html->link(
                    $proposal['curriculum'][0]->toString(),
                    ['action' => 'view', $proposal['id']]
                );
            ?>
        </td>
        <td class="caps-admin-proposal-actions">
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            'Approva ✓',
                            ['action' => 'adminApprove', $proposal['id']],
                            ['class' => 'accept']
                        );
                    ?>
                </li>
                <li>
                    <?php
                        echo $this->Html->link(
                            'Rifiuta ✗',
                            ['action' => 'adminReject', $proposal['id']],
                            ['class' => 'reject']
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
