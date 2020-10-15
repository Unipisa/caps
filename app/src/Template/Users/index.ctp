<h1>Utenti</h1>

<?= $this->element('card-start'); ?>

<div class="d-flex mb-2">
    <?= $this->element('filter-button', ['items' => [
        'admin' => [
            'label' => __('ruolo'),
            'type' => 'select',
            'options' => [
                'all' => __('tutti'),
                'admin' => __('admin')]],
        'email' => __('email'),
        'surname' => __('cognome'),
        'givenname' => __('nome')]]) ?>

    <button type="button" class="ml-2 btn btn-sm btn-primary" onclick="Caps.submitForm('admin-form', { 'set_admin' : 1 }, 'Confermi di voler aggiungere gli utenti selezionati agli amministratori?')">
        Aggiungi agli amministratori
    </button>

    <button type="button" class="ml-2 btn btn-sm btn-danger" onclick="Caps.submitForm('admin-form', { 'clear_admin': 1}, 'Confermi di voler rimuovere gli utenti selezionati dagli amministratori?')">
        Rimuovi dagli amministratori
    </button>
</div>

<?php echo $this->element('filter_badges'); ?>

<?php echo $this->Form->create('', [ 'id' => 'admin-form' ]); ?>
<table class="table">
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

<?php echo $this->Form->end(); ?>

<?= $this->element('card-end'); ?>
