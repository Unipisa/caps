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
<h1>
    <?= $degree->isNew() ? "Aggiungi corso di Laurea" : "Modifica corso di Laurea" ?>
</h1>

<?= $this->Form->create($degree); ?>


<?= $this->element('card-start'); ?>
    <?php
        echo $this->Form->control('name', ['label' => 'Nome', 'type' => 'text' ]);
        echo $this->Form->control('academic_year', ['label' => 'Anno accademico (solo anno di inizio)', 'type' => 'integer' ]);
        echo $this->Form->control('years', ['label' => 'Anni']);
    ?>

    <div class="form-group">
        <label for="caps-degree-enable-sharing" class="caps-setting-header">Funzionalità opzionali</label>
        <div class="form-check mb-2" id="caps-degree-enable-sharing">
            <?php echo $this->Form->control('enable_sharing', ['label' => 'Richiesta di parere abilitata']); ?>
        </div>
    </div>

    <div class="form-group">
        <div class="caps-setting-header">Messaggio di approvazione</div>
        <div>
            Questo messaggio viene mostrato allo studente quando visualizza un piano che è già stato
            approvato.
        </div>
        <textarea id="caps-setting-approved-message"
                    name="approval_message" class="form-control caps-settings-html">
            <?= $degree['approval_message'] ?>
        </textarea>        </div>

    <div class="form-group">
        <label for="caps-setting-submitted-message" class="caps-setting-header">Messaggio alla sottomissione</label>
        <div class="caps-setting-description">
            Questo messaggio viene mostrato allo studente quando sottomette un piano; può contenere
            ad esempio delle
            istruzioni da seguire dopo la sottomissione.
        </div>
        <textarea id="caps-setting-submitted-message"
                    name="submission_message" class="form-control caps-settings-html">
            <?= $degree['submission_message'] ?>
        </textarea>
    </div>

    <div class="form-group">
        <label for="caps-setting-rejected-message" class="caps-setting-header">Messaggio per piani rigettati</label>
        <div class="caps-setting-description">
            Questo messaggio viene mostrato allo studente quando visualizza un piano che è stato rigettato.
        </div>
        <textarea id="caps-setting-rejected-message"
                    name="rejection_message" class="form-control caps-settings-html">
            <?= $degree['rejection_message'] ?>
        </textarea>
    </div>

    <div class="form-group">
        <label for="caps-setting-free-choice-message" class="caps-setting-header">Messaggio per esami a scelta</label>
        <div class="caps-setting-description">
            Questo messaggio viene mostrato allo studente quando seleziona un esame a scelta libera (modificando
            la struttura del piano). Può contenere indicazioni su come riportare esami di altre istituzioni, e/o 
            che dettagli sia necessario inserire. 
        </div>
        <textarea id="caps-setting-free-choice-message"
                    name="free_choice_message" class="form-control caps-settings-html">
            <?= $degree['free_choice_message'] ?>
        </textarea>
    </div>

    <div class="form-group mt-4">
        <div class="caps-setting-header">Notifiche e-mail</div>
        <div class="form-check mb-2" id="caps-degree-submission-confirmation">
            <?php echo $this->Form->control('submission_confirmation', 
                ['label' => 'Conferma e-mail alla sottomissione']); ?>
        </div>
        <div class="form-check mb-2" id="caps-degree-approval-confirmation">
            <?php echo $this->Form->control('approval_confirmation', 
                ['label' => 'Conferma e-mail all\'approvazione']); ?>
        </div>
        <div class="form-check mb-2" id="caps-degree-rejection-confirmation">
            <?php echo $this->Form->control('rejection_confirmation', 
                ['label' => 'Conferma e-mail al rifuto']); ?>
        </div>
    </div>

    <?php
        if ($degree->isNew()):
            echo $this->Form->submit('Salva corso di laurea');
        else:
            echo $this->Form->submit('Aggiorna');
        endif;
    ?>
<?= $this->element('card-end') ?>

<?= $this->Form->end(); ?>


