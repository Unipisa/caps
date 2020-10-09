<h1><?= $curriculum->isNew() ? 'Aggiungi curriculum' : 'Modifica curriculum' ?></h1>

<?php
  $myTemplates = [
    'inputContainer' => '{{content}}',
    'submitContainer' => '<span class="submit">{{content}}</span>',
    'hiddenBlock' => '<span style="display:none;">{{content}}</span>'
  ];
?>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <?php
                echo $this->Form->create($curriculum);
                echo $this->Form->control('degree_id', [ 'label' => 'Corso di Laurea' ]);
                echo $this->Form->control('name', [ 'label' => 'Nome' ]);
                echo $this->Form->control('academic_year', [ 'label' => 'Anno Accademico' ]);
                echo $this->Form->control(
                    'notes'
                );
                echo $this->Form->submit($curriculum->isNew() ? 'Crea' : 'Aggiorna');
                echo $this->Form->end();
                ?>
            </div>
        </div>
    </div>
</div>

<?php if (! $curriculum->isNew()): ?>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-header bg-primary">
                <h3 class="h5 text-white mb-0">Esami obbligatori</h3>
            </div>
            <div class="card-body">
                <table class="table">
                    <tr>
                        <th>Nome Esame</th>
                        <th>Anno</th>
                        <th>Azioni</th>
                    </tr>
                    <?php foreach ($curriculum['compulsory_exams'] as $compulsory_exam) { ?>
                        <tr>
                            <td class="caps-admin-curriculum-exam-name">
                                <?php
                                // XXX(jacquerie): Terrible, terrible fix.
                                foreach($exams as $exam) {
                                    if ($exam['id'] == $compulsory_exam['exam_id']) {
                                        $name = $exam['name'];
                                    }
                                }
                                echo $name;
                                ?>
                            </td>
                            <td class="caps-admin-curriculum-exam-year"><?php echo $compulsory_exam['year']; ?></td>
                            <td class="caps-admin-curriculum-exam-actions">
                                <?php
                                echo $this->Form->postLink(
                                    __('Cancella'),
                                    ['controller' => 'compulsory_exams',
                                        'action' => 'delete',
                                        $compulsory_exam['id']],
                                    [
                                        'class' => 'btn btn-sm btn-danger',
                                        'confirm' => __('Sei sicuro di voler cancellare l\'esame "{0}"?', $name)
                                    ]
                                )
                                ?>
                            </td>
                        </tr>
                    <?php } ?>
                </table>
                <?php
                $years = [];
                for($y = 1; $y <= $curriculum['degree']['years']; $y++) $years[$y] = $y;

                echo $this->Form->create(
                    'CompulsoryExams', [
                        'url' => [
                            'controller' => 'CompulsoryExams',
                            'action' => 'admin-add'
                        ],
                    ]
                );
                echo $this->Form->control(
                    'position',
                    // FIXME(jacquerie): Not properly setted.
                    ['default' => 0,
                        'type' => 'hidden']
                );
                echo $this->Form->control(
                    'exam_id',
                    ['class' => 'caps-admin-curriculum-exam-name-choose',
                        'label' => 'Esame',
                        'options' => $examsList]
                );
                echo $this->Form->control(
                    'curriculum_id',
                    ['default' => $curriculum['id'],
                        'type' => 'hidden']
                );
                echo $this->Form->control(
                    'year',
                    [
                        'class' => 'caps-admin-curriculum-exam-year-choose',
                        'label' => 'Anno',
                        'options' => $years
                    ]
                );
                echo $this->Form->submit('Aggiungi esame',
                    ['class' => 'caps-admin-curriculum-exam-submit']
                );
                echo $this->Form->end();
                ?>
            </div>
        </div>
    </div>
</div>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-header bg-primary">
                <h3 class="h5 text-white mb-0">Esami obbligatori a scelta in un gruppo</h3>
            </div>
            <div class="card-body">
                <table class="table">
                    <tr>
                        <th>Nome Gruppo</th>
                        <th>Anno</th>
                        <th>Azioni</th>
                    </tr>
                    <?php foreach ($curriculum['compulsory_groups'] as $compulsory_group) { ?>
                        <tr>
                            <td class="caps-admin-curriculum-exam-name">
                                <?php
                                    // XXX(jacquerie): Terrible, terrible fix.
                                    foreach($groups as $group) {
                                        if ($group['id'] == $compulsory_group['group_id']) {
                                            $name = $group['name'];
                                        }
                                    }

                                    echo $name;
                                ?>
                            </td>
                            <td class="caps-admin-curriculum-exam-year"><?php echo $compulsory_group['year']; ?></td>
                            <td class="caps-admin-curriculum-exam-actions">
                                <?php
                                    echo $this->Form->postLink(
                                        __('Cancella'),
                                        ['controller' => 'compulsory_groups',
                                            'action' => 'delete',
                                            $compulsory_group['id']],
                                        [
                                          'class' => 'btn btn-sm btn-danger',
                                          'confirm' => __('Sei sicuro di voler cancellare l\'esame a scelta nel gruppo "{0}"?', $name)
                                        ]
                                    )
                                ?>
                            </td>
                        </tr>
                    <?php } ?>
                </table>
                <?php
                    echo $this->Form->create(
                        'CompulsoryGroup', [
                            'url' => [
                                'controller' => 'CompulsoryGroups',
                                'action' => 'admin-add'
                            ]
                        ]
                    );
                    echo $this->Form->control(
                        'position',
                        [
                            // FIXME(jacquerie): Not properly setted.
                            'default' => 0,
                            'type' => 'hidden'
                        ]
                    );
                    echo $this->Form->control(
                        'group_id',
                        ['class' => 'caps-admin-curriculum-group-name-choose',
                            'label' => 'Gruppo',
                            'options' => $groupsList]
                    );
                    echo $this->Form->control(
                        'curriculum_id',
                        ['default' => $curriculum['id'],
                            'type' => 'hidden']
                    );
                    echo $this->Form->control(
                        'year',
                        [
                            'class' => 'caps-admin-curriculum-group-year-choose',
                            'label' => 'Anno',
                            'options' => $years
                        ]
                    );
                    echo $this->Form->submit('Aggiungi esame in un gruppo',
                        ['class' => 'caps-admin-curriculum-group-submit']
                    );
                    echo $this->Form->end();
                ?>
            </div>
        </div>
    </div>
</div>

<div class="row my-2">
    <div class="col">
        <div class="card shadow">
            <div class="card-header bg-primary">
                <h3 class="h5 text-white mb-0">Esami a scelta libera</h3>
            </div>
            <div class="card-body">
                <table class="table">
                    <tr>
                        <th>Gruppo</th>
                        <th>Anno</th>
                        <th>Azioni</th>
                    </tr>
                    <?php foreach ($curriculum['free_choice_exams'] as $free_choice_exam) { ?>
                        <tr>
                            <td class="caps-admin-curriculum-exam-group"><?php echo $free_choice_exam['group']?$free_choice_exam['group']['name']:"esame qualunque"; ?></td>
                            <td class="caps-admin-curriculum-exam-year"><?php echo $free_choice_exam['year']; ?></td>
                            <td class="caps-admin-curriculum-exam-actions">
                                        <?php
                                            echo $this->Form->postLink(
                                                __('Cancella'),
                                                ['controller' => 'free_choice_exams',
                                                    'action' => 'delete',
                                                    $free_choice_exam['id']],
                                                [
                                                  'class' => 'btn btn-sm btn-danger',
                                                  'confirm' => __('Sei sicuro di voler cancellare questo esame a scelta libera?')
                                                ]
                                            )
                                        ?>
                            </td>
                        </tr>
                    <?php } ?>
                </table>
                <?php
                    echo $this->Form->create(
                        'FreeChoiceExam',[
                            'url' => [
                                'controller' => 'FreeChoiceExams',
                                'action' => 'admin-add'
                            ]
                        ]
                    );
                    echo $this->Form->control(
                        'position',
                        [
                            // FIXME(jacquerie): Not properly setted.
                            'default' => 0,
                            'type' => 'hidden',
                        ]
                    );
                    echo $this->Form->control(
                        'curriculum_id',
                        ['default' => $curriculum['id'],
                            'type' => 'hidden',]
                    );
                    echo $this->Form->control(
                        'group_id',
                        ['class' => 'caps-admin-curriculum-group-name-choose',
                            'label' => 'Gruppo',
                            'default' => null,
                            'options' => ["" => "un esame qualunque"] + $groupsList->toArray()
                        ]
                    );

                    $year_list = [];
                    for ($i=1; $i <= $curriculum['degree']['years']; $i++) {
                        $year_list[$i] = $i;
                    }
                    echo $this->Form->control(
                        'year',
                        [
                            'class' => 'caps-admin-curriculum-exam-year-choose',
                            'label' => 'Anno',
                            'options' => $year_list
                        ]
                    );
                    echo $this->Form->submit('Aggiungi esame',
                        ['class' => 'caps-admin-curriculum-exam-submit']
                    );
                    echo $this->Form->end();
                ?>
            </div>
        </div>
    </div>
</div>

<?php endif; ?>
