<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */
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
                        if ($pieces[1] == "De" || $pieces[1] == "Del"
                            || $pieces[1] == "Di" || $pieces[1] == "La"
                            || $pieces[1] == "Lo" || $pieces[1] == "Dal"
                            || $pieces[1] == "Villanis" || $pieces[1] == "Minutillo"
                            || $pieces[1] == "Walton" || $pieces[1] == "Leo"
                            || $pieces[2] == "GiuffrÈ"
                          ) {
                            $user->givenname = $pieces[0];
                            $user->surname = $pieces[1] . " " . $pieces[2];
                        }
                        else {
                            $user->givenname = $pieces[0] . " " . $pieces[1];
                            $user->surname = $pieces[2];
                        }
                        break;
                    case 4:
                        if ($pieces[2] == "Giorgio" || $pieces[2] == "Huaccha") {
                          $user->givenname = $pieces[0] . " " . $pieces[1] . " " . $pieces[2];
                          $user->surname = $pieces[3];
                        } else {
                          $user->givenname = $pieces[0] . " " . $pieces[1];
                          $user->surname = $pieces[2] . " " . $pieces[3];
                        }
                        break;
                    default:
                        if ($pieces[2] == 'Abd') {
                          $user->givenname = $pieces[0] . " " . $pieces[1] . " " . $pieces[2];
                          $user->surname = join(" ", array_slice($pieces, 3));
                        } else {
                          $user->givenname = $pieces[0] . " " . $pieces[1];
                          $user->surname = join(" ", array_slice($pieces, 2));
                        }
                        break;
                }

                echo "Updating " . $user->givenname . " / " . $user->surname . "\n";

                // We need atomic false because the migration is already incapsulated inside
                // a transaction, and if we let atomic->true (the default behavior), then
                // this transaction will be closed after calling save(), connfusing Phinx.
                $tbl->save($user, ['atomic' => false]);
            }
        }

    }
}