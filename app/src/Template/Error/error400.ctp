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
use Cake\Core\Configure;
use Cake\Error\Debugger;

$this->layout = 'error';

if (Configure::read('debug')) :
    $this->layout = 'dev_error';

    $this->assign('title', $message);
    $this->assign('templateName', 'error400.ctp');

    $this->start('file');
?>
<?php if (!empty($error->queryString)) : ?>
    <p class="notice">
        <strong>SQL Query: </strong>
        <?= h($error->queryString) ?>
    </p>
<?php endif; ?>
<?php if (!empty($error->params)) : ?>
        <strong>SQL Query Params: </strong>
        <?php Debugger::dump($error->params) ?>
<?php endif; ?>
<?= $this->element('auto_table_warning') ?>
<?php
if (extension_loaded('xdebug')) :
    xdebug_print_function_stack();
endif;

$this->end();
endif;
?>
<h2><?= h($message) ?></h2>
<p class="error">
    <strong><?= __d('cake', 'Pagina non trovata') ?>: </strong>
    <?= __d('cake', 'La risorsa richiesta non è presente su questo server.', "<strong>'{$url}'</strong>") ?>
</p>

<h3>Informazioni aggiuntive</h3>
    <ul style="font-size: 1.2em; line-height: 1.8em;">
    <li>La pagina cercata potrebbe essere collegata ad un esame, piano di studio, curriculum che è stato 
    <strong>recentemente eliminato</strong>, oppure si potrebbe aver sbagliato a digitare l'indirizzo nel browser. 
    <li>Nel caso questo errore sia invece inaspettato, si consiglia di riportare una segnalazione
      tramite la piattaforma Github, all'indirizzo <a href="https://github.com/Unipisa/caps/issues">
        https://github.com/Unipisa/caps/issues</a>. 
    </li>

  <br>
  <hr>
  <br>

  Cliccare <?php echo 
     $this->Html->link('qui', [ 'controller' => 'users', 'action' => 'login' ]) 
  ?> per tornare 
  alla pagina principale.