<?php
// We first organize proposals into a tree structure coherent with the display strategy, i.e.,
// we want them subdivided by degree, and then further subdivided in drafts and non-drafts
$proposals_view = [];
$degrees = [];
foreach ($proposals as $p) {
    $degree_id = $p['curriculum']['degree']['id'];

    if (! array_key_exists($degree_id, $degrees)) {
        $degrees[$degree_id] = $p['curriculum']['degree'];
        $proposals_view[$degree_id] = [
            'drafts' => [], 'others' => []
        ];
    }

    if ($p['state'] == 'draft') {
        $proposals_view[$degree_id]['drafts'][] = $p;
    }
    else {
        $proposals_view[$degree_id]['others'][] = $p;
    }
}

$num_proposals = 0;
?>

<!-- Page Heading -->
<div class="d-sm-flex align-items-center justify-content-between">
    <h1 class="text-gray-800"><?php echo $user_entry['name']; ?>, matricola <?php echo $user_entry['number']; ?></h1>
    <?php if ($user['username'] == $user_entry['username']): ?>
    <a href="<?= $this->Url->build([ 'controller' => 'proposals', 'action' => 'add' ]) ?>">
        <button class="btn btn-sm btn-primary shadow-sm">
            <i class="fw fas fa-plus"></i>
            Nuovo piano
        </button>
    </a>
    <?php endif; ?>
</div>


<?php if ($instructions != ""): ?>
<?= $this->element('card-start', [ 'border' => 'primary' ]); ?>
    <strong>Istruzioni:</strong>
    <?= $instructions ?>
<?= $this->element('card-end'); ?>
<?php endif; ?>


<?php foreach ($degrees as $degree_id => $degree): ?>

<?= $this->element('card-start', [ 'header' => $degree['name'] ]); ?>
    <?php foreach ([ 'drafts', 'others' ] as $state): ?>
        <?php
        if (count($proposals_view[$degree_id][$state]) == 0)
            continue;
        ?>

        <h6 class="text-info">
            <?php echo ($state == 'drafts') ? "Bozze" : "Piani sottomessi, accettati o rigettati"; ?>
        </h6>

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

                foreach ($proposals_view[$degree_id][$state] as $proposal) {
                    // We keep track of the number of proposals, since $proposals is not an array
                    // but an opaque query object, and does not report the number of results beforehand.
                    $num_proposals++;

                    // Compute the status
                    $statusclass = 'secondary';
                    switch ($proposal['state']) {
                        case 'draft':
                            $status = 'Bozza';
                            $statusclass = 'secondary';
                            break;
                        case 'submitted':
                            $status = 'Sottomesso';
                            $statusclass = 'warning';
                            break;
                        case 'approved':
                            $status = "Approvato";
                            $statusclass = 'success';
                            break;
                        case 'rejected':
                            $status = 'Rigettato';
                            $statusclass = 'danger';
                            break;
                        default:
                            $status = $proposal['state'];
                            break;
                    }
                    ?>
                    <tr>
                        <td><?php echo $proposal['curriculum']['name']; ?></td>
                        <td><?php echo $proposal['curriculum']['academic_year']; ?>/<?php echo ($proposal['curriculum']['academic_year']+1); ?></td>
                        <td><?php echo $proposal['modified']->setTimezone($Caps['timezone'])->i18nformat('dd/MM/yyyy, HH:mm'); ?></td>
                        <td><?php echo ($proposal['submitted_date'] != null) ?
                                $proposal['submitted_date']->setTimezone($Caps['timezone'])->i18nformat('dd/MM/yyyy, HH:mm') : 'non sottomesso';
                            ?></td>
                        <td><?php
                            echo ($proposal['approved_date'] != null) ?
                                $proposal['approved_date']->setTimezone($Caps['timezone'])->i18nformat('dd/MM/yyyy, HH:mm') : 'non approvato';
                            ?></td>
                        <td><span class="badge badge-sm badge-<?= $statusclass ?>"><?php echo $status; ?></span></td>
                        <td>

                            <div class="dropdown">
                                <a class="btn-sm btn-secondary dropdown-toggle" href="#" role="button"
                                    id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="fas fa-cog"></i>
                                </a>
                                <div class="dropdown-menu">
                                <?php
                                switch ($proposal['state']) {
                                    case "draft":
                                        // We don't allow administrators to edit the proposals as the user: the edit button
                                        // is only displayed if the username of the logged-in user matches the owner of the
                                        // proposal.
                                        if ($user['username'] == $proposal['user']['username']) {
                                            echo $this->Html->link('Modifica', [
                                                'controller' => 'proposals', 'action' => 'add', $proposal['id']
                                            ], [
                                                'class' => 'dropdown-item'
                                            ]);
                                        }
                                        echo $this->Html->link('Visualizza', [
                                                'controller' => 'proposals', 'action' => 'view', $proposal['id']
                                            ], [
                                                'class' => 'dropdown-item'
                                            ]);
                                        break;
                                    case "submitted":
                                    case "approved":
                                    case "rejected":
                                    default:
                                        echo $this->Html->link('Visualizza', [
                                            'controller' => 'proposals', 'action' => 'view',$proposal['id']
                                        ], [
                                            'class' => 'dropdown-item'
                                        ]);
                                }

                                if ($proposal['state'] == 'submitted' && $proposal['curriculum']['degree']['enable_sharing']) {
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
    <?php endforeach; ?>
<?= $this->element('card-end'); ?>

<?php endforeach; ?>

<?php if ($num_proposals == 0):  ?>
<?= $this->element('card-start'); ?>
    <p>Al momento non è stato presentato alcun piano di studio.</p>
<?= $this->element('card-end'); ?>
<?php endif; ?>

<?php
 // This part is only visible to administrators
 if ($user['admin']):
?>

<?= $this->element('card-start', [ 'header' => 'Documenti dello studente' ]); ?>
    <p>I documenti e le annotazioni inserite in questa sezione sono associate a questo utente, e non sono
      visibili per lo studente. </p>
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
        <h6 class="text-info">Nuovo documento</h6>
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
<?= $this->element('card-end'); ?>

<?php endif; ?>
