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

class AddChosenExamsExtendedInfo extends AbstractMigration
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
        $table = $this->table('chosen_exams');
        $table->addColumn('compulsory_group_id', 'integer', [
            'null' => true,
            'default' => null,
            'limit' => 11
        ]);
        $table->addColumn('compulsory_exam_id', 'integer', [
            'null' => true,
            'default' => null,
            'limit' => 11
        ]);
        $table->addColumn('chosen_year', 'integer', [
            'null' => false,
            'limit' => 11
        ]);
        $table->update();
        $table->addForeignKey('compulsory_group_id', 'compulsory_group', 'id');
        $table->addForeignKey('compulsory_exam_id', 'compulsory_exam', 'id');

        $table = $this->table('chosen_free_choice_exams');
        $table->addColumn('free_choice_exam_id', 'integer', [
            'null' => true,
            'default' => null,
            'limit' => 11
        ]);
        $table->addColumn('chosen_year', 'integer', [
            'null' => false,
            'limit' => 11
        ]);
        $table->update();
        $table->addForeignKey('free_choice_exam_id', 'free_choice_exam', 'id');

        // Update the entries by setting the year guessing that
        // the exams are given in the right order, and with 60
        // credits per year.
        $tbl = TableRegistry::get('Proposals');
        $chosen_exams_tbl = TableRegistry::get('ChosenExams');
        $chosen_free_choice_exams_tbl = TableRegistry::get('ChosenFreeChoiceExams');

        $proposals = $tbl->find()
            ->contain([ 'ChosenExams', 'ChosenFreeChoiceExams',
                        'ChosenExams.Exams' ]);

        foreach ($proposals as $proposal) {
            $credits = 0;
            $year = 1;

            // Update all the chosen exams for this proposal
            foreach ($proposal->chosen_exams as $chosen_exam) {
                if ($chosen_exam['exam']['sector'] != 'PROFIN') {
                    $chosen_exam->chosen_year = $year;

                    $credits = $credits + $chosen_exam->credits;

                    if ($credits >= 60) {
                        $year = $year + 1;
                        $credits = $credits - 60;
                    }

                    $chosen_exams_tbl->save($chosen_exam, [ 'atomic' => false ]);
                }
            }

            foreach ($proposal->chosen_free_choice_exams as $chosen_exam) {
                $chosen_exam->chosen_year = $year;

                $credits = $credits + $chosen_exam->credits;

                if ($credits >= 60) {
                    $year = $year + 1;
                    $credits = $credits - 60;
                }

                $chosen_free_choice_exams_tbl->save($chosen_exam, [ 'atomic' => false ]);
            }

            // Find and update the final thesis
            foreach ($proposal->chosen_exams as $chosen_exam) {
                if ($chosen_exam['exam']['sector'] == 'PROFIN') {
                    $chosen_exam->chosen_year = $year;
                    $chosen_exams_tbl->save($chosen_exam, [ 'atomic' => false ]);
                }
            }
        }
    }
}