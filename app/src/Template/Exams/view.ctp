<h1><?php echo $exam['name']; ?></h1>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <div class="d-flex mb-2">
                    <a href="<?= $this->Url->build(['action' => 'index']) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary">Indietro</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'edit', $exam['id']]) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary">Modifica</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'delete', $exam['id']]) ?>"
                       onclick="return confirm('Sei sicuro di voler cancellare questo esame?')">
                        <button type="button" class="btn btn-sm mr-2 btn-danger">Elimina</button>
                    </a>
                </div>


                <table class="table">
                    <tr><thead>
                        <th>Nome</th>
                        <td><?php echo $exam['name']; ?></td>
                        </thead>
                    </tr>
                    <tr>
                        <th>Codice</th>
                        <td><?php echo $exam['code']; ?></td>
                    </tr>
                    <tr>
                        <th>Settore</th>
                        <td><?php echo $exam['sector']; ?></td>
                    </tr>
                    <tr>
                        <th>Crediti</th>
                        <td><?php echo $exam['credits']; ?></td>
                    </tr>
                    <tr>
                        <th>Tags</th>
                        <td><?php echo $exam->tagsToString(); ?></td>
                    </tr>
                </table>

            </div>
        </div>
    </div>
</div>

