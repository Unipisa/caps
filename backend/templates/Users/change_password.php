<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
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

<!-- Page Heading -->
<div class="d-sm-flex align-items-center justify-content-between">
    <h1><?php echo $user_entry['name']; ?> <span class="text-muted h5 ml-2">matricola: <?php echo $user_entry['number']; ?></span></h1>
</div>

<?= $this->element('card-start', [ 'header' => 'Generali' ]) ?>

<?= $this->Form->create() ?>
<?php if ($user['password'] === null): ?>
    <p>Attualmente le tue credenziali sono memorizzate altrove. 
    Puoi inserire una password che sarà valida solamente su questo sito</p>
<?php endif; ?>

<div class="form-group">
    <label for="caps-user-new-password">nuova password</label>
    <input id="caps-user-new-password" type="password" class="form-control" name="new_password" value="">
</div>
<div class="form-group">
    <label for="caps-user-check-password">ripeti nuova password</label>
    <input id="caps-user-check-password" type="password" class="form-control" name="check_password" value="">
</div>
<?= $this->element('card-end') ?>

<div class="mt-4"></div>

<?= $this->Form->submit('Cambia password') ?>

<?= $this->Form->end() ?>
