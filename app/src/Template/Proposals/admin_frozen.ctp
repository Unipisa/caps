<?php echo $this->element('admin_navigation'); ?>

<h2>Piani di Studio congelati</h2>
<table class="caps-frozen">
    <tr>
        <th>Nome</th>
        <th>Piano di Studio</th>
        <th>Azioni</th>
    </tr>
<?php foreach ($proposalsFrozen as $proposal): ?>
    <tr>
        <td class="caps-admin-proposal-name"><?php echo $proposal['user']['name']; ?></td>
        <td class="caps-admin-proposal-pds">
            <?php
                echo $this->Html->link(
                    $proposal['curriculum'][0]['name'],
                    ['action' => 'admin_review',
                        $proposal['id']]
                );
            ?>
        </td>
        <td class="caps-admin-proposal-actions">
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            'Riapri ✎',
                            ['action' => 'admin_thaw',
                                $proposal['id']]
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
