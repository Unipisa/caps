<h2>Piani di studio — <?php echo $user_entry['name']; ?>, matricola <?php echo $user_entry['number']; ?></h2>

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

<?php foreach ($degrees as $degree_id => $degree): ?>
    <h3><?php echo $degree['name']; ?></h3>

    <?php foreach ([ 'drafts', 'others' ] as $state): ?>

        <?php
            if (count($proposals_view[$degree_id][$state]) == 0)
                continue;
        ?>

    <h4>
        <?php echo ($state == 'drafts') ? "Bozze" : "Piani sottomessi, accettati o rigettati"; ?>
    </h4>

        <table class='caps-todo'>
          <tr>
            <th>Corso di Laurea</th>
            <th>Curriculum</th>
            <th>Anno di immatricolazione</th>
            <th>Ultima modifica</th>
            <th>Stato</th>
            <th>Azioni</th>
          </tr>
        <?php

          foreach ($proposals_view[$degree_id][$state] as $proposal) {
            // We keep track of the number of proposals, since $proposals is not an array
            // but an opaque query object, and does not report the number of results beforehand.
            $num_proposals++;

            // Compute the status
              switch ($proposal['state']) {
                  case 'draft':
                      $status = '<span style=\'color: darkblue;\'>✏</span> Bozza';
                      break;
                  case 'submitted':
                      $status = '<span style=\'color: darkorange;\'>✉</span> Sottomesso';
                      break;
                  case 'approved':
                      $status = "<span style='color: green;'>✓</span> Approvato";
                      break;
                  case 'rejected':
                      $status = '<span style=\'color: red;\'>✗</span> Rigettato';
                      break;
              }
            ?>
              <tr>
               <td><?php echo $proposal['curriculum']['degree']['name']; ?></td>
               <td><?php echo $proposal['curriculum']['name']; ?></td>
               <td><?php echo $proposal['curriculum']['academic_year']; ?>/<?php echo ($proposal['curriculum']['academic_year']+1); ?></td>
               <td><?php echo $proposal['modified']->i18nformat('dd/MM/yyyy, HH:mm'); ?></td>
               <td><?php echo $status; ?></td>
               <td>
                   <?php
                   switch ($proposal['state']) {
                       case "draft":
                           echo $this->Html->link('Modifica', [
                               'controller' => 'proposals',
                               'action' => 'add',
                               $proposal['id'] ]);
                           echo " — ";
                           echo $this->Html->link('Anteprima', [
                           'controller' => 'proposals',
                           'action' => 'view',
                           $proposal['id'] ]);
                           break;
                       case "submitted":
                       case "approved":
                       case "rejected":
                           echo $this->Html->link('Visualizza', [
                               'controller' => 'proposals',
                               'action' => 'view',
                               $proposal['id'] ]);
                 }

                 echo " — ";

                 if ($proposal['state'] != 'draft') {
                     echo $this->Html->link('Crea una copia', [
                        'controller' => 'proposals',
                         'action' => 'duplicate',
                         $proposal['id']
                     ]);
                 }
                 else {
                     echo $this->Html->link('Elimina', [
                         'controller' => 'proposals',
                         'action' => 'delete',
                         $proposal['id']
                     ], [
                         'confirm' => __('Sei sicuro di voler cancellare il piano?')
                     ]);
                 }

                 ?>
               </td>
              </tr>
            <?php
          }
        ?>
        </table>
    <?php endforeach; ?>

<?php endforeach; ?>

<?php if ($num_proposals == 0) {  ?>
    <p>Al momento non è stato presentato alcun piano di studio.</p>
<?php
}
?>

<?php if ($owner['id'] == $user_entry['id']): ?>
  <!-- Pulsante di creazione di un nuovo piano, visibile solo per il proprietario,
       e non se qualcuno sta visualizzando il profile come amministratore. //-->
  <div class="caps-admin-actions">
    <ul>
      <li>
        <?php echo $this->Html->link('Nuovo piano di studi', [
            'controller' => 'proposals',
            'action' => 'add'
        ]);
        ?>
      </li>
    </ul>
  </div>
<?php endif; ?>
