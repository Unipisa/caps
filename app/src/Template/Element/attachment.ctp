<li class="card border-left-info mb-2">
    <div class="card-body p-1">
    <?php if ($attachment['comment'] != ""): ?>
        <?= $attachment['comment'] ?><br>
    <?php endif ?>

    <?php if($attachment['filename'] != null): ?>
        <?php
        echo $this->Html->link($attachment['filename'], [
            'controller' => $controller,
            'action' => 'view',
            $attachment['id']
        ]);
        ?><br>
    <?php endif ?>
    <div class="d-sm-flex align-items-center justify-content-between">
    <div>
    <strong><?php echo property_exists($attachment, 'owner') ? $attachment['owner']['name'] : $attachment['user']['name']; ?></strong>
    <?php if ($attachment['created'] != null): ?>
        — <?php echo $attachment['created']->setTimezone($Caps['timezone'])->i18nformat('dd/MM/yyyy, HH:mm'); ?>
    <?php endif; ?>
    </div>
    <?php if ($user['admin'] || $user['id'] == $attachment['user_id']): ?>
        <?php echo $this->Form->postLink('Elimina', [
            'controller' => $controller,
            'action' => 'delete',
            $attachment['id']
        ], [
            'class' => 'btn-sm btn-danger',
            'confirm' => 'Cancellare definitivamente il ' . $name . '?',
        ]);  ?>
    <?php endif ?>
    </div></div>
</li>
