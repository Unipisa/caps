<?php echo $this->Html->script('upload_csv.js'); ?>
<?php echo $this->element('update_navigation'); ?>
<script>
// per upload_csv
csv_upload_fields = ['nome','codice','settore','crediti'];
csv_upload_fields_db = ['name','code','sector','credits'];
csrf_token = "<?php echo ($this->request->getParam('_csrfToken')); ?>";
</script>

<h2>Esami</h2>
<table class="caps-exams">
    <tr>
        <th>Id</th>
        <th>Nome</th>
        <th>Codice</th>
        <th>Settore</th>
        <th>Crediti</th>
        <th>Azioni</th>
    </tr>
<?php foreach ($paginated_exams as $exam): ?>
    <tr>
        <td class="caps-admin-exams-id"><?php echo $exam['id']; ?></td>
        <td class="caps-admin-exams-name">
            <?php
                echo $this->Html->link(
                    $exam['name'],
                    ['action' => 'view',
                        $exam['id']]
                );
            ?>
        </td>
        <td class="caps-admin-exams-code"><?php echo $exam['code']; ?></td>
        <td class="caps-admin-exams-sector"><?php echo $exam['sector']; ?></td>
        <td class="caps-admin-exams-credits"><?php echo $exam['credits']; ?></td>
        <td class="caps-admin-exams-actions">
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Html->link(
                            __('Modifica'),
                            [
                                'action' => 'edit',
                                $exam['id']],
                            ['class' => 'accept']
                        ) ." ".
                        $this->Form->postLink(
                            __('Cancella'),
                            ['action' => 'delete', $exam['id']],
                            [
                              'class' => 'reject',
                              'confirm' => __('Sei sicuro di voler cancellare l\'esame "{0}"?', $exam['name'])
                            ]
                        );
                    ?>
                </li>
            </ul>
        </td>
    </tr>
<?php endforeach; ?>
</table>

<?php echo $this->element('pagination'); ?>

<div class="caps-admin-add">
    <ul>
        <li>
            <?php
                echo $this->Html->link(
                    'Aggiungi esame',
                    ['controller' => 'exams',
                        'action' => 'edit']
                );
            ?>
        </li>
        <li>
            <a onclick='$("#caps-admin-add-csv").toggle()'>Aggiungi esami da file CSV</a>
        </li>
    </ul>
</div>


<div style="display:none" id="caps-admin-add-csv" class="caps-admin-add-csv">
    Carica elenco esami da un file CSV:
    <input id="csv_file_input" name="csv_file" type="file" value="scegli file CSV">
    <input type="submit" id="csv_file_reload" value="ricarica">
    <div style="display:none" id="csv_options_div">
        separatore colonne:
        <select name="csv_separator">
            <option value=",">, virgola</option>
            <option value=";">; punto e virgola</option>
            <option value="\t">tabulazione</option>
            <option value=":">: due punti</option>
        </select>
        intestazioni: <select name="csv_headers">
            <option value="0">nessuna intestazione</option>
            <option value="1" selected="selected">nella prima riga</option>
        </select>
        campo nome: <select name="csv_field[0]"></select>
        campo codice: <select name="csv_field[1]"></select>
        campo settore: <select name="csv_field[2]"></select>
        campo crediti: <select name="csv_field[3]"></select>
        <div class="caps-admin-add">
            <ul>
                <li>
                    <a onclick='csvSubmit()'>Aggiungi tutti gli esami elencati di seguito</a>
                </li>
            </ul>
        </div>
        <table id="csv_preview_table">
        </table>
    </div>
</div>
