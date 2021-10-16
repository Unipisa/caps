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

// We form the list of degrees, to split the proposals according the degree they belong to. 
$degrees = [];
foreach ($proposals as $p) {
    $degree_id = $p['curriculum']['degree']['id'];

    if (! array_key_exists($degree_id, $degrees)) {
        $degrees[$degree_id] = $p['curriculum']['degree'];
    }
}

$num_proposals = 0;
?>

<!-- Page Heading -->
<div class="d-sm-flex align-items-center justify-content-between">
    <h1><?php echo $user_entry['name']; ?> <span class="text-muted h5 ml-2">matricola: <?php echo $user_entry['number']; ?></span></h1>
    <?php if ($user['id'] == $user_entry['id']): ?>
    <div>
    <a href="<?= $this->Url->build([ 'controller' => 'proposals', 'action' => 'edit' ]) ?>">
        <button class="btn btn-sm btn-primary shadow-sm">
            <i class="fw fas fa-plus-square"></i>
            Compila un nuovo piano di studi
        </button>
    </a>
        <?php if ($form_templates_enabled):?>
        <a href="<?= $this->Url->build([ 'controller' => 'forms', 'action' => 'edit' ]) ?>">
            <button class="btn btn-sm btn-primary shadow-sm">
                <i class="fw fas fa-plus-square"></i>
                Compila un nuovo modulo
            </button>
        </a>
        <?php endif; ?>
    </div>
    <?php endif; ?>
</div>


<?php if ($settings['user-instructions']): ?>
<?= $this->element('card-start', [ 'border' => 'primary' ]); ?>
    <?= $settings['user-instructions'] ?>
<?= $this->element('card-end'); ?>
<?php endif; ?>


<?php foreach ($degrees as $degree_id => $degree): ?>

<?= $this->element('card-start', [ 'header' => $degree['name'] . "<br /><small>Regolamento dell'anno accademico " .
                   $degree->academic_years()  . "</small>" ]); ?>

        <div class="table-responsive-xl">
            <table class='table table'>
                <tr><thead>
                    <th>Curriculum</th>
                    <th>Anno</th>
                    <th>Ultima modifica</th>
                    <th>Data di sottomissione</th>
                    <th>Data di approvazione</th>
                    <th>Stato</th>
                    <th></th>
                    </thead>
                </tr>
                <?php
                    foreach ($proposals as $proposal) {
                        if ($proposal['curriculum']['degree']['id'] != $degree['id'])
                          continue;

                        // We keep track of the number of proposals, since $proposals is not an array
                        // but an opaque query object, and does not report the number of results beforehand.
                        $num_proposals++;
                ?>

                    <tr>
                        <td><?= h($proposal['curriculum']['name']); ?></td>
                        <td><?= $proposal['curriculum']['degree']->academic_years(); ?></td>
                        <td><?= $this->Caps->formatDate($proposal['modified']); ?></td>
                        <td><?= $this->Caps->formatDate($proposal['submitted_date'], 'non sottomesso'); ?></td>
                        <td><?= $this->Caps->formatDate($proposal['approved_date'], 'non approvato'); ?></td>
                        <td>
                            <?= $this->Caps->badge($proposal); ?>
                        </td>
                        <td>
                            <div class="dropdown">
                                <a class="btn-sm btn-secondary dropdown-toggle" href="#" role="button"
                                    id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="fas fa-cog"></i>
                                </a>
                                <div class="dropdown-menu">
                                <?php
                                 
                                echo $this->Html->link('Visualizza', [
                                    'controller' => 'proposals', 'action' => 'view',$proposal['id']
                                ], [
                                    'class' => 'dropdown-item'
                                ]);

                                if ($proposal['state'] == 'draft') {
                                    // We don't allow administrators to edit the proposals as the user: the edit button
                                    // is only displayed if logged-in user is the owner of the
                                    // proposal.
                                    if ($user['id'] == $proposal['user']['id']) {
                                        echo $this->Html->link('Modifica', [
                                            'controller' => 'proposals', 'action' => 'edit', $proposal['id']
                                        ], [
                                            'class' => 'dropdown-item'
                                        ]);
                                    }
                                }

                                if ($proposal['state'] == 'submitted' && $proposal['curriculum']['degree']->isSharingEnabled($user)) {
                                    echo $this->Html->link('Richiedi parere', [
                                        'controller' => 'proposals', 'action' => 'share', $proposal['id']
                                    ], [
                                        'class' => 'dropdown-item'
                                    ]);
                                }

                                if ($proposal['state'] != 'draft') {
                                    echo $this->Html->link('Crea una copia', [
                                        'controller' => 'proposals', 'action' => 'duplicate', $proposal['id']
                                    ], [
                                        'class' => 'dropdown-item'
                                    ]);
                                }

                                if ($proposal['state'] != 'approved' && $proposal['state'] != 'rejected' && $proposal['state'] != 'submitted') {
                                    echo $this->Html->link('Elimina', [
                                        'controller' => 'proposals', 'action' => 'delete', $proposal['id']
                                    ], [
                                        'class' => 'dropdown-item',
                                        'confirm' => __('Sei sicuro di voler cancellare il piano?')
                                    ]);
                                }
                                ?>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <?php
                }
                ?>
            </table>
        </div>
<?= $this->element('card-end'); ?>

<?php endforeach; ?>

<?php if ($num_proposals == 0):  ?>
<?= $this->element('card-start'); ?>
    <p>Al momento non è stato presentato alcun piano di studio.</p>
<?= $this->element('card-end'); ?>
<?php endif; ?>

<?php if ($form_templates_enabled): ?>
<?= $this->element('card-start', [ 'header' => "Modelli compilati" ]); ?>
<?php if ($forms->count()): ?>
    <div class="table-responsive-xl">
            <table class='table table'>
                <tr><thead>
                    <th>Modello</th>
                    <th>Stato</th>
                    <th></th>
                    </thead>
                </tr>
            <?php foreach ($forms as $form) { ?>
                <tr>
                    <td><?= h($form['form_template']['name']) ?></td> 
                    <td><?= $form['state'] ?></td>
                    <td>
                        <div class="dropdown">
                            <a class="btn-sm btn-secondary dropdown-toggle" href="#" role="button"
                                id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-cog"></i>
                            </a>
                            <div class="dropdown-menu">
                            <?php
                                
                            echo $this->Html->link('Visualizza', [
                                'controller' => 'forms', 'action' => 'view',$form['id']
                            ], [
                                'class' => 'dropdown-item'
                            ]);

                            if ($form['state'] == 'draft') {
                                // We don't allow administrators to edit forms as the user: the edit button
                                // is only displayed if logged-in user is the owner of the
                                // proposal.
                                if ($user['id'] == $form['user']['id']) {
                                    echo $this->Html->link('Modifica', [
                                        'controller' => 'forms', 'action' => 'edit', $form['id']
                                    ], [
                                        'class' => 'dropdown-item'
                                    ]);
                                }
                            }
                            ?>
                            </div>
                        </div>
                    </td>
                </tr>
            <?php } ?>
            </table>
    </div>
<?php else: ?>
    <p>Al momento non è stato compilato nessun modulo.</p>
<?php endif ?>
<?= $this->element('card-end'); ?>
<?php endif; ?>

<?php
 // This part is only visible to administrators
 if ($user['admin']):
?>

<?= $this->element('card-start', [ 'header' => 'Documenti dello studente' ]); ?>
    <p>I documenti e le annotazioni inserite in questa sezione sono associate allo studente, 
    ma sono visibili solo per gli amministratori. </p>
    <?php
      if (count($user_entry['documents']) == 0) {
          echo "<p>Non è stato caricato alcun allegato.</p>";
      }
    ?>

    <ul class="attachments">
    <?php foreach ($user_entry['documents'] as $doc) {
        echo $this->element('attachment', [
            'attachment' => $doc,
            'name' => 'documento',
            'controller' => 'documents'
        ]);
    }
    ?>
    </ul>

    <?php
        echo $this->Form->create(null, [
            'url' => ['controller' => 'documents', 'action' => 'add'],
            'type' => 'file'
        ]);
    ?>

    <button type="button" class="dropdown-toggle btn btn-primary btn-sm" data-toggle="collapse" data-target="#add-document">
        Inserisci un nuovo documento
    </button>
    <div class="collapse my-3 mx-0" id="add-document">
        <div class="card border-left-primary p-3">
            <p>&Egrave; possibile allegare documenti e/o commenti a questo profilo.</p>

            <div class="form-group">
            <?php echo $this->Form->textarea('comment'); ?>
            </div>
            <div class="form-group">
            <?php echo $this->Form->file('data'); ?>
            </div>
            <?php
                echo $this->Form->hidden('user_id', ['value' => $user_entry['id']]);
                echo $this->Form->submit('Aggiungi documento e/o commento');
                echo $this->Form->end();
            ?>
        </div>
    </div>
<?= $this->element('card-end'); ?>

<?php endif; ?>
