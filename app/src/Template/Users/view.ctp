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
    <?php echo $this->Html->link(
        "Nuovo piano", [
            'controller' => 'proposals',
            'action' => 'add'
        ], [
            'class' => 'd-none d-sm-inline-block btn btn-sm btn-primary shadow-sm'
        ]);
    ?>
    <?php endif; ?>
</div>


<?php if ($instructions != ""): ?>
<div class="row py-2">
    <div class="col-12">
        <div class="card shadow border-left-primary">
            <div class="card-body">
                <strong>Istruzioni:</strong>
                <?= $instructions ?>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>


<?php foreach ($degrees as $degree_id => $degree): ?>

<div class="row py-2">
    <div class="col-12">
        <div class="card shadow">
            <div class="card-header py-3">
                <h6 class="font-weight-bold text-primary"><?php echo $degree['name']; ?></h6>
            </div>

            <div class="card-body">
                    <?php foreach ([ 'drafts', 'others' ] as $state): ?>
                        <?php
                        if (count($proposals_view[$degree_id][$state]) == 0)
                            continue;
                        ?>

                        <h6 class="text-info">
                            <?php echo ($state == 'drafts') ? "Bozze" : "Piani sottomessi, accettati o rigettati"; ?>
                        </h6>

                        <table class='table'>
                            <tr><thead>
                                <th>Corso di Laurea</th>
                                <th>Curriculum</th>
                                <th>Anno</th>
                                <th>Ultima modifica</th>
                                <th>Data di sottomissione</th>
                                <th>Data di approvazione</th>
                                <th>Stato</th>
                                <th>Azioni</th>
                                </thead>
                            </tr>
                            <?php

                            foreach ($proposals_view[$degree_id][$state] as $proposal) {
                                // We keep track of the number of proposals, since $proposals is not an array
                                // but an opaque query object, and does not report the number of results beforehand.
                                $num_proposals++;

                                // Compute the status
                                switch ($proposal['state']) {
                                    case 'draft':
                                        $status = 'Bozza';
                                        break;
                                    case 'submitted':
                                        $status = 'Sottomesso';
                                        break;
                                    case 'approved':
                                        $status = "Approvato";
                                        break;
                                    case 'rejected':
                                        $status = 'Rigettato';
                                        break;
                                    default:
                                        $status = $proposal['state'];
                                        break;
                                }
                                ?>
                                <tr>
                                    <td><?php echo $proposal['curriculum']['degree']['name']; ?></td>
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
                                    <td><?php echo $status; ?></td>
                                    <td>

                                        <div class="dropdown">
                                            <a class="btn-sm btn-secondary dropdown-toggle" href="#" role="button"
                                                id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                Azioni
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
                    <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<?php endforeach; ?>

<?php if ($num_proposals == 0):  ?>
<div class="row py-2">
    <div class="col-12">
        <div class="card shadow">
            <div class="card-body">
                <p>Al momento non è stato presentato alcun piano di studio.</p>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<?php
 // This part is only visible to administrators
 if ($user['admin']):
?>

 <div class="row py-2">
     <div class="col-12">
         <div class="card shadow">
             <div class="card-header">
                 <h6 class="font-weight-bold text-primary">Documenti dello studente</h6>
             </div>
             <div class="card-body">
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
                    echo $this->Form->create('Documents', [
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
             </div>
         </div>
     </div>
 </div>

<?php
 endif;
 ?>
