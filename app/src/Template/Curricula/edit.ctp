<?php echo $this->element('updating_navigation'); ?>

<?php
  $myTemplates = [
    'inputContainer' => '{{content}}',
    'submitContainer' => '<span class="submit">{{content}}</span>',
    'hiddenBlock' => '<span style="display:none;">{{content}}</span>'
  ];
?>

<?php if ($curriculum->isNew()): ?>
<h2>Aggiungi curriculum</h2>
<?php else: ?>
<h2>Modifica curriculum</h2>
<?php endif; ?>
<?php
    echo $this->Form->create($curriculum);
    echo $this->Form->control(
        'degree_id'
    );
    echo $this->Form->control(
        'name'
    );
    echo $this->Form->control(
        'academic_year'
    );
    echo $this->Form->control(
        'notes'
    );
    echo $this->Form->submit($curriculum->isNew() ? 'Crea' : 'Aggiorna');
    echo $this->Form->end();
?>

<?php if (! $curriculum->isNew()): ?>
<hr class="caps-admin-curriculum"/>

<h3>Esami obbligatori</h3>
<table class="caps-admin-compulsory-exams">
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
            <ul class="actions">
                <li>
                    <?php
                        echo $this->Form->postLink(
                            __('Cancella'),
                            ['controller' => 'compulsory_exams',
                                'action' => 'delete',
                                $compulsory_exam['id']],
                            [
                              'class' => 'reject',
                              'confirm' => __('Sei sicuro di voler cancellare l\'esame "{0}"?', $name)
                            ]
                        )
                    ?>
                </li>

            </ul>
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
            ]
        ]
    );
    $this->Form->setTemplates($myTemplates);
    echo $this->Form->control(
        'position',
        // FIXME(jacquerie): Not properly setted.
        ['default' => 0,
         'type' => 'hidden']
    );
    echo $this->Form->control(
        'exam_id',
        ['class' => 'caps-admin-curriculum-exam-name-choose',
            'label' => false,
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
            'label' => false,
            'options' => $years
        ]
    );
    echo $this->Form->submit('Aggiungi esame',
        ['class' => 'caps-admin-curriculum-exam-submit']
    );
    echo $this->Form->end();
?>

<hr class="caps-admin-curriculum"/>

<h3>Esami obbligatori a scelta in un gruppo</h3>
<table class="caps-admin-restricted-exams">
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
                <ul class="actions">
                    <li>
                        <?php
                            echo $this->Form->postLink(
                                __('Cancella'),
                                ['controller' => 'compulsory_groups',
                                    'action' => 'delete',
                                    $compulsory_group['id']],
                                [
                                  'class' => 'reject',
                                  'confirm' => __('Sei sicuro di voler cancellare l\'esame a scelta nel gruppo "{0}"?', $name)
                                ]
                            )
                        ?>
                    </li>
                </ul>
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
    $this->Form->setTemplates($myTemplates);
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
            'label' => false,
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
            'label' => false,
            'options' => $years
        ]
    );
    echo $this->Form->submit('Aggiungi gruppo',
        ['class' => 'caps-admin-curriculum-group-submit']
    );
    echo $this->Form->end();
?>

<hr class="caps-admin-curriculum"/>

<h3>Esami a scelta libera</h3>
<table class="caps-admin-free-exams">
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
                <ul class="actions">
                    <li>
                        <?php
                            echo $this->Form->postLink(
                                __('Cancella'),
                                ['controller' => 'free_choice_exams',
                                    'action' => 'delete',
                                    $free_choice_exam['id']],
                                [
                                  'class' => 'reject',
                                  'confirm' => __('Sei sicuro di voler cancellare questo esame a scelta libera?')
                                ]
                            )
                        ?>
                    </li>
                </ul>
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
    $this->Form->setTemplates($myTemplates);
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
            'label' => false,
            'default' => null,
            'options' => ["" => "un esame qualunque"] + $groupsList->toArray()
        ]
    );
    echo $this->Form->control(
        'year',
        [
            'class' => 'caps-admin-curriculum-exam-year-choose',
            'label' => false,
            'options' => (substr($curriculum['name'], 0, strlen('Laurea Triennale')) === 'Laurea Triennale' ? [1 => 1, 2 => 2, 3 => 3] : [1 => 1, 2 => 2])
        ]
    );
    echo $this->Form->submit('Aggiungi esame',
        ['class' => 'caps-admin-curriculum-exam-submit']
    );
    echo $this->Form->end();
?>

<?php endif; ?>
