<h1><?php echo $exam['name']; ?></h1>

<?= $this->element('card-start') ?>
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

        <div class="flex-fill"></div>

        <div class="btn btn-sm btn-primary mr-2" type="button" onclick="Caps.downloadCSV()">
            <i class="fas fa-download mr-2"></i>Esporta in CSV
        </div>
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

    <?= $this->element('card-end') ?>
    
    <?php if ($chosen_exams): ?>

    <h2>Scelte dell'esame nei piani di studio</h2>

    <?= $this->element('card-start') ?>
    <div class="d-flex mb-2">
        <div class="flex-fill"></div>

        <a class="btn btn-sm btn-primary mr-2" type="button" href="<?= $exam->id ?>.csv?chosen_exams">
            <i class="fas fa-download mr-2"></i>Esporta in CSV
        </a>
    </div>

    <table class="table">
    <tr>
        <thead>
            <th>Studente</th>
            <th>Anno piano</th>
            <th>Anno curriculum</th>
            <th>Curriculum</th>
            <th>Laurea</th>
        </thead>
    </tr>        
        <?php foreach($chosen_exams as $chosen_exam): ?>
        <!--?php debug($chosen_exam); ?-->
        <tr>
            <td><?= $chosen_exam->proposal->user->surname." ".$chosen_exam->proposal->user->givenname ?></td>
            <td><?= $chosen_exam->chosen_year ?></td>
            <td><?= $chosen_exam->proposal->curriculum->academic_year ?></td>
            <td><?= $chosen_exam->proposal->curriculum->name ?></td>
            <td><?= $chosen_exam->proposal->curriculum->degree->name ?></td>
        </tr>
        <?php endforeach ?>
    </table>

    <?= $this->element('card-end') ?>
    <?php endif; ?>
