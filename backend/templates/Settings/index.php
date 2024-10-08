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
<h1>Impostazioni</h1>

<?php echo $this->Form->create(); ?>

<?= $this->element('card-start', [ 'header' => 'Generali' ]) ?>

        <div class="form-group">
            <label for="caps-setting-disclaimer" class="caps-setting-header">Disclaimer</label>
            <div class="caps-setting-description">Questa scritta, se non vuota, viene mostrata in cima ad ogni pagina</div>
            <textarea id="caps-setting-disclaimer"
              name="disclaimer" class="form-control caps-settings-html">
                <?= $settings['disclaimer'] ?>
            </textarea>
        </div>

        <div class="form-group">
            <label for="caps-setting-cds" class="caps-setting-header">Corso di studi</label>
            <input id="caps-setting-cds" type="text" class="form-control" name="cds" value="<?= h($settings['cds']); ?>">
        </div>

        <div class="form-group">
            <label for="caps-setting-department" class="caps-setting-header">Dipartimento</label>
            <input id="caps-setting-department" type="text" class="form-control" name="department" value="<?= h($settings['department']); ?>">
        </div>

        <div class="form-group">
            <label for="caps-setting-user-instructions" class="caps-setting-header">Istruzioni per l'utente</label>
            <div class="caps-setting-description">Queste istruzioni vengono mostrate all'utente appena dopo il login, nella pagina
                dove sono visibili tutti i piani di studio presentati.</div>
            <textarea id="caps-setting-user-instructions"
              name="user-instructions" class="form-control caps-settings-html">
                <?= $settings['user-instructions'] ?>
            </textarea>
        </div>

        <div class="form-group">
            <label for="caps-setting-support-email" class="caps-setting-header">Email di supporto</label>
            <div class="caps-setting-description">Questo indirizzo viene mostrato all'utente nella barra laterale per 
                contattare il supporto. Se non impostato, il bottone non è mostrato.</div>
            <input id="caps-setting-support-email" name="support-email" class="form-control" value="<?= h($settings['support-email']); ?>"></input>
        </div>

    <?= $this->element('card-end') ?>

    <?= $this->element('card-start', [ 'header' => 'Piani di studio' ]) ?>

        <div class="form-group">
            <label for="caps-setting-notified-emails" class="caps-setting-header">Notifiche e-mail</label>
            <div class="cps-setting-description">
                Questo campo contiene una lista di indirizzi e-mail, separati da virgole, che vengono
                notificati ad ogni nuova sottomissione e approvazione di un piano di studio.
            </div>
            <input id="caps-setting-notified-emails" type="text" class="form-control" name="notified-emails" value="<?= h($settings['notified-emails']); ?>">
        </div>

        <div class="form-group">
            <label for="caps-setting-signature-text" class="caps-setting-header">Firma per i piani</label>
            <div class="caps-setting-description">Questa firma viene apposta su ogni piano approvato, quando si
            seleziona il pulsante "Stampa piano".</div>
            <input id="caps-setting-signature-text" type="text" class="form-control" name="approval-signature-text" value="<?= h($settings['approval-signature-text']); ?>">
        </div>

        <div class="form-group">
            <label for="caps-setting-pdf-name" class="caps-setting-header">Nome dei file .pdf</label>
            <div class="caps-setting-description">È possibile configurare il nome per i file .pdf che vengono
                scaricati cliccando su "Scarica in PDF" nella pagina di un piano di studio. Le stringhe '%d', '%s',
                '%n' e '%c' vengono sostituite con la data di ultima modifica, il cognome, il nome, e il curriculum,
                rispettivamente. Non è necessario includere l'estensione .pdf.
              </div>
            <input id="caps-setting-pdf-name" type="text" class="form-control" name="pdf-name" value="<?= h($settings['pdf-name']); ?>">
        </div>

    <?= $this->element('card-end') ?>

    <div class="mt-4"></div>
    <?php
        echo $this->Form->submit('Salva impostazioni');
    ?>
    <?php echo $this->Form->end(); ?>
