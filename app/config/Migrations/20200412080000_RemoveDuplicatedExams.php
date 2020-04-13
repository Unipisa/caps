<?php
use Migrations\AbstractMigration;

class RemoveDuplicatedExams extends AbstractMigration
{
    public function up()
    {
        $exams = $this->fetchAll('select id, code from exams order by id');
        $codes = [];

        foreach ($exams as $exam) {
            if (array_key_exists($exam['code'], $codes)) {
                array_push($codes[$exam['code']], $exam['id']); 
            } else {
                $codes[$exam['code']] = [ $exam['id'] ];
            }
        }

        foreach ($codes as $code => $ids) {
            for ($i = 1 ; $i < count($ids); $i ++) {
                $id = $ids[$i];
                echo "removing duplicated exam code=" . $code . " id=" . $id . "\n";
                // Viene mantenuto l'esame con id piu' basso, che e' il primo
                // che e' stato creato.
                // stiamo supponendo che gli esami duplicati non siano collegati
                // ad altri oggetti nel database
                $this->myExecute('delete from exams where id = :id', ['id' => $id]);
            }
        }
    }

    public function down() 
    {
        // nop!
    }

    private function myExecute($sql, $params) {
        $conn = $this->getAdapter()->getConnection();

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        return $stmt;
    }

}
