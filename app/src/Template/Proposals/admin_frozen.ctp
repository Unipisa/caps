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
        <td class="caps-admin-proposal-name"><?php echo $proposal['User']['name']; ?></td>
        <td class="caps-admin-proposal-pds">
            <?php
                echo $this->Html->link(
                    $proposal['Curriculum'][0]['name'],
                    array(
                        'action' => 'admin_review',
                        $proposal['Proposal']['id']
                    )
                );
            ?>
        </td>
        <td class="caps-admin-proposal-actions">
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            'Riapri ✎',
                            array(
                                'action' => 'admin_thaw',
                                $proposal['Proposal']['id']
                            )
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
