<h1>
    <?= $degree->isNew() ? "Aggiungi corso di Laurea" : "Modifica corso di Laurea" ?>
</h1>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <?php
                    echo $this->Form->create($degree);
                    echo $this->Form->control('name', ['label' => 'Nome']);
                    echo $this->Form->control('years', ['label' => 'Anni']);
                ?>
                <div class="form-check mb-2">
                    <input id="enable-sharing" class="form-check-input" type="checkbox" name="sharing" value="<?= $degree['enable_sharing'] ?>" />
                    <label class="form-check-label" for="enable-sharing">Richiesta parere abilitata</label>
                </div>
                <?php
                    if ($degree->isNew()):
                        echo $this->Form->submit('Salva corso di laurea');
                    else:
                        echo $this->Form->submit('Aggiorna');
                    endif;
                    echo $this->Form->end();
                ?>
            </div>
        </div>
    </div>
</div>

