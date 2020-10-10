<h1>
    <?= $group->isNew() ? 'Aggiungi gruppo' : 'Modifica gruppo' ?>
</h1>

<?= $this->element('card-start') ?>
    <?php
    // debug($group);
    echo $this->Form->create($group);
    echo $this->Form->input(
        'name',
        ['label' => 'Nome']
    );
    echo $this->Form->control('exams._ids', [ 'size' => 15 ]);
    if ($group->isNew()):
        echo $this->Form->submit('Salva gruppo');
    else:
        echo $this->Form->submit('Modifica gruppo');
    endif;
    echo $this->Form->end();
    ?>
<?= $this->element('card-end') ?>
