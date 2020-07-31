<?php
    $this->extend('/Email/html/proposal_base');
    $url = $this->Url->build([
        "controller" => "proposals",
        "action" => "view",
        $proposal['id'],
        "?" => ["secret" => $proposal_auth['secret']],
        "_full" => true ]);
?>

<h3>Richiesta di parere sul piano di studi</h3>
<p>
    Ti chiediamo di prendere visione del piano di studi
    sottomesso per approvazione dallo studente <?= $proposal['user']['name'] ?>
    (matricola: <?= $proposal['user']['number'] ?>). <br>
    Curriculum: <?= $proposal['curriculum']['name'] ?><br>
    Anno di immatricolazione: <?= $proposal['curriculum']['academic_year'] ?>/<?= $proposal['curriculum']['academic_year']+1 ?><br>
    <?= $proposal['curriculum']['degree']['name'] ?><br>
    <?= $settings['department'] ?>
</p>
<p>Puoi aggiungere un commento al piano di studi accedendo alla seguente
   pagina utilizzando le credenziali di Ateneo: <br>
    <?= $this->Html->link($url, $url); ?>
</p>
