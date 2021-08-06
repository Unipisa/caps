<?php
use Migrations\AbstractMigration;
use Cake\ORM\TableRegistry;

class DuplicateDegrees extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     * @return void
     */
    public function up()
    {
       $q = $this
            ->fetchAll('select * from degrees');
        $old_degrees = []; // degree_id -> degree
        foreach($q as $record) {
            foreach(['id', 'years', 'enable_sharing', 
                'approval_confirmation', 'rejection_confirmation', 
                'submission_confirmation'] as $field) {
                    $record[$field] = intval($record[$field]);
                }
            $record['academic_years'] = [];
            $old_degrees[$record['id']] = $record;
        }
        // debug($old_degrees);
        $q = $this
            ->fetchAll('select curricula.id as curricula_id, curricula.academic_year as academic_year, curricula.degree_id as degree_id from curricula');
        
        $new_degrees = []; // old_degree_id -> academic_year -> new_degree_id 

        $DegreesTable = TableRegistry::get('Degrees');

        foreach ($q as $record) {
            $record['curricula_id'] = intval($record['curricula_id']);
            $record['academic_year'] = intval($record['academic_year']);
            $record['degree_id'] = intval($record['degree_id']);
            // debug($record);
            if (array_key_exists($record['degree_id'], $new_degrees)) {
                if (array_key_exists($record['academic_year'], $new_degrees[$record['degree_id']])) {
                    // degree for given academic_year already exists!
                } else {
                    // devo clonare il vecchio degree per questo nuovo anno
                    $row = ['academic_year' => $record['academic_year']];
                    foreach([
                        'name', 'years', 'enable_sharing', 
                        'approval_confirmation', 'rejection_confirmation',
                        'submission_confirmation', 'approval_message',
                        'rejection_message', 'submission_message', 'free_choice_message'] 
                        as $field) {
                            $row[$field] = $old_degrees[$record['degree_id']][$field];
                        }
                    $table = $this->table("degrees");
                    $table->insert($row);
                    $table->saveData();
                    $result_id = intval($this->getAdapter()->getConnection()->lastInsertId());

                    $new_degrees[$record['degree_id']][$record['academic_year']] = $result_id;
                    array_push($old_degrees[$record['degree_id']]['academic_years'], $record['academic_year']);
                }
            } else {
                // e' il primo curriculum con questo degree, riutilizza il vecchio record:

                $this->execute("UPDATE degrees SET academic_year = " . $record['academic_year'] . 
                    " WHERE id = " . $record['degree_id']);
                $new_degrees[$record['degree_id']] = [
                    $record['academic_year'] => $record['degree_id']
                ];

                array_push($old_degrees[$record['degree_id']]['academic_years'], $record['academic_year']);
            }
        }
        
        print "DUPLICATING DEGREES:\n";
        foreach($new_degrees as $old_degree_id => $map) {
            foreach($map as $academic_year => $new_degree_id) {
                print $old_degree_id . ", " . $academic_year . " => " . $new_degree_id . "\n";
            }
        }
        echo "\n";

        foreach($new_degrees as $old_degree_id => $map) {
            foreach ($map as $academic_year => $new_degree_id) {
                $builder = $this->getQueryBuilder();
                $builder
                    ->update('curricula')
                    ->set('degree_id', $new_degree_id)
                    ->where([ 
                        'degree_id' => $old_degree_id,
                        'academic_year' => $academic_year
                     ])
                    ->execute();
            }
        }

        $old_groups = [];
        foreach($this->fetchAll('SELECT id from `groups`') as $row) {
            array_push($old_groups, intval($row['id']));
        }
        
        // debug($old_groups);

        $new_groups = []; // old_group_id -> academic_year -> new_group_id

        foreach($this->fetchAll(
            'SELECT compulsory_groups.group_id as group_id, '
            . 'compulsory_groups.curriculum_id as curriculum_id, '
            . 'curricula.academic_year as academic_year, '
            . 'groups.name as name, '
            . 'curricula.degree_id as degree_id '
            . 'from compulsory_groups, curricula, `groups` '
            . 'where compulsory_groups.curriculum_id = curricula.id AND '
            . 'groups.id = compulsory_groups.group_id'
            ) as $row) {
            $row['group_id'] = intval($row['group_id']);
            $row['curriculum_id'] = intval($row['curriculum_id']);
            $row['academic_year'] = intval($row['academic_year']);
            $row['degree_id'] = intval($row['degree_id']);
            // debug($row);
            if (array_key_exists($row['group_id'], $new_groups)) {
                if (array_key_exists($row['academic_year'], $new_groups[$row['group_id']])) {
                    // pass
                } else {
                    // duplicate group
                    $new_group_id = $this->create_group($row['name'], $row['degree_id']);
                    $new_groups[$row['group_id']][$row['academic_year']] = $new_group_id;
                }
            } else {
                // reuse group
                $this->execute('UPDATE `groups` set degree_id = ' . $row['degree_id'] . ' where id = ' . $row['group_id']);
                $new_groups[$row['group_id']] = [
                    $row['academic_year'] => $row['group_id']
                ];
            }
        }

        print "DUPLICATING GROUPS:\n";
        foreach($new_groups as $old_group_id => $map) {
            foreach($map as $academic_year => $new_group_id) {
                print $old_group_id . ", " . $academic_year . " => " . $new_group_id . "\n";
            }
        }
        print "\n";

        $removed_groups = [];
        // duplicate exams_groups
        $table = $this->table("exams_groups");
        foreach($old_groups as $group_id) {
            if (array_key_exists($group_id, $new_groups)) {
                foreach($this->fetchAll('SELECT * from exams_groups WHERE group_id = '.$group_id) as $row) {
                    $row['exam_id'] = intval($row['exam_id']);
                    // debug($row);
                    foreach($new_groups[$group_id] as $academic_year => $new_group_id) {
                        if ($new_group_id != $group_id) {
                            $table->insert([
                                'group_id' => $new_group_id,
                                'exam_id' => $row['exam_id']
                                ]);
                            $table->saveData();
                        }
                    }    
                }
            } else {
                // print "gruppo " . $group_id . " inutilizzato... lo rimuovo!\n";
                $this->execute('DELETE FROM exams_groups WHERE group_id = ' . $group_id);
                $this->execute('DELETE FROM `groups` WHERE id = ' . $group_id);
                array_push($removed_groups, $group_id);
            }
        }

        print "GRUPPI RIMOSSI:\n";
        foreach ($removed_groups as $group_id) {
            print $group_id . "\n";
        }
        print "\n";
    }

    function create_group($name, $degree_id) {
        $table = $this->table("groups");
        $table->insert([
            'name' => $name,
            'degree_id' => $degree_id
        ]);
        $table->saveData();
        return intval($this->getAdapter()->getConnection()->lastInsertId());
    }

    public function down() 
    {
        // NOT IMPLEMENTED! SORRY!
        // we should copy the academic_year from degrees to curricula
        // and then merge together all degrees with the same name
        // removing duplicates with different years
    }
}
