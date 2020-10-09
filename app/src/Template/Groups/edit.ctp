<h1>
    <?= $group->isNew() ? 'Aggiungi gruppo' : 'Modifica gruppo' ?>
</h1>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
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
            </div>
        </div>
    </div>
</div>

