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

class AddConfirmationsToDegree extends AbstractMigration
{
    /**
     * We add some fields to the degrees table: 
     *  - approval_confirmation
     *  - approval_message
     *  - rejection_confirmation
     *  - rejection_message
     *  - submission_confirmation
     *  - submission_message
     * 
     * The *_message fields control what is shown on a proposal, 
     * assuming it is in the corresponding state. If empty, no particular 
     * message is shown.
     * 
     * The *_confirmation are booleans that control if an e-mail should be 
     * sent when the proposal transition to the specific state. 
     * 
     * @return void
     */
    public function up()
    {
      $table = $this->table('degrees');

      $table->addColumn('approval_confirmation', 'boolean', [
        'default' => true,
        'null' => false
      ]);

      $table->addColumn('rejection_confirmation', 'boolean', [
        'default' => true,
        'null' => false
      ]);

      $table->addColumn('submission_confirmation', 'boolean', [
        'default' => true,
        'null' => false
      ]);

      $table->addColumn('approval_message', 'text', [
        'null' => true
      ]);

      $table->addColumn('rejection_message', 'text', [
        'null' => true
      ]);

      $table->addColumn('submission_message', 'text', [
        'null' => true
      ]);

      $table->update();

      // We now copy the message included in the settings table, if any; we do this 
      // for approved and submission messages, which were the only one previous present 
      // in the database.
      $q = $this
        ->query('select value from settings where field=\'approved-message\'')
        ->fetchAll();
      if (count($q) > 0) 
      {
        $approved_msg = $q[0]["value"];
        $builder = $this->getQueryBuilder();
        $builder
          ->update('degrees')
          ->set('approval_message', $approved_msg)
          ->execute();
      }

      $q = $this
        ->query('select value from settings where field=\'submitted-message\'')
        ->fetchAll();
      if (count($q) > 0) 
      {
        $submitted_msg = $q[0]["value"];
        $builder = $this->getQueryBuilder();
        $builder
          ->update('degrees')
          ->set('submission_message', $submitted_msg)
          ->execute();
      }

      $this->execute('UPDATE degrees SET rejection_confirmation = false');
      $this->execute('DELETE from settings where field=\'approved-message\'');
      $this->execute('DELETE from settings where field=\'submitted-message\'');
    }

    /**
     * This function reverts the changes in up()
     */
    public function down()
    {
      $table = $this->table('degrees');

      $table->removeColumn('approval_message');
      $table->removeColumn('rejection_message');
      $table->removeColumn('submission_message');
      $table->removeColumn('approval_confirmation');
      $table->removeColumn('rejection_confirmation');
      $table->removeColumn('submission_confirmation');

      $table->save();

      // NOTE: There is no need to restore the entries in the settings 
      // table, as these are regenerated automatically on startup depending
      // on the specific version of CAPS that is loaded. 
      //
      // @see app/Model/Table/SettingsTable.php
    }
}