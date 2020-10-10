<h1><?= $degree['name'] ?></h1>

<?= $this->element('card-start'); ?>
    <div class="d-flex mb-2">
        <a href="<?= $this->Url->build(['action' => 'index']) ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary">Indietro</button>
        </a>
        <a href="<?= $this->Url->build(['action' => 'edit', $degree['id']]) ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary">Modifica</button>
        </a>
        <a href="<?= $this->Url->build(['action' => 'delete', $degree['id']]) ?>"
           onclick="return confirm('Sei sicuro di voler cancellare questo corso?')" class="mr-2">
            <button type="button" class="btn btn-sm btn-danger">Elimina</button>
        </a>
    </div>

    <table class="table">
        <thead>
        <tr>
            <th>Nome</th>
            <td><?php echo $degree['name']; ?></td>
        </tr>
        </thead>
        <tr>
            <th>Anni</th>
            <td><?php echo $degree['years']; ?></td>
        </tr>
        <tr>
            <th>Richiesta parere</th>
            <td><?= $degree['enable_sharing'] ? 'Abilitata' : 'Non abilitata' ?></td>
        </tr>
    </table>
<?= $this->element('card-end'); ?>

