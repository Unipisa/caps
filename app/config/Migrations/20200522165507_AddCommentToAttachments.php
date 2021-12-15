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

class AddCommentToAttachments extends AbstractMigration
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
        $table = $this->table('attachments');

        $table->addColumn('comment', 'text', [
            'null' => true,
            'default' => null
        ]);

        $table->addColumn('created', 'datetime', [
            'null' => true,
            'default' => null
        ]);

        $table->changeColumn('filename', 'string', [
            'null' => true,
            'default' => null
        ]);
        if ($this->getAdapter()->getConnection()->getAttribute(PDO::ATTR_DRIVER_NAME) == "mysql") {
            $table->changeColumn('data', 'blob', [
                'null' => true,
                'limit' => MysqlAdapter::BLOB_LONG
            ]);
        }
        else {
            $table->changeColumn('data', 'blob', [
                'null' => true,
            ]);

        }

        $table->changeColumn('mimetype', 'string',[
            'null' => true,
            'limit' => 255
        ]);

        $table->update();

        // Set all the old created fields to now
        $this->execute('update attachments set created = (select modified from proposals where proposals.id = attachments.proposal_id);');
    }

    public function down() {
        $table = $this->table('attachments');

        $table->removeColumn('created');
        $table->removeColumn('comment');

        $table->update();

    }
}