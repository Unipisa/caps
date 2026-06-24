<h1>Domanda di partecipazione alla sessione di laurea</h1>

<?= $this->element('card-start') ?>
<p class="text-muted">La domanda sarà inviata immediatamente agli amministratori. Dopo l'invio non sarà modificabile.</p>
<?= $this->Form->create($defense, ['type' => 'file']) ?>
<?= $this->Form->control('degree_session_id', [
    'label' => 'Sessione di laurea', 'options' => $sessions, 'empty' => 'Selezionare una sessione', 'class' => 'form-control',
]) ?>
<?= $this->Form->control('title', ['label' => 'Titolo della tesi', 'type' => 'textarea', 'rows' => 3, 'class' => 'form-control']) ?>

<fieldset class="mt-4">
    <legend class="h5">Relatori</legend>
    <div id="advisors">
        <?php $advisorRows = $this->request->getData('thesis_defense_advisors') ?: [['name' => '', 'email' => '']]; ?>
        <?php foreach ($advisorRows as $i => $advisor): ?>
        <div class="form-row advisor-row mb-2">
            <div class="col-md-5"><input class="form-control" required name="thesis_defense_advisors[<?= $i ?>][name]" value="<?= h($advisor['name'] ?? '') ?>" placeholder="Nome e cognome"></div>
            <div class="col-md-5"><input class="form-control" required type="email" name="thesis_defense_advisors[<?= $i ?>][email]" value="<?= h($advisor['email'] ?? '') ?>" placeholder="Email"></div>
            <div class="col-md-2"><button type="button" class="btn btn-outline-danger remove-advisor">Rimuovi</button></div>
        </div>
        <?php endforeach; ?>
    </div>
    <button type="button" id="add-advisor" class="btn btn-sm btn-outline-primary"><i class="fas fa-plus mr-2"></i>Aggiungi relatore</button>
</fieldset>

<fieldset class="mt-4">
    <legend class="h5">Allegati</legend>
    <input type="file" name="attachments[]" multiple class="form-control-file">
    <small class="form-text text-muted">È possibile selezionare più file.</small>
</fieldset>

<div class="mt-4">
    <?= $this->Form->button('Invia domanda', ['class' => 'btn btn-primary', 'confirm' => 'Inviare definitivamente la domanda?']) ?>
    <?= $this->Html->link('Annulla', ['controller' => 'Users', 'action' => 'view'], ['class' => 'btn btn-secondary ml-2']) ?>
</div>
<?= $this->Form->end() ?>
<?= $this->element('card-end') ?>

<script>
(function () {
    const container = document.getElementById('advisors');
    function renumber() {
        container.querySelectorAll('.advisor-row').forEach((row, i) => {
            row.querySelectorAll('input').forEach(input => {
                input.name = input.name.replace(/\[\d+\]/, '[' + i + ']');
            });
        });
    }
    document.getElementById('add-advisor').addEventListener('click', function () {
        const row = container.querySelector('.advisor-row').cloneNode(true);
        row.querySelectorAll('input').forEach(input => input.value = '');
        container.appendChild(row);
        renumber();
    });
    container.addEventListener('click', function (event) {
        if (!event.target.classList.contains('remove-advisor')) return;
        if (container.querySelectorAll('.advisor-row').length > 1) {
            event.target.closest('.advisor-row').remove();
            renumber();
        }
    });
})();
</script>
