<h2>Aggiorna curriculum</h2>

<?php
    echo $this->Form->create('Curriculum');
    echo $this->Form->input('id', ['type' => 'hidden']);
    echo $this->Form->input('name');
    echo $this->Form->end('Salva curriculum');
?>

<?php
    echo $this->Form->create('Curriculum');
    echo $this->Form->input('id', ['type' => 'hidden']);
    echo $this->Form->input('name');
    echo $this->Form->input('CompulsoryExam.0.exam_id', ['options' => $exams]);
    echo $this->Form->input('CompulsoryExam.0.year', ['type' => 'number']);
    echo $this->Form->input('CompulsoryExam.0.position', ['type' => 'number']);
    echo $this->Form->end('Salva curriculum');
?>

<?php
    echo $this->Form->create('Curriculum');
    echo $this->Form->input('id', ['type' => 'hidden']);
    echo $this->Form->input('name');
    echo $this->Form->input('CompulsoryGroup.0.group_id', ['options' => $groups]);
    echo $this->Form->input('CompulsoryGroup.0.year', ['type' => 'number']);
    echo $this->Form->input('CompulsoryGroup.0.position', ['type' => 'number']);
    echo $this->Form->end('Salva curriculum');
?>

<?php
    echo $this->Form->create('Curriculum');
    echo $this->Form->input('id', ['type' => 'hidden']);
    echo $this->Form->input('name');
    echo $this->Form->input('FreeChoiceExam.0.year', ['type' => 'number']);
    echo $this->Form->input('FreeChoiceExam.0.position', ['type' => 'number']);
    echo $this->Form->end('Salva curriculum');
?>
