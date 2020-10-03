<h2>Piani di Studio</h2>

<?php if ($user['admin']): ?>

<p>
    <script>
        function downloadCSV() {
            /*
             * This is a bit of a hack: we change the URL in the page to make the
             * controller render the CSV version of the content. This will keep all
             * the specified filters in place.
             */
            location.href = location.href.replace('/proposals?', '/proposals.csv?')
        }
    </script>
    <a href="#" onclick="downloadCSV();">Esporta in CSV</a>
</p>


<div id="proposalFilterFormDiv">
<?php
echo $this->Form->create($filterForm, ['type' => 'GET', 'class' => 'filterForm']);
echo $this->Form->control('state',
  [
   'label' => __('stato'),
   'type' => 'select',
   'options' => [
     'all' => __('tutti'),
     'draft' => __('bozze'),
     'submitted' => __('da valutare'),
     'approved' => __('approvati'),
     'rejected' => __('rifiutati')
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
echo $this->Form->control('curriculum',
  [
    'label' => __('piano'),
    'onchange' => 'this.form.submit()'
  ]);
?>
<?php echo $this->Form->end(); ?>
</div>
<?php endif; ?>

<?php echo $this->Form->create(); ?>
<table class="caps-todo">
    <tr>
        <th></th>
        <th>Stato</th>
        <th><?= $this->Paginator->sort('Users.surname', 'Nome'); ?></th>
        <th><?= $this->Paginator->sort('academic_year', 'Anno'); ?></th>
        <th><?= $this->Paginator->sort('Degress.name', 'Laurea'); ?></th>
        <th><?= $this->Paginator->sort('Curricula.name', 'Piano di studio'); ?></th>
        <th>Azioni</th>
    </tr>
<?php foreach ($proposals as $proposal): ?>
<?php
    $curriculum = $proposal['curriculum'];
?>
    <tr>
        <td class="caps-admin-proposal-id"><input type=checkbox name="selection[]" value="<?php echo $proposal['id']; ?>"></td>
        <td class="caps-admin-proposal-state">
            <?php echo $this->Html->link(
                $proposal->getStateString(),
                ['action' => 'view', $proposal['id']]);
            ?></td>
        <td class="caps-admin-proposal-name">
            <?php echo $this->Html->link(
                $proposal['user']['name'],
                ['controller' => 'users', 'action' => 'view', $proposal['user']['id']]);
            ?></td>
        <td class="caps-admin-proposal-year">
            <?php
                echo $curriculum['academic_year'];
            ?>
        </td>
        <td class="caps-admin-proposal-degree">
            <?php
                echo $this->Html->link(
                    $curriculum['degree']['name'],
                    ['controller' => 'degrees', 'action' => 'view', $curriculum['degree']['id']]
                );
            ?>
        </td>
        <td class="caps-admin-proposal-pds">
            <?php
                echo $this->Html->link(
                    $curriculum['name'],
                    ['controller' => 'curricula', 'action' => 'view', $curriculum['id'] ]
                );
            ?>
        </td>
        <td>
            <?php
            echo $this->Html->link(
                'Visualizza',
                [ 'controller' => 'proposals', 'action' => 'view', $proposal['id'] ]
            );
            ?>
        </td>
    </tr>
<?php endforeach; ?>
<?php unset($proposal); ?>
</table>

<?php echo $this->element('pagination'); ?>

<div class="caps-admin-actions">
    <ul>
        <li>
            <div class="submit"><input class="green" type="submit" name="approve" style="width:100%" onclick="return confirm('Confermi di voler approvare i piani di studio selezionati?')" value="✓ Approva i piani di studio selezionati"/></div>
        </li>
        <li>
            <div class="submit"><input class="red" type="submit" name="reject" style="width:100%" onclick="return confirm('Confermi di voler rifiutare i piani di studio selezionati?')" value="✗ Rifiuta i piani di studio selezionati"/></div>
        </li>
        <li>
            <div class="submit"><input class="yellow" type="submit" name="resubmit" style="width:100%" onclick="return confirm('Confermi di voler riportare in valutazione i piani di studio selezionati?')" value="⎌ Riporta in valutazione i piani di studio selezionati"/></div>
        </li>
        <li>
            <div class="submit"><input class="yellow" type="submit" name="redraft" style="width:100%" onclick="return confirm('Confermi di voler riportare in bozza i piani di studio selezionati?')" value="⎌ Riporta in bozza i piani di studio selezionati"/></div>
        </li>
        <li>
            <div class="submit"><input class="red" type="submit" name="delete" style="width:100%" onclick="return confirm('Confermi di voler rimuovere i piani di studio selezionati?')" value="🗑 Elimina i piani di studio selezionati"/></div>
        </li>
    </ul>
</div>

<?php echo $this->Form->end(); ?>
