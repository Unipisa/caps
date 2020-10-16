<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */
?>
<h1>Utenti</h1>

<?= $this->element('card-start'); ?>

<div class="d-flex mb-2">
    <?= $this->element('filter-button', ['items' => [
        'admin' => [
            'label' => __('ruolo'),
            'type' => 'select',
            'options' => [
                '' => __('tutti'),
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
