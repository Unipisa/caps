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
<h1><?= $degree['name'] ?></h1>

<?= $this->element('card-start'); ?>
    <div class="d-flex mb-2">
        <a href="<?= $this->Url->build(['action' => 'index']) ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary"><i class="fas fa-arrow-left mr-2"></i>Tutti i corsi di laurea</button>
        </a>
        <a href="<?= $this->Url->build(['action' => 'edit', $degree['id']]) ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary">Modifica</button>
        </a>
        <a href="<?= $this->Url->build(['action' => 'delete', $degree['id']]) ?>"
           onclick="return confirm('Sei sicuro di voler cancellare questo corso?')" class="mr-2">
            <button type="button" class="btn btn-sm btn-danger">Elimina</button>
        </a>
    </div>

    <table class="table">
        <tr>
            <th>Nome</th>
            <td><?php echo h($degree['name']); ?></td>
        </tr>
        <tr>
            <th>Anni</th>
            <td><?php echo $degree['years']; ?></td>
        </tr>
        <tr>
            <th>Richiesta parere</th>
            <td><?= $degree['enable_sharing'] ? 'Abilitata' : 'Non abilitata' ?></td>
        </tr>
    </table>

<?= $this->element('card-end'); ?>

<?= $this->element('card-start', [
    'header' => 'Messaggi'
]); ?>

    <p>Questi messaggi vengono mostrati allo studente che visualizza il piano.
    Possono essere personalizzati per indicare le procedure da seguire nei vari casi. 
    </p>
      

    <table class="table">
        <tr>
            <th>Accettazione</th>
            <td><?= $degree['approval_message'] ?></td>
        </tr>
        <tr>
            <th>Sottomissione</th>
            <td><?= $degree['submission_message'] ?></td>
        </tr>
        <tr>
            <th>Rifiuto</th>
            <td><?= $degree['rejection_message'] ?></td>
        </tr>
    </table>
<?= $this->element('card-end'); ?>

<?= $this->element('card-start', [ 'header' => 'E-mail' ]) ?>
  <p>L'accettazione, sottomissione, e rifiuto di un piano di studi possono essere comuncati 
    via e-mail allo studente e agli indirizzi specificati nelle 
    <?= $this->Html->link('impostazioni', [ 'controller' => 'settings', 'action' => 'index' ]) ?>.
    Questo avviene 
    solo per gli eventi selezionati qui. 
    </p>
      
    <table class="table">
        <tr>
            <th>Accettazione</th>
            <td><?= $degree['approval_confirmation'] ? 'E-mail abilitata' : 'E-mail disabilitata' ?></td>
        </tr>
        <tr>
            <th>Sottomissione</th>
            <td><?= $degree['submission_confirmation'] ? 'E-mail abilitata' : 'E-mail disabilitata' ?></td>
        </tr>
        <tr>
            <th>Rifiuto</th>
            <td><?= $degree['rejection_confirmation'] ? 'E-mail abilitata' : 'E-mail disabilitata' ?></td>
        </tr>
    </table>
<?= $this->element('card-end'); ?>


