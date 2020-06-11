
<nav class="caps-admin-navigation actions">
    <ul>
        <li class="caps-admin-link">
            <?php
                echo $this->Html->link(
                    '↑&nbsp;Indietro',
                    ['action' => 'index'],
                    ['escape' => false]
                );
            ?>
        </li>
        <li class="caps-admin-link">
            <?php
                echo $this->Html->link(
                    '✎&nbsp;Modifica',
                    ['action' => 'edit', $curriculum['id']],
                    ['escape' => false] // non so a cosa serve
                );
            ?>
        </li>
        <li class="">
            <?php
                echo $this->Form->postLink(
                    '✗&nbsp;Elimina',
                    ['action' => 'delete', $curriculum['id']],
                    ['escape' => false,
                     'class' => 'action reject',
                     'confirm' => __('Sei sicuro di voler cancellare questo curriculum?')
                    ]
                );
            ?>
        </li>
    </ul>
</nav>

<h2>Curriculum</h2>

<table class="view">
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

<h3>Esami obbligatori</h3>
<table class="caps-admin-compulsory-exams">
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

<hr class="caps-admin-curriculum"/>

<h3>Esami a scelta in un gruppo</h3>
<table class="caps-admin-restricted-exams">
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

<hr class="caps-admin-curriculum"/>

<h3>Esami a scelta libera</h3>
<table class="caps-admin-free-exams">
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
