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
use Migrations\BaseMigration;

class AddYearColumn extends BaseMigration
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
            // Existing degree rows are populated below before the column is
            // made non-nullable.
            'null' => true,
            'limit' => 11
        ]);
        $table->update();

        // Avoid ORM schema caching while this migration is adding the column.
        $this->execute(
            "UPDATE degrees SET years = CASE " .
            "WHEN LOWER(name) LIKE '%triennale%' THEN 3 ELSE 2 END"
        );

        $table->changeColumn('years', 'integer', [
            'null' => false,
            'limit' => 11,
        ]);
        $table->update();
    }
}
