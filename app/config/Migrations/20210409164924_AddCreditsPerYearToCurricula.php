<?php
use Migrations\AbstractMigration;

class AddCreditsPerYearToCurricula extends AbstractMigration
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
        $table = $this->table('curricula');
        $table->addColumn('credits_per_year', 'string', [
            'default' => null,
            'limit' => 32,
            'null' => false,
        ]);
        $table->update();

        // Add the field in the database by setting it to 60,60,...,60, 
        // repeated for the number of years in the degree. 
        $q = $this
            ->query('select curricula.id as id, degrees.years as years from curricula inner join degrees on curricula.degree_id = degrees.id')
            ->fetchAll();
        foreach ($q as $record) {
            $id = $record['id'];
            $years = intval($record['years']);

            $builder = $this->getQueryBuilder();
            $builder->update('curricula')
                ->set('credits_per_year', implode(',', array_fill(1, $years, "60")))
                ->where([ 'id' => $id ])
                ->execute();
        }
    }

    public function down() {
        $table = $this->table('curricula');
        $table->removeColumn('credits_per_year');
        $table->update();
    }
}
