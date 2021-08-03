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
        $this->getAdapter()->commitTransaction(); ## workaround cakephp bug: https://github.com/cakephp/migrations/issues/370
        $q = $this
            ->fetchAll('select degrees.id as id, degrees.name as name, degrees.years as years, degrees.enable_sharing as enable_sharing from degrees');
        $old_degrees = [];
        foreach($q as $record) {
            $record['id'] = intval($record['id']);
            $record['years'] = intval($record['years']);
            $record['enable_sharing'] = intval($record['enable_sharing']);
            $record['academic_years'] = [];
            $old_degrees[$record['id']] = $record;
        }
        debug($old_degrees);
        $q = $this
            ->fetchAll('select curricula.id as curricula_id, curricula.academic_year as academic_year, curricula.degree_id as degree_id from curricula');
        $new_degrees = []; // old_degree_id -> academic_year -> new_degree_id 

        $DegreesTable = TableRegistry::get('Degrees');

        foreach ($q as $record) {
            $record['curricula_id'] = intval($record['curricula_id']);
            $record['academic_year'] = intval($record['academic_year']);
            $record['degree_id'] = intval($record['degree_id']);
            if (array_key_exists($record['degree_id'], $new_degrees)) {
                if (array_key_exists($record['academic_year'], $new_degrees[$record['degree_id']])) {
                    // degree for given academic_year already exists!
                } else {
                    // devo clonare il vecchio degree per questo nuovo anno
                    $row = [
                        'name' => $old_degrees[$record['degree_id']]['name'],
                        'years' => $old_degrees[$record['degree_id']]['years'],
                        'enable_sharing' => $old_degrees[$record['degree_id']]['enable_sharing'],
                        'academic_year' => $record['academic_year']
                    ];
                    $table = $this->table("degrees");
                    $table->insert($row);
                    $table->saveData();
                    $result_id = $this->getAdapter()->getConnection()->lastInsertId();

                    $new_degrees[$record['degree_id']][$record['academic_year']] = $result_id;
                    array_push($old_degrees[$record['degree_id']]['academic_years'], $record['academic_year']);
                }
            } else {
                // e' il primo curriculum con questo degree, riutilizza il vecchio record:
                $new_degrees[$record['degree_id']] = [
                    $record['academic_year'] => $record['degree_id']
                ];

                array_push($old_degrees[$record['degree_id']]['academic_years'], $record['academic_year']);
            }
            debug($new_degrees);
        }

        foreach($new_degrees as $old_degree_id => $map) {
            foreach ($map as $academic_year => $new_degree_id) {
                $builder = $this->getQueryBuilder();
                $builder->update('curricula')
                    ->set('degree_id', $new_degree_id)
                    ->where([ 
                        'degree_id' => $old_degree_id,
                        'academic_year' => $academic_year
                     ])
                    ->execute();
            }
        }

        $this->getAdapter()->beginTransaction();
    }

    public function down() 
    {
        // NOT IMPLEMENTED! SORRY!
        // we should copy the academic_year from degrees to curricula
        // and then merge together all degrees with the same name
        // removing duplicates with different years
    }
}
