<?php echo $this->element('updating_navigation'); ?>

<h2>Modifica curriculum</h2>
<?php
    echo $this->Form->create($curriculum);
    echo $this->Form->input(
        'id',
        array(
            'type' => 'hidden'
        )
    );
    echo $this->Form->input(
        'name',
        array(
            'class' => 'caps-admin-curriculum-name',
            'div' => false,
            'label' => false
        )
    );
    echo $this->Form->end(
        array(
            'label' => 'Aggiorna nome',
            'class' => 'caps-admin-curriculum-submit',
            'div' => false
        )
    );
?>

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
                            array(
                                'controller' => 'compulsory_exams',
                                'action' => 'admin_delete',
                                $compulsory_exam['id']
                            ),
                            array(
                                'class' => 'reject'
                            ),
                            __('Sei sicuro di voler cancellare l\'esame "%s"?', $name)
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
        'CompulsoryExams',
        array(
            'controller' => 'compulsory_exams',
            'action' => 'add'
        )
    );
    echo $this->Form->input(
        'exam_id',
        array(
            'class' => 'caps-admin-curriculum-exam-name-choose',
            'div' => false,
            'label' => false,
            'options' => $examsList
        )
    );
    echo $this->Form->input(
        'curriculum_id',
        array(
            'default' => $curriculum['id'],
            'type' => 'hidden'
        )
    );
    echo $this->Form->input(
        'year',
        array(
            'class' => 'caps-admin-curriculum-exam-year-choose',
            'div' => false,
            'label' => false,
            'options' => (substr($curriculum['name'], 0, strlen('Laurea Triennale')) === 'Laurea Triennale' ? array(1 => 1, 2 => 2, 3 => 3) : array(1 => 1, 2 => 2))
        )
    );
    echo $this->Form->input(
        'position',
        array(
            // FIXME(jacquerie): Not properly setted.
            'default' => 0,
            'type' => 'hidden'
        )
    );
    echo $this->Form->submit(
        array(
            'class' => 'caps-admin-curriculum-exam-submit',
            'div' => false,
            'label' => 'Aggiungi esame'
        )
    );
    echo $this->Form->end();
?>

<hr class="caps-admin-curriculum"/>

<h3>Esami a scelta in un gruppo</h3>
<table class="caps-admin-restricted-exams">
    <tr>
        <th>Nome Gruppo</th>
        <th>Anno</th>
        <th>Azioni</th>
    </tr>
    <?php foreach ($curriculum['CompulsoryGroup'] as $compulsory_group) { ?>
        <tr>
            <td class="caps-admin-curriculum-exam-name">
                <?php
                    // XXX(jacquerie): Terrible, terrible fix.
                    foreach($groups as $group) {
                        if ($group['Group']['id'] == $compulsory_group['group_id']) {
                            $name = $group['Group']['name'];
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
                                array(
                                    'controller' => 'compulsory_groups',
                                    'action' => 'admin_delete',
                                    $compulsory_group['id']
                                ),
                                array(
                                    'class' => 'reject'
                                ),
                                __('Sei sicuro di voler cancellare l\'esame a scelta nel gruppo "%s"?', $name)
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
        'CompulsoryGroup',
        array(
            'controller' => 'compulsory_groups',
            'action' => 'add'
        )
    );
    echo $this->Form->input(
        'group_id',
        array(
            'class' => 'caps-admin-curriculum-group-name-choose',
            'div' => false,
            'label' => false,
            'options' => $groupsList
        )
    );
    echo $this->Form->input(
        'curriculum_id',
        array(
            'default' => $curriculum['Curriculum']['id'],
            'type' => 'hidden'
        )
    );
    echo $this->Form->input(
        'year',
        array(
            'class' => 'caps-admin-curriculum-group-year-choose',
            'div' => false,
            'label' => false,
            'options' => (substr($curriculum['Curriculum']['name'], 0, strlen('Laurea Triennale')) === 'Laurea Triennale' ? array(1 => 1, 2 => 2, 3 => 3) : array(1 => 1, 2 => 2))
        )
    );
    echo $this->Form->input(
        'position',
        array(
            // FIXME(jacquerie): Not properly setted.
            'default' => 0,
            'type' => 'hidden'
        )
    );
    echo $this->Form->end(
        array(
            'class' => 'caps-admin-curriculum-group-submit',
            'div' => false,
            'label' => 'Aggiungi gruppo'
        )
    );
?>

<hr class="caps-admin-curriculum"/>

<h3>Esami a scelta libera</h3>
<table class="caps-admin-free-exams">
    <tr>
        <th>Nome Esame</th>
        <th>Anno</th>
        <th>Azioni</th>
    </tr>
    <?php foreach ($curriculum['FreeChoiceExam'] as $free_choice_exam) { ?>
        <tr>
            <td class="caps-admin-curriculum-exam-name">Esame a scelta libera</td>
            <td class="caps-admin-curriculum-exam-year"><?php echo $free_choice_exam['year']; ?></td>
            <td class="caps-admin-curriculum-exam-actions">
                <ul class="actions">
                    <li>
                        <?php
                            echo $this->Form->postLink(
                                __('Cancella'),
                                array(
                                    'controller' => 'free_choice_exams',
                                    'action' => 'admin_delete',
                                    $free_choice_exam['id']
                                ),
                                array(
                                    'class' => 'reject'
                                ),
                                __('Sei sicuro di voler cancellare questo esame a scelta libera?')
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
        'FreeChoiceExam',
        array(
            'controller' => 'free_choice_exams',
            'action' => 'add'
        )
    );
    // XXX(jacquerie): Ignored by the receiving controller.
    echo $this->Form->input(
        'name',
        array(
            'class' => 'caps-admin-curriculum-exam-name-choose',
            'default' => 'Esame a scelta libera',
            'disabled' => true,
            'div' => false,
            'label' => false
        )
    );
    echo $this->Form->input(
        'curriculum_id',
        array(
            'default' => $curriculum['Curriculum']['id'],
            'type' => 'hidden'
        )
    );
    echo $this->Form->input(
        'year',
        array(
            'class' => 'caps-admin-curriculum-exam-year-choose',
            'div' => false,
            'label' => false,
            'options' => (substr($curriculum['Curriculum']['name'], 0, strlen('Laurea Triennale')) === 'Laurea Triennale' ? array(1 => 1, 2 => 2, 3 => 3) : array(1 => 1, 2 => 2))
        )
    );
    echo $this->Form->input(
        'position',
        array(
            // FIXME(jacquerie): Not properly setted.
            'default' => 0,
            'type' => 'hidden'
        )
    );
    echo $this->Form->end(
        array(
            'class' => 'caps-admin-curriculum-exam-submit',
            'div' => false,
            'label' => 'Aggiungi esame'
        )
    );
?>
