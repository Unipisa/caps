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
    $this->extend('/email/html/proposal_base');
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
    Anno di immatricolazione: <?= $proposal['curriculum']['degree']->academic_years() ?><br>
    <?= $proposal['curriculum']['degree']['name'] ?><br>
    <?= $settings['department'] ?>
</p>
<p>Puoi aggiungere un commento al piano di studi accedendo alla seguente
   pagina utilizzando le credenziali di Ateneo: <br>
    <?= $this->Html->link($url, $url); ?>
</p>
