<h2>Piano di studio di <?php echo $proposal['user']['name']; ?></h2>
<h3>Curriculum: <?php echo $proposal['curriculum'][0]['name']; ?></h3>
<h3>Matricola: <?php echo $proposal['user']['number']; ?></h3>

<table>
    <tr>
        <th>Codice</th>
        <th>Nome</th>
        <th>Settore</th>
        <th>Crediti</th>
    </tr>
<?php foreach ($proposal['chosen_exams'] as $chosen_exam): ?>
    <?php
        // XXX(jacquerie): Terrible, terrible fix.
        foreach ($exams as $exam) {
            if ($exam['id'] == $chosen_exam['exam_id']) {
                $code = $exam['code'];
                $name = $exam['name'];
                $sector = $exam['sector'];
            }
        }

        unset($exam);
    ?>
    <tr>
        <td><?= $code ?></td>
        <td><?= $name ?></td>
        <td><?= $sector ?></td>
        <td><?= $chosen_exam['credits'] ?></td>
    </tr>
<?php endforeach; ?>
<?php unset($chosen_exam); ?>
<?php foreach ($proposal['chosen_free_choice_exams'] as $exam): ?>
    <tr>
        <td></td>
        <td><?php echo $exam['name']; ?></td>
        <td></td>
        <td><?php echo $exam['credits']; ?></td>
    </tr>
<?php endforeach; ?>
<?php unset($exam); ?>
</table>

<ul class=planActions>
    <!-- FIXME: simplify this logic -->
    <?php if ($proposal['submitted'] && $proposal['approved'] && $proposal['frozen']): ?>
    <li>
        <?php
            echo $this->Html->link(
              'Riapri&nbsp;✎',
              ['action' => 'admin_thaw',
                  $proposal['id']],
              ['class' => 'accept',
                  'escape' => false]
            );
        ?>
    </li>
    <?php elseif ($proposal['submitted'] && $proposal['approved'] && !$proposal['frozen']): ?>
    <li>
        <?php
            echo $this->Html->link(
                'Archivia&nbsp;❄',
                ['action' => 'admin_freeze',
                    $proposal['id']],
                ['class' => 'reject',
                    'escape' => false]
            );
        ?>
    </li>
    <?php else: ?>
    <li>
        <?php
            echo $this->Html->link(
                'Accetta&nbsp;✓',
                ['action' => 'admin_approve',
                    $proposal['id']],
                ['class' => 'accept',
                    'escape' => false]
            );
        ?>
    </li>
    <li>
        <?php
            echo $this->Html->link(
                'Rifiuta&nbsp;✗',
                ['action' => 'admin_reject',
                    $proposal['id']],
                ['class' => 'reject',
                    'escape' => false]
            );
        ?>
    </li>
    <?php endif ?>
    <li>
        <?php
            echo $this->Html->link(
                'Indietro&nbsp;↩',
                $this->request->referer(),
                ['class' => 'back',
                    'escape' => false]
            );
        ?>
    </li>
</ul>
