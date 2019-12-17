<h2>Piani di studio</h2>

<h3>Da valutare</h3>
<table class="caps-todo">
    <tr>
        <th>Nome</th>
        <th>Piano di studio</th>
        <th>Azioni</th>
    </tr>
<?php foreach ($proposalsTodo as $proposal): ?>
    <tr>
        <td><?php echo $proposal['user']['name']; ?></td>
        <td>
            <?php
                echo $this->Html->link(
                    $proposal['Curriculum'][0]['name'],
                    array('action' => 'review', $proposal['Proposal']['id'])
                );
            ?>
        </td>
        <td>
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

<h3>Approvati</h3>
<table class="caps-done">
    <tr>
        <th>Nome</th>
        <th>Piano di studio</th>
        <th>Azioni</th>
    </tr>
<?php foreach ($proposalsApproved as $proposal): ?>
    <tr>
        <td><?php echo $proposal['User']['name']; ?></td>
        <td>
            <?php
                echo $this->Html->link(
                    $proposal['Curriculum'][0]['name'],
                    array('action' => 'review', $proposal['Proposal']['id'])
                );
            ?>
        </td>
        <td>
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            'Riapri ✎',
                            array('action' => 'reject', $proposal['Proposal']['id'])
                        );
                    ?>
                </li>
                <li>
                    <?php
                        echo $this->Html->link(
                            'Archivia',
                            array('action' => 'freeze', $proposal['Proposal']['id'])
                        );
                    ?>
                </li>
            </ul>
        </td>
    </tr>
<?php endforeach; ?>
<?php unset($proposal); ?>
</table>
<div class="caps-pagination">
    <?php echo $this->Paginator->prev(
        '«',
        array(),
        null,
        array('class' => 'caps-pagination-disabled')
    ); ?>
    <?php echo $this->Paginator->numbers(); ?>
    <?php echo $this->Paginator->next(
        '&raquo;',
        array('escape' => false),
        null,
        array('class' => 'caps-pagination-disabled')
    ); ?>
</div>
