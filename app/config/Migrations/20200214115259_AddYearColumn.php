<?php
use Migrations\AbstractMigration;

class AddYearColumn extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     * @return void
     */
    public function change()
    {
        $table = $this->table('degrees');
        $table->addColumn('years', 'integer', [
            'null' => 'false'
        ]);
        $table->update();

        // Migrate the current data
        $tbl = \Cake\ORM\TableRegistry::getTableLocator()->get('degrees');
        foreach ($tbl->find() as $degree) {
            if (strpos(strtolower($degree['name']), "triennale") !== false) {
                $degree->years = 3;
            }
            else {
                $degree->years = 2;
            }

            $tbl->save($degree, [ 'atomic' => false ]);
        }
    }
}
