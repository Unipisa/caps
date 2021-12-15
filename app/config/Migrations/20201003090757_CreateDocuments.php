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
use Phinx\Db\Adapter\MysqlAdapter;

class CreateDocuments extends AbstractMigration
{
    /**
     * Up Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     * @return void
     */
    public function up()
    {
        $table = $this->table('documents');
        $table->addColumn('filename', 'text', [
            'default' => null,
            'null' => true,
        ]);
        $table->addColumn('owner_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('user_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        if ($this->getAdapter()->getConnection()->getAttribute(PDO::ATTR_DRIVER_NAME) == "mysql") {
            $table->addColumn('data', 'blob', [
                'default' => null,
                'null' => true,
                'limit' => MysqlAdapter::BLOB_LONG
            ]);
        }
        else {
            $table->addColumn('data', 'blob', [
                'default' => null,
                'null' => true,
            ]);
        }
        $table->addColumn('created', 'datetime', [
            'default' => null,
            'null' => false,
        ]);
        $table->addColumn('comment', 'text', [
            'default' => null,
            'null' => true,
        ]);
        $table->addColumn('mimetype', 'string', [
            'default' => null,
            'limit' => 255,
            'null' => true
        ]);
        $table->create();
        $table->addForeignKey('user_id', 'users')->save();
        $table->addForeignKey('owner_id', 'users', 'id')->save();
    }

    public function down() {
        $this->table('documents')->drop()->save();
    }
}