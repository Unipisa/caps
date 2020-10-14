<h2>Utenti</h2>

<div id="proposalFilterFormDiv">
<?php
    echo $this->Form->create($filterForm, ['type' => 'GET', 'class' => 'filterForm']);
    echo $this->Form->control('admin',
    [
    'label' => __('ruolo'),
    'type' => 'select',
    'options' => [
        'all' => __('tutti'),
        'admin' => __('admin')
    ],
    'onchange' => 'this.form.submit()'
    ]);
    echo $this->Form->control('email',
    [
        'label' => __('email'),
        'onchange' => 'this.form.submit()'
    ]);
    echo $this->Form->control('surname',
    [
        'label' => __('cognome'),
        'onchange' => 'this.form.submit()'
    ]);
    echo $this->Form->control('givenname',
    [
        'label' => __('nome'),
        'onchange' => 'this.form.submit()'
    ]);
    echo $this->Form->end(); 
?>
</div>

<?php echo $this->Form->create(); ?>
<table class="caps-users">
    <tr>
        <th></th>
        <th>Matricola</th>
        <th>Username</th>
        <th>Email</th>
        <th><?= $this->Paginator->sort('surname', 'Cognome'); ?></th>
        <th><?= $this->Paginator->sort('givenname', 'Nome'); ?></th>
        <th><?= $this->Paginator->sort('admin', 'Role'); ?></th>
    </tr>
<?php foreach ($paginated_users as $user): ?>
    <tr>
        <td class="caps-admin-user-id"><input type=checkbox name="selection[]" value="<?php echo $user['id']; ?>"></td>
        <td class="caps-admin-user-matricola">
            <?php echo $this->Html->link(
                $user['number'],
                ['action' => 'view', $user['id']]);
            ?></td>
        <td class="caps-admin-user-username">
            <?php echo $this->Html->link(
                $user['username'],
                ['action' => 'view', $user['id']]);
            ?></td>
        <td class="caps-admin-user-email">
            <?php echo $user['email'] ?>
        </td>
        <td class="caps-admin-user-surname">
            <?php echo $this->Html->link(
                $user['surname'],
                ['action' => 'view', $user['id']]);
            ?></td>
        <td class="caps-admin-user-givenname">
            <?php echo $this->Html->link(
                $user['givenname'],
                ['action' => 'view', $user['id']]);
            ?></td>
        <td class="caps-admin-user-admin">
            <?php
                echo $user['admin'] ? "admin" : "";
            ?>
        </td>
    </tr>
<?php endforeach; ?>
</table>

<?php echo $this->element('pagination'); ?>

<div class="caps-admin-actions">
    <ul>
        <li>
            <div class="submit"><input class="red" type="submit" name="clear_admin" style="width:100%" onclick="return confirm('Confermi di voler rimuovere gli utenti selezionati dagli amministratori?')" value="✗ Rimuovi dagli amministratori"/></div>
        </li>
        <li>
            <div class="submit"><input class="yellow" type="submit" name="set_admin" style="width:100%" onclick="return confirm('Confermi di voler aggiungere gli utenti selezionati agli amministratori?')" value="✓ Aggiungi agli amministratori"/></div>
        </li>
    </ul>
</div>

<?php echo $this->Form->end(); ?>
