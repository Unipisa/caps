<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class AddDatetimesToForms extends AbstractMigration
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
        $table = $this->table('forms');
        $conn = $this->getAdapter()->getConnection();
        if ($conn->getAttribute(PDO::ATTR_DRIVER_NAME) == "mysql") {
            $this->execute('ALTER TABLE forms MODIFY COLUMN modified datetime, MODIFY COLUMN date_submitted datetime, MODIFY COLUMN date_managed datetime');
        }
        $this->execute('UPDATE forms SET modified=date_submitted WHERE modified IS NULL');
        $table->update();
    }

    public function down() {

    }
}
