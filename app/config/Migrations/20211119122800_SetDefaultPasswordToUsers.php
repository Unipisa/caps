<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class SetDefaultPasswordToUsers extends AbstractMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * https://book.cakephp.org/phinx/0/en/migrations.html#the-change-method
     * @return void
     */
    public function change()
    {
        $this->execute("UPDATE users set password='' where password is NULL");   
        $table = $this->table('users');
        $table->changeColumn('password', 'string', [
            'null' => false, 'default' => ''
        ]);
        $table->update();
    }
}
