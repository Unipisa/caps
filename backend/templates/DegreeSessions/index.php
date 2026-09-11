<h1>Sessioni di laurea</h1>

<?= $this->element('card-start') ?>
<div class="mb-3">
    <?= $this->Html->link(
        '<i class="fas fa-plus mr-2"></i>Nuova sessione',
        ['action' => 'edit'],
        ['class' => 'btn btn-sm btn-primary', 'escape' => false]
    ) ?>
</div>
<div class="table-responsive-sm">
    <table class="table">
        <thead><tr><th>Corso di laurea</th><th>Sessione</th><th>Data iniziale</th><th></th></tr></thead>
        <tbody>
        <?php foreach ($sessions as $session): ?>
            <tr>
                <td><?= h($session->degree->name) ?></td>
                <td><?= h($session->name) ?></td>
                <td><?= $session->start_date->format('d/m/Y') ?></td>
                <td class="text-right">
                    <?= $this->Html->link('Modifica', ['action' => 'edit', $session->id], ['class' => 'btn btn-sm btn-primary mr-2']) ?>
                    <?= $this->Form->postLink('Elimina', ['action' => 'delete', $session->id], [
                        'class' => 'btn btn-sm btn-danger',
                        'confirm' => 'Eliminare questa sessione?',
                    ]) ?>
                </td>
            </tr>
        <?php endforeach; ?>
        <?php if ($sessions->isEmpty()): ?>
            <tr><td colspan="4">Nessuna sessione configurata.</td></tr>
        <?php endif; ?>
        </tbody>
    </table>
</div>
<?= $this->element('card-end') ?>
