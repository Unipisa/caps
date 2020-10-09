<h1>
    <?= $exam->isNew() ? 'Aggiungi esame' : 'Modifica esame' ?>
</h1>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">

                <?php
                echo $this->Form->create($exam);
                echo $this->Form->control(
                    'id',
                    ['type' => 'hidden']);
                echo $this->Form->control(
                    'code',
                    ['label' => 'Codice']);
                echo $this->Form->control(
                    'name',
                    ['label' => 'Nome']);
                echo $this->Form->control(
                    'sector',
                    ['label' => 'Settore']);
                echo $this->Form->control(
                    'credits',
                    ['label' => 'Crediti',
                        'type' => 'number']);
                echo $this->Form->control('tags._ids', [
                    'label' => 'Tags'
                ]);
                echo $this->Form->control('new-tags', [
                    'label' => 'Nuovi tag (separati da virgola)',
                    'class' => 'tags-entry'
                ]);
                echo $this->Form->control(
                    'groups._ids',
                    ['label' => 'Gruppi',
                        'size' => 20]);
                if ($exam->isNew()):
                    echo $this->Form->submit('Salva esame');
                else:
                    echo $this->Form->submit('Aggiorna esame');
                endif;
                echo $this->Form->end();
                ?>
            </div>
        </div>
    </div>
</div>

