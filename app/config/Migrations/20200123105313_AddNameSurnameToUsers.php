<?php
use Migrations\AbstractMigration;
use Cake\ORM\TableRegistry;

class AddNameSurnameToUsers extends AbstractMigration
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
        $table = $this->table('users');
        $table->addColumn('givenname', 'text', [
            'default' => null,
            'null' => false,
        ]);
        $table->addColumn('surname', 'text', [
            'default' => null,
            'null' => false,
        ]);
        $table->update();

        $tbl = TableRegistry::get('Users');
        $users = $tbl->find();

        foreach ($users as $user) {
            if ($user->surname == null) {
                $pieces = explode(" ", $user->name);

                switch (sizeof($pieces)) {
                    case 0:
                        $user->givenname = "";
                        $user->surname = "";
                        break;
                    case 1:
                        $user->givenname = "";
                        $user->givensurname = $pieces[0];
                        break;
                    case 2:
                        $user->givenname = $pieces[0];
                        $user->surname = $pieces[1];
                        break;
                    case 3:
                        if ($pieces[1] == "De" || $pieces[1] == "Del") {
                            $user->givenname = $pieces[0];
                            $user->surname = $pieces[1] . " " . $pieces[2];
                        }
                        else {
                            $user->givenname = $pieces[0] . " " . $pieces[1];
                            $user->surname = $pieces[2];
                        }
                        break;
                    case 4:
                        $user->givenname = $pieces[0] . " " . $pieces[1];
                        $user->surname = $pieces[2] . " " . $pieces[3];
                        break;
                    default:
                        $user->givenname = $pieces[0] . " " . $pieces[1];
                        $user->surname = join(" ", array_slice($pieces, 2));
                        break;
                }

                echo "Updating " . $user->givenname . " / " . $user->surname . "\n";

                $tbl->save($user, ['atomic' => false]);
            }
        }

    }
}
