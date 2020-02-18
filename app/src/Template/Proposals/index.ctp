<nav class="caps-admin-navigation">
    <ul>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li class="caps-update-link">
          <?php
              echo $this->Html->link(
                  'Aggiornamento&nbsp;→',
                  ['controller' => 'curricula',
                      'action' => 'index'],
                  ['escape' => false]
              );
          ?>
      </li>
    </ul>
</nav>

<div id="proposalFilterFormDiv">
<?php
echo $this->Form->create($filterForm, ['type' => 'GET', 'class' => 'proposalsFilterForm']);
echo $this->Form->control('status',
  [
   'label' => __('stato'),
   'type' => 'select',
   'options' => [
     'all' => __('tutti'),
     'pending' => __('da valutare'),
     'approved' => __('approvati'),
     'archived' => __('congelati')
   ],
   'onchange' => 'this.form.submit()'
 ]);
echo $this->Form->control('surname',
  [
    'label' => __('cognome'),
    'onchange' => 'this.form.submit()'
  ]);
echo $this->Form->control('academic_year',
  [
    'label' => __('anno'),
    'onchange' => 'this.form.submit()'
  ]);
echo $this->Form->control('degree',
  [
    'label' => __('laurea'),
    'onchange' => 'this.form.submit()'
  ]);
echo $this->Form->end();
?>
</div>

<h2>Piani di Studio</h2>
<table class="caps-todo">
    <tr>
        <th>Nome</th>
        <th>Anno</th>
        <th>Laurea</th>
        <th>Piano di Studio</th>
        <th>Azioni</th>
    </tr>
<?php foreach ($proposals as $proposal): ?>
<?php
  if (count($proposal['curriculum'])>0) {
    $curriculum = $proposal['curriculum'][0];
  } else {
    // WORKAROUND finche' il database contiene inconsistenze
    $curriculum = [
      'academic_year' => '???',
      'degree' => ['name' => '???'],
      'name' => '???'
    ];
  }
?>
    <tr>
        <td class="caps-admin-proposal-name">
            <?php echo $this->Html->link($proposal['user']['name'], [
                    'controller' => 'users',
                    'action' => 'view',
                    $proposal['user']['id']
                ]);
            ?></td>
        <td class="caps-admin-proposal-year">
            <?php
                echo $this->Html->link(
                    $curriculum['academic_year'],
                    ['action' => 'view', $proposal['id']]
                );
            ?>
        </td>
        <td class="caps-admin-proposal-degree">
            <?php
                echo $this->Html->link(
                    $curriculum['degree']['name'],
                    ['action' => 'view', $proposal['id']]
                );
            ?>
        </td>
        <td class="caps-admin-proposal-pds">
            <?php
                echo $this->Html->link(
                    $curriculum['name'],
                    ['action' => 'view', $proposal['id']]
                );
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
