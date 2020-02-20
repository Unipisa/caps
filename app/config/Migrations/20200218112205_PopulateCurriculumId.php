<?php
use Migrations\AbstractMigration;
use Cake\ORM\TableRegistry;

class PopulateCurriculumId extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     * @return void
     */
    public function up()
    {
        // populate the new foreign_key with
        // the old many-to-many relation
        $tbl = TableRegistry::get('Proposals');
        $proposals = $tbl->find()
            ->contain([ 'Curricula' ]);
        foreach ($proposals as $proposal) {
            $proposal->curriculum_id = $proposal['curriculum'][0]['id'];
            $tbl->save($proposal, [ 'atomic' => false ]);
        }
    }

    public function down()
    {
      $tbl = TableRegistry::get('Proposals');
      $proposals = $tbl->find()
          ->contain([ 'Curricula' ]);
      foreach ($proposals as $proposal) {
          $proposal['curriculum'] = [ $proposal['curriculum_id'] ];
          // ERRORE:
          //
          $tbl->save($proposal, [ 'atomic' => false ]);
      }
    }
}
