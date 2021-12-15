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

class CreateAttachments extends AbstractMigration
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
        $table = $this->table('attachments');
        $table->addColumn('filename', 'string', [
            'default' => null,
            'limit' => 255,
            'null' => false,
        ]);
        $table->addColumn('user_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        $table->addColumn('proposal_id', 'integer', [
            'default' => null,
            'limit' => 11,
            'null' => false,
        ]);
        if ($this->getAdapter()->getConnection()->getAttribute(PDO::ATTR_DRIVER_NAME) == "mysql") {
            $table->addColumn('data', 'blob', [
                'default' => null,
                'null' => false,
                'limit' => MysqlAdapter::BLOB_LONG
            ]);
        }
        else {
            $table->addColumn('data', 'blob', [
                'default' => null,
                'null' => false,
            ]);
        }
        $table->addColumn('mimetype', 'string', [
            'default' => null,
            'limit' => 255,
            'null' => false
        ]);
        $table->create();
        $table->addForeignKey('user_id', 'users')->save();
        $table->addForeignKey('proposal_id', 'proposals')->save();
    }
}