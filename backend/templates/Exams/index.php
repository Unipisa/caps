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

<h1>Esami</h1>

<?= $this->element('card-start'); ?>
    <div class="d-flex mb-2">
        <?= $this->element('filter-button', [ 'items' => [
            'name' => __('nome'),
            'code' => __('codice'),
            'sector' => __('settore'),
            'credits' => __('crediti')]]) ?>
        <a href="<?= $this->Url->build([ 'action' => 'edit' ]) ?>">
            <button type="button" class="btn btn-sm btn-primary mr-2">
                <i class="fas fa-plus"></i><span class="d-none d-md-inline ml-2">Aggiungi esame</span>
            </button>
        </a>

        <button type="button" class="btn btn-sm btn-danger mr-2"
            onclick="Caps.submitForm('exams-form', { 'delete': 1 }, 'Confermi di voler rimuovere gli esami selezionati?')">
            <i class="fas fa-times"></i><span class="ml-2 d-none d-md-inline">Elimina</span>
        </button>

        <div class="flex-fill"></div>

        <button type="button" class="btn btn-sm btn-primary mr-2" onclick="Caps.downloadCSV();">
            <i class="fas fw fa-download"></i><span class="ml-2 d-none d-md-inline"><span class="d-none d-xl-inline">Esporta in </span>CSV</span>
        </button>
        <button type="button" class="btn btn-sm btn-primary mr-2" onclick="Caps.downloadXLSX();">
            <i class="fas fw fa-file-excel"></i><span class="ml-2 d-none d-md-inline"><span class="d-none d-xl-inline">Esporta in </span>Excel</span>
        </button>

        <div class="dropdown">
            <button type="button" class="btn btn-sm btn-primary mr-2 dropdown-toggle" data-toggle="dropdown">
                <i class="fas fa-upload"></i><span class="ml-2 d-none d-lg-inline">Importa da CSV</span>
            </button>
            <div class="dropdown-menu p-2 shadow" style="width: 800px; max-height: 500px; overflow-y: scroll;">
                <div>
                    <form>
                        <h3 class="h5">Caricamento esami da CSV</h3>
                    <p>Carica elenco di esami da un file CSV; si potranno selezionare gli esami da caricare, e quelli da ignorare
                        prima della conferma definitiva. La struttura del file CSV deve includere 4 colonne con
                        <strong>nome</strong>, <strong>codice</strong>, <strong>settore</strong>, e <strong>crediti</strong> (non
                        necessariamente in questo ordine). L'intestazione è opzionale.</p>
                        <div class="form-group">
                        <input class="form-control-file" id="csv_file_input" name="csv_file" type="file" value="scegli file CSV" onclick="this.value=null;">
                        </div>
                    <div style="display:none" id="csv_options_div">
                        <div class="form-group">
                            <label for="separatore">separatore colonne:</label>

                            <select id="separatore" class="form-control" name="csv_separator">
                                <option value=",">, virgola</option>
                                <option value=";">; punto e virgola</option>
                                <option value="&#9;">tabulazione</option>
                                <option value=":">: due punti</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label >intestazioni:</label>
                            <select class="form-control" name="csv_headers">
                            <option value="0">nessuna intestazione</option>
                            <option value="1" selected="selected">nella prima riga</option>
                        </select>
                        </div>
                        <div class="form-group">
                            <label>campo nome:</label>
                            <select class="form-control" name="csv_field[0]"></select>
                        </div>
                        <div class="form-group">
                            <label>campo codice:</label>
                            <select class="form-control" name="csv_field[1]"></select>
                        </div>
                        <div class="form-group">
                            <label>campo settore:</label>
                            <select class="form-control" name="csv_field[2]"></select>
                        </div>
                        <div class="form-group">
                            <label>campo crediti:</label>
                            <select class="form-control" name="csv_field[3]"></select>
                        </div>
                        <div class="mb-2">
                            <button type="button" class="btn btn-sm btn-primary" id="csvSubmitButton">
                                Aggiungi tutti gli esami selezionati di seguito
                            </button>
                        </div>
                        <table id="csv_preview_table" class="table">
                        </table>
                    </div>
                    </form>
                </div>
            </div>
        </div>

    </div>

    <?php echo $this->element('filter_badges', [ 'fields' => [ 'name', 'code', 'credits' ] ]); ?>

    <?php echo $this->Form->create(null, [ 'id' => 'exams-form' ]); ?>
    <div class="table-responsive-md">
    <table class="table">
        <tr>
            <th></th>
            <th><?= $this->Paginator->sort('name', 'Nome'); ?></th>
            <th>Tags</th>
            <th><?= $this->Paginator->sort('code', 'Codice'); ?></th>
            <th><?= $this->Paginator->sort('sector', 'Settore'); ?></th>
            <th>    <?= $this->Paginator->sort('credits', 'Crediti'); ?></th>
        </tr>
        <?php foreach ($paginated_exams as $exam): ?>
            <tr>
                <td><input type=checkbox name="selection[]" value="<?php echo $exam['id']; ?>"></td>
                <td>
                    <?php
                    echo $this->Html->link(
                        $exam['name'],
                        ['action' => 'view',
                            $exam['id']]
                    );
                    ?>
                </td>
                <td><?php echo $exam->tagsToString(); ?></td>
                <td><?php echo h($exam['code']); ?></td>
                <td><?php echo h($exam['sector']); ?></td>
                <td><?php echo $exam['credits']; ?></td>
            </tr>
        <?php endforeach; ?>
    </table>
    </div>
    <?php echo $this->element('pagination'); ?>
<?= $this->element('card-end'); ?>
