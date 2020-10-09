<h1><?= $degree['name'] ?></h1>

<div class="row">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <table class="table">
                    <tr>
                        <th>Nome</th>
                        <td><?php echo $degree['name']; ?></td>
                    </tr>
                    <tr>
                        <th>Anni</th>
                        <td><?php echo $degree['years']; ?></td>
                    </tr>
                    <tr>
                        <th>Richiesta parere</th>
                        <td><?= $degree['enable_sharing'] ? 'Abilitata' : 'Non abilitata' ?></td>
                    </tr>
                </table>

                <a href="<?= $this->Url->build(['action' => 'index']) ?>">
                    <button type="button" class="btn btn-primary">Indietro</button>
                </a>
                <a href="<?= $this->Url->build(['action' => 'edit', $degree['id']]) ?>">
                    <button type="button" class="btn btn-primary">Modifica</button>
                </a>
                <a href="<?= $this->Url->build(['action' => 'delete', $degree['id']]) ?>"
                        onclick="return confirm('Sei sicuro di voler cancellare questo corso?')">
                    <button type="button" class="btn btn-danger">Elimina</button>
                </a>
            </div>
        </div>
    </div>
</div>
