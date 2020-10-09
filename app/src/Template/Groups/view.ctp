<h1><?php echo $group['name']; ?></h1>

<div class="row">
    <div class="col">
        <div class="card">
            <div class="card-body">
                <div class="d-flex mb-2">
                    <a href="<?= $this->Url->build(['action' => 'index']) ?>" class="mr-2">
                        <button type="button" class="btn btn-sm btn-primary">Indietro</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'edit', $group['id']]) ?>" class="mr-2">
                        <button type="button" class="btn btn-sm btn-primary">Modifica</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'delete', $group['id']]) ?>"
                       onclick="return confirm('Sei sicuro di voler cancellare questo gruppo?')" class="mr-2">
                        <button type="button" class="btn btn-sm btn-danger">Elimina</button>
                    </a>
                </div>

                <table class="table">
                    <tr><thead>
                        <th>Nome</th>
                        <th>Codice</th>
                        <th>Settore</th>
                        <th>Crediti</th>
                        </thead>
                    </tr>
                    <?php foreach ($group['exams'] as $exam): ?>
                        <tr>
                            <td>
                                <?php echo $this->Html->link($exam['name'],
                                    ['controller' => 'exams', 'action' => 'edit', $exam['id']]); ?>
                            </td>
                            <td><?php echo $exam['code']; ?></td>
                            <td><?php echo $exam['sector']; ?></td>
                            <td><?php echo $exam['credits']; ?></td>
                        </tr>
                    <?php endforeach ?>
                    <?php unset($exam); ?>
                </table>

            </div>
        </div>
    </div>
</div>
