<?php
use Migrations\AbstractMigration;

class RemoveDuplicatedExams extends AbstractMigration
{
    public function up()
    {
        // Make sure we allow null values in the code column
        $table = $this->table('exams');
        $table->changeColumn('code', 'string', [
            'default' => null,
            'limit' => 5,
            'null' => true,
        ])->save();

        // The exams with empty code need to have it set to NULL, and are somewhat
        // specials, as they will be ignored by the following queries
        $this->myExecute('update exams set code = NULL where code = :emptycode', 
            [ 'emptycode' => '' ]);

        $exams = $this->fetchAll('select id, code from exams where code IS NOT NULL order by id');
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

                // Before removing the exam we make sure that it is replaced by the
                // one we are keeping in the database. 
                $this->myExecute(
                    'update chosen_exams set exam_id = :oldid where exam_id = :id', 
                    [ 'oldid' => $ids[0] , 'id' => $id ]
                );

                // And we update any compulsory_exams and/or groups just in case
                $this->myExecute(
                    'delete from exams_groups where exam_id = :id',
                    [ 'id' => $id ]
                );

                $this->myExecute(
                    'update compulsory_exams set exam_id = :oldid where exam_id = :id',
                    [ 'oldid' => $ids[0], 'id' => $id ]
                );

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
