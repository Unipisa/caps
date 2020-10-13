<?php echo $this->Html->script('upload_csv.js?rev=2'); ?>

<h1>Esami</h1>

<script>
// per upload_csv
csv_upload_fields = ['nome','codice','settore','crediti'];
csv_upload_fields_db = ['name','code','sector','credits'];
csrf_token = "<?php echo ($this->request->getParam('_csrfToken')); ?>";
db_exams = null; // codice -> exam

function csv_click() {
    // $("#caps-admin-actions-csv").toggle();
    if (db_exams === null) {
        db_exams = {};
        $.get("exams.json", function(data) {
            data.exams.forEach(function(exam) {
                db_exams[exam.code] = exam;
            })
        });
    }
}

function csv_validator(item, context) {
    if (!context.used_codes) context.used_codes = {};
    if (item.name === "") return "nome vuoto";
    if (item.code === "") return "codice vuoto";
    if (db_exams.hasOwnProperty(item.code)) return "codice già presente in database";
    if (context.used_codes.hasOwnProperty(item.code)) return "codice già utilizzato";
    context.used_codes[item.code] = true;
    return null;
}
</script>

<?= $this->element('card-start'); ?>
    <div class="d-flex mb-2">
        <div class="dropdown mr-2">
            <button class="btn btn-secondary btn-sm dropdown-toggle" data-toggle="dropdown">
                Filtra
            </button>
            <div class="dropdown-menu p-2" style="width: 350px;">
                <?php
                echo $this->Form->create($filterForm, ['type' => 'GET', 'class' => 'filterForm']);
                echo $this->Form->control('name',
                    [
                        'label' => __('nome'),
                        'onchange' => 'this.form.submit()'
                    ]);
                echo $this->Form->control('code',
                    [
                        'label' => __('codice'),
                        'onchange' => 'this.form.submit()'
                    ]);
                echo $this->Form->control('sector',
                    [
                        'label' => __('settore'),
                        'onchange' => 'this.form.submit()'
                    ]);
                echo $this->Form->control('credits',
                    [
                        'label' => __('crediti'),
                        'onchange' => 'this.form.submit()'
                    ]);
                echo $this->Form->end();
                ?>
            </div>
        </div>

        <a href="<?= $this->Url->build([ 'action' => 'edit' ]) ?>">
            <button type="button" class="btn btn-sm btn-primary mr-2">
                <i class="fas fa-plus mr-2"></i>Aggiungi
            </button>
        </a>

        <button type="button" class="btn btn-sm btn-danger mr-2"
            onclick="Caps.submitForm('exams-form', { 'delete': 1 }, 'Confermi di voler rimuovere gli esami selezionati?')">
            <i class="fas fa-times mr-2"></i>Elimina
        </button>

        <div class="flex-fill"></div>

        <div class="btn btn-sm btn-primary mr-2" type="button" onclick="Caps.downloadCSV()">
            <i class="fas fa-download mr-2"></i>Esporta in CSV
        </div>

        <div class="dropdown">
            <button type="button" class="btn btn-sm btn-primary mr-2 dropdown-toggle" data-toggle="dropdown" onclick='csv_click()'>
                Importa da CSV
            </button>
            <div class="dropdown-menu p-2 shadow" style="width: 800px; max-height: 500px; overflow-y: scroll;">
                <div id="caps-admin-actions-csv" class="caps-admin-actions-csv">
                    <form>
                        <h3 class="h5">Caricamento esami da CSV</h3>
                    <p>Carica elenco di esami da un file CSV; si potranno selezionare gli esami da caricare, e quelli da ignorare
                        prima della conferma definitiva. La struttura del file CSV deve includere 4 colonne con
                        <strong>nome</strong>, <strong>codice</strong>, <strong>settore</strong>, e <strong>crediti</strong> (non
                        necessariamente in questo ordine). L'intestazione è opzionale.</p>
                        <div class="form-group">
                        <input class="form-control-file" id="csv_file_input" name="csv_file" type="file" value="scegli file CSV">
                        </div>
                        <div class="form-group">
                        <input class="btn btn-sm btn-primary" type="submit" id="csv_file_reload" value="ricarica">
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
                            <button type="button" class="btn btn-sm btn-primary" onclick='csvSubmit()'>
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

    <?php echo $this->element('filter_badges'); ?>

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
                <td class="caps-admin-curricula-id"><input type=checkbox name="selection[]" value="<?php echo $exam['id']; ?>"></td>
                <td class="caps-admin-exams-name">
                    <?php
                    echo $this->Html->link(
                        $exam['name'],
                        ['action' => 'view',
                            $exam['id']]
                    );
                    ?>
                </td>
                <td class="caps-admin-exams-credits"><?php echo $exam->tagsToString(); ?></td>
                <td class="caps-admin-exams-code"><?php echo $exam['code']; ?></td>
                <td class="caps-admin-exams-sector"><?php echo $exam['sector']; ?></td>
                <td class="caps-admin-exams-credits"><?php echo $exam['credits']; ?></td>
            </tr>
        <?php endforeach; ?>
    </table>
    </div>
    <?php echo $this->element('pagination'); ?>
<?= $this->element('card-end'); ?>

