<dl class="row">
    <dt class="col-sm-3">Studente</dt><dd class="col-sm-9"><?= h($defense->user->name) ?> (<?= h($defense->user->number) ?>)</dd>
    <dt class="col-sm-3">Telefono</dt><dd class="col-sm-9"><?= $defense->phone ? h($defense->phone) : 'Non indicato' ?></dd>
    <dt class="col-sm-3">Corso e sessione</dt><dd class="col-sm-9"><?= h($defense->degree_session->degree->name) ?> — <?= h($defense->degree_session->name) ?>, <?= $defense->degree_session->start_date->format('d/m/Y') ?></dd>
    <dt class="col-sm-3">Titolo</dt><dd class="col-sm-9"><?= nl2br(h($defense->title)) ?></dd>
    <dt class="col-sm-3">Controrelatori proposti</dt><dd class="col-sm-9"><?= $defense->proposed_second_examiners ? nl2br(h($defense->proposed_second_examiners)) : 'Nessuno' ?></dd>
    <dt class="col-sm-3">Pubblicazione</dt><dd class="col-sm-9"><?= $defense->public ? 'Autorizzata' : 'Non autorizzata' ?></dd>
    <dt class="col-sm-3">Stato</dt><dd class="col-sm-9"><?= ['submitted' => 'Inviata', 'approved' => 'Approvata', 'rejected' => 'Respinta'][$defense->state] ?? h($defense->state) ?></dd>
    <dt class="col-sm-3">Relatori</dt><dd class="col-sm-9"><ul class="mb-0">
        <?php foreach ($defense->thesis_defense_advisors as $advisor): ?><li><?= h($advisor->name) ?> — <a href="mailto:<?= h($advisor->email) ?>"><?= h($advisor->email) ?></a></li><?php endforeach; ?>
    </ul></dd>
    <dt class="col-sm-3">Allegati</dt><dd class="col-sm-9">
        <?php if (!$defense->thesis_defense_attachments): ?>Nessuno<?php endif; ?>
        <?php foreach ($defense->thesis_defense_attachments as $attachment): ?>
            <div><?= $this->Html->link($attachment->filename, ['action' => 'attachment', $attachment->id]) ?></div>
        <?php endforeach; ?>
    </dd>
    <dt class="col-sm-3">Data e ora</dt><dd class="col-sm-9"><?= $defense->scheduled_at ? $this->Caps->formatDate($defense->scheduled_at) . ' (' . h($Caps['timezone']) . ')' : 'Non ancora assegnate' ?></dd>
    <dt class="col-sm-3">Sede</dt><dd class="col-sm-9"><?= $defense->venue ? h($defense->venue) : 'Non ancora assegnata' ?></dd>
</dl>
