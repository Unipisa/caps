<h2>Aggiorna curriculum</h2>

<?php
    echo $this->Form->create('Curriculum');
    echo $this->Form->input('id', array('type' => 'hidden'));
    echo $this->Form->input('name');
    echo $this->Form->end('Salva curriculum');
?>

<?php
    echo $this->Form->create('Curriculum');
    echo $this->Form->input('id', array('type' => 'hidden'));
    echo $this->Form->input('name');
    echo $this->Form->input('CompulsoryExam.0.exam_id', array('options' => $exams));
    echo $this->Form->input('CompulsoryExam.0.year', array('type' => 'number'));
    echo $this->Form->input('CompulsoryExam.0.position', array('type' => 'number'));
    echo $this->Form->end('Salva curriculum');
?>

<?php
    echo $this->Form->create('Curriculum');
    echo $this->Form->input('id', array('type' => 'hidden'));
    echo $this->Form->input('name');
    echo $this->Form->input('CompulsoryGroup.0.group_id', array('options' => $groups));
    echo $this->Form->input('CompulsoryGroup.0.year', array('type' => 'number'));
    echo $this->Form->input('CompulsoryGroup.0.position', array('type' => 'number'));
    echo $this->Form->end('Salva curriculum');
?>

<?php
    echo $this->Form->create('Curriculum');
    echo $this->Form->input('id', array('type' => 'hidden'));
    echo $this->Form->input('name');
    echo $this->Form->input('FreeChoiceExam.0.year', array('type' => 'number'));
    echo $this->Form->input('FreeChoiceExam.0.position', array('type' => 'number'));
    echo $this->Form->end('Salva curriculum');
?>
