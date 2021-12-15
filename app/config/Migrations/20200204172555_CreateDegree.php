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

class CreateDegree extends AbstractMigration
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
        $table->addColumn('name', 'text', [
            'default' => null,
            'null' => false,
            'limit' => 255
        ]);
        $table->create();

        // We now change the table curricula to match this new setup, and
        // address the relevant degree. New degrees will be created on demand
        // as we extract them from the Curricula.
        $table = $this->table('curricula');

        $table->addColumn('academic_year', 'integer', [
            'null' => false,
            'limit' => 11
        ]);

        $table->addColumn('degree_id', 'integer', [
            'limit' => 11,
            'null' => false
        ]);
        $table->update();
        $table->addForeignKey('degree_id', 'degrees', 'id');

        // Insert the only two degrees that were supported up to this revision
        $this->table('degrees')->insert([
            'id' => 1,
            'name' => 'Laurea Triennale in Matematica'
        ])->save();
        $this->table('degrees')->insert([
            'id' => 2,
            'name' => 'Laurea Magistrale in Matematica'
        ])->save();

        // We do not try to migrate old data anymore, as there are no more active 
        // "CAPS 1.0" installations to be compatible with, since the following code
        // does not work with the latest changes to the models. It is only left 
        // for historical reasons. 
        return;

        // We need to migrate the old data to the new format
        $tbl = \Cake\ORM\TableRegistry::getTableLocator()->get('curricula');
        foreach ($tbl->find('all')->contain(['CompulsoryExams', 'CompulsoryGroups', 'FreeChoiceExams']) as $curriculum) {
            $name = $curriculum['name'];

            // Detect the name of the degree
            if (strpos(strtolower($name), "triennale")) {
                $curriculum['degree_id'] = 1;
            }
            else {
                $curriculum['degree_id'] = 2;
            }

            // Detect the rest, curriculum and academic/year, we have two kind of dash inside the
            // database at the moment, so we need to detect the one needed for the split.
            $dash = "—";
            if (strpos($name, $dash) == 0) {
                $dash = "-";
            }

            // Split the name (we cannot use explode because of encoding issues with the
            // dash symbol above in MySQL, apparently).
            $pieces = [];
            $jj = 0;
            for ($j = 0; $j < strlen($name); $j++) {
                if (!ctype_space($name[$j]) && !ctype_alnum($name[$j]) && $name[$j] != '/') {
                    $pieces[] = substr($name, $jj, $j-$jj);
                    $jj = $j+1;
                }
            }
            $pieces[] = substr($name, $jj);

            $pieces = array_values(array_filter($pieces, function ($c) {
                return strlen(trim($c)) > 0;
            }));

            $curriculum['name'] = trim(str_replace("curriculum", "", $pieces[1]));

            // Some curricula are defined only for one year, others are defined for more. We start from the
            // easy case first
            if (substr_count($pieces[2], "/") == 1) {
                $curriculum['academic_year'] = trim(explode("/", $pieces[2])[0]);
                $tbl->save($curriculum, [ 'atomic' => false ]);
            }
            else {
                // This is more complicated. We start from the first occurence, and then replicate the
                // curriculum for all the subsequent years.
                $pp = explode("/", $pieces[2]);

                // Find the starting year, which may be polluted by other words.
                $ll = explode(' ', $pp[0]);
                $ll = $ll[count($ll) - 1];
                $start_year = intval(trim($ll));

                // intval() is here to make sure the value is parsed as an integer.
                $end_year = intval(trim($pp[2])) - 1;

                // echo "$start_year / $end_year \n";

                $curriculum['academic_year'] = $start_year;
                $tbl->save($curriculum, [ 'atomic' => false ]);

                for ($i = $start_year + 1; $i <= $end_year; $i++) {
                    $c = $tbl->newEntity();

                    $c->name = $curriculum['name'];
                    $c->academic_year = $i;
                    $c->degree_id = $curriculum['degree_id'];

                    $c->compulsory_exams = $curriculum['compulsory_exams'];
                    $c->compulsory_groups = $curriculum['compulsory_groups'];
                    $c->free_choice_exams = $curriculum['free_choice_exams'];

                    foreach ($c->compulsory_exams as $k => &$ce) {
                        unset($ce['id']);
                        $ce->isNew(true);
                    }

                    foreach ($c->compulsory_groups as $k => &$ce) {
                        unset($ce['id']);
                        $ce->isNew(true);
                    }

                    foreach ($c->free_choice_exams as $k => &$ce) {
                        unset($ce['id']);
                        $ce->isNew(true);
                    }

                    // var_dump($c);

                    $tbl->save($c, [ 'atomic' => false ]);
                }
            }
        }
    }
}