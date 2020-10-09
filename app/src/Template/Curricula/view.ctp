<h1>Curriculum</h1>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <div class="d-flex mb-2">
                    <a href="<?= $this->Url->build(['action' => 'index']) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary">Indietro</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'edit', $curriculum['id']]) ?>">
                        <button type="button" class="btn btn-sm mr-2 btn-primary">Modifica</button>
                    </a>
                    <a href="<?= $this->Url->build(['action' => 'delete', $curriculum['id']]) ?>"
                       onclick="return confirm('Sei sicuro di voler cancellare questo curriculum?')">
                        <button type="button" class="btn btn-sm mr-2 btn-danger">Elimina</button>
                    </a>
                </div>

                <table class="table">
                    <tr>
                        <th>Laurea</th>
                        <td><?php echo $curriculum['degree']['name']; ?></td>
                    </tr>
                    <tr>
                        <th>Nome</th>
                        <td><?php echo $curriculum['name']; ?></td>
                    </tr>
                    <tr>
                        <th>Anno</th>
                        <td><?php echo $curriculum['academic_year']; ?></td>
                    </tr>
                </table>

                <?php if ($curriculum['notes'] != ""): ?>
                    <h3>Nota</h3>
                    <p>
                        <?php echo $curriculum['notes']; ?>
                    </p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h3 class="h5 mb-0">Esami obbligatori</h3>
            </div>
            <div class="card-body">

                <table class="table">
                    <tr>
                        <th>Nome Esame</th>
                        <th>Anno</th>
                    </tr>
                    <?php foreach ($curriculum['compulsory_exams'] as $compulsory_exam) { ?>
                        <tr>
                            <td class="caps-admin-curriculum-exam-name">
                                <?php echo $compulsory_exam['exam']['name'] ?>
                            </td>
                            <td class="caps-admin-curriculum-exam-year">
                                <?php echo $compulsory_exam['year']; ?>
                            </td>
                        </tr>
                    <?php } ?>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h3 class="h5 mb-0">Esami a scelta in un gruppo</h3>
            </div>
            <div class="card-body">
                <table class="table">
                    <tr>
                        <th>Nome Gruppo</th>
                        <th>Anno</th>
                    </tr>
                    <?php foreach ($curriculum['compulsory_groups'] as $compulsory_group) { ?>
                        <tr>
                            <td class="caps-admin-curriculum-exam-name">
                                <?php echo $compulsory_group['group']['name']?>
                            </td>
                            <td class="caps-admin-curriculum-exam-year">
                                <?php echo $compulsory_group['year']; ?>
                            </td>
                        </tr>
                    <?php } ?>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h3 class="h5 mb-0">Esami a scelta libera</h3>
            </div>
            <div class="card-body">
                <table class="table">
                    <tr>
                        <th>Nome Esame</th>
                        <th>Anno</th>
                    </tr>
                    <?php foreach ($curriculum['free_choice_exams'] as $free_choice_exam) { ?>
                        <tr>
                            <td class="caps-admin-curriculum-exam-name">Esame a scelta libera</td>
                            <td class="caps-admin-curriculum-exam-year"><?php echo $free_choice_exam['year']; ?></td>
                        </tr>
                    <?php } ?>
                </table>
            </div>
        </div>
    </div>
</div>
