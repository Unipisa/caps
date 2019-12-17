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
                    array('action' => 'adminReview', $proposal['id'])
                );
            ?>
        </td>
        <td>
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            'Approva ✓',
                            array('action' => 'adminApprove', $proposal['id']),
                            array('class' => 'accept')
                        );
                    ?>
                </li>
                <li>
                    <?php 
                        echo $this->Html->link(
                            'Rifiuta ✗',
                            array('action' => 'adminReject', $proposal['id']),
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
        <td><?php echo $proposal['user']['name']; ?></td>
        <td>
            <?php
                echo $this->Html->link(
                    $proposal['curriculum'][0]['name'],
                    array('action' => 'review', $proposal['id'])
                );
            ?>
        </td>
        <td>
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            'Riapri ✎',
                            array('action' => 'adminReject', $proposal['id'])
                        );
                    ?>
                </li>
                <li>
                    <?php
                        echo $this->Html->link(
                            'Archivia',
                            array('action' => 'adminFreeze', $proposal['id'])
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
