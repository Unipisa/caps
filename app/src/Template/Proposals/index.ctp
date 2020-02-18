<?php echo $this->element('admin_navigation'); ?>

<?php
echo $this->Form->create($filterForm, ['type' => 'GET', 'class' => 'proposalsFilterForm']);
echo $this->Form->control('status',
  ['type' => 'select',
   'options' => [
     'pending' => __('da valutare'),
     'approved' => __('approvati'),
     'archived' => __('congelati')
   ]
 ]);
echo $this->Form->control('surname');
echo $this->Form->end();
?>

<h2>Piani di Studio</h2>
<table class="caps-todo">
    <tr>
        <th>Nome</th>
        <th>Piano di Studio</th>
        <th>Azioni</th>
    </tr>
<?php foreach ($proposals as $proposal): ?>
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
                if (count($proposal['curriculum'])>0) {
                  echo $this->Html->link(
                      $proposal['curriculum'][0]->toString(),
                      ['action' => 'view', $proposal['id']]
                  );
                } else {
                  echo $this->Html->link("curriculum non trovato",
                  ['action' => 'view', $proposal['id']]);
                }
            ?>
        </td>
        <td class="caps-admin-proposal-actions">
            <ul class="actions">
              <?php if ($proposal['submitted'] && !$proposal['approved']):?>
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
              <?php endif; ?>
            </ul>
        </td>
    </tr>
<?php endforeach; ?>
<?php unset($proposal); ?>
</table>

<?php echo $this->element('pagination'); ?>
