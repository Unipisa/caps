<h1>Domande di partecipazione alle sessioni di laurea</h1>

<?= $this->element('card-start') ?>
<div class="mb-3">
    <?php foreach (['' => 'Tutte', 'submitted' => 'Da valutare', 'approved' => 'Approvate', 'rejected' => 'Respinte'] as $value => $label): ?>
        <?= $this->Html->link($label, ['action' => 'index', '?' => $value ? ['state' => $value] : []], [
            'class' => 'btn btn-sm ' . (($state ?? '') === $value ? 'btn-primary' : 'btn-outline-primary') . ' mr-2',
        ]) ?>
    <?php endforeach; ?>
</div>
<div class="table-responsive-sm">
<table class="table">
    <thead><tr><th>Studente</th><th>Sessione</th><th>Titolo</th><th>Stato</th><th>Programmazione</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($defenses as $defense): ?>
        <tr>
            <td><?= h($defense->user->name) ?><br><small><?= h($defense->user->number) ?></small></td>
            <td><?= h($defense->degree_session->degree->name) ?><br><small><?= h($defense->degree_session->name) ?> — <?= $defense->degree_session->start_date->format('d/m/Y') ?></small></td>
            <td><?= h($defense->title) ?></td>
            <td><?= ['submitted' => 'Da valutare', 'approved' => 'Approvata', 'rejected' => 'Respinta'][$defense->state] ?? h($defense->state) ?></td>
            <td>
                <?= $defense->scheduled_at ? $defense->scheduled_at->format('d/m/Y H:i') : '—' ?>
                <?= $defense->venue ? '<br>' . h($defense->venue) : '' ?>
            </td>
            <td><?= $this->Html->link('Gestisci', ['action' => 'manage', $defense->id], ['class' => 'btn btn-sm btn-primary']) ?></td>
        </tr>
    <?php endforeach; ?>
    <?php if ($defenses->isEmpty()): ?><tr><td colspan="6">Nessuna domanda trovata.</td></tr><?php endif; ?>
    </tbody>
</table>
</div>
<?= $this->element('card-end') ?>
