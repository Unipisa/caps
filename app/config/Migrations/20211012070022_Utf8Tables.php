<?php
declare(strict_types=1);

use Migrations\AbstractMigration;

class Utf8Tables extends AbstractMigration
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
        $conn = $this->getAdapter()->getConnection();
        $tables = [ 'attachments', 'chosen_exams', 'chosen_free_choice_exams', 
            'compulsory_exams', 'compulsory_groups', 'curricula',
            'degrees', 'documents', 'exams', 'exams_groups', 'free_choice_exams', 
            'groups', 'proposal_auths', 'proposals', 'settings', 'tags', 'tags_exams', 
            'users'  ];

        // If the database is MySQL, we convert all table to use the utf8mb4 encoding. 
        if ($conn->getAttribute(PDO::ATTR_DRIVER_NAME) == "mysql")
        {
            foreach ($tables as $table) 
            {
                echo "Converting table $table to utf8mb4 ... ";
                $conn->query("ALTER table `$table` CONVERT TO CHARACTER SET utf8mb4");
                echo "done\n";
            }
        }
    }

    public function down() {

    }
}
