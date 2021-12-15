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

class AddExtendedInfoToProposals extends AbstractMigration
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
        // This migration considers the proposals in the database and tries to assign each exam to a rule in the CV.
        $proposals = $this->fetchAll(
            'select id, curriculum_id from proposals');

        foreach ($proposals as $proposal) {
            // The compulsory exams associated with this proposal
            $conn = $this->getAdapter()->getConnection();

            $compulsory_exams = $this->myFetchAll(
                'select * from compulsory_exams where curriculum_id = :cid',
                [ 'cid' => $proposal['curriculum_id'] ]);
            $compulsory_groups = $this->myFetchAll(
                'select * from compulsory_groups where curriculum_id = :cid',
                [ 'cid' => $proposal['curriculum_id'] ]);
            $free_choice_exams = $this->myFetchAll(
                'select * from free_choice_exams where curriculum_id = :cid',
                [ 'cid' => $proposal['curriculum_id'] ]
            );

            // For the groups, we also load the list of exams and we store it in the returned
            // dictionary
            foreach ($compulsory_groups as &$cg) {
                $cg['exams'] = $this->myFetchAll('select exam_id from exams_groups where group_id = :gid',
                    [ 'gid' => $cg['group_id'] ]
                );
            }

            // Find the exams chosen by the student
            $chosen_exams = $this->myFetchAll(
                'select * from chosen_exams where proposal_id = :pid',
                [ 'pid' => $proposal['id'] ]);

            // First, find the chosen exams which are already satisfying some constraint and eliminate them
            // from the list, along with the relevant constraints
            foreach ($chosen_exams as $k => $ce) {
                $delete_flag = false;

                if ($ce['compulsory_exam_id'] != null) {
                    // Find the exam with the given ID
                    $delete_flag = true;
                    $this->deleteByID($compulsory_exams, $ce['compulsory_exam_id']);
                }

                if ($ce['compulsory_group_id'] != null) {
                    $delete_flag = true;
                    $this->deleteByID($compulsory_groups, $ce['compulsory_group_id']);
                }

                if ($ce['free_choice_exam_id'] != null) {
                    $delete_flag = true;
                    $this->deleteByID($free_choice_exams, $ce['free_choice_exam_id']);
                }

                if ($delete_flag) {
                    unset($chosen_exams[$k]);
                }
            }

            // For the remaining exams, try first to match free exams with compulsory ones
            foreach ($chosen_exams as $k => $ce) {
                foreach ($compulsory_exams as $kc => $compulsory_exam) {
                    if ($compulsory_exam['exam_id'] == $ce['exam_id']) {
                        // Found a match! save it in the database and remove this constraint; we also remove the year
                        // chosen for the exam in this case, it might have been guessed incorrectly before.
                        $this->myExecute('update chosen_exams set compulsory_exam_id = :ceid, chosen_year = :year where id = :id',
                            [ 'ceid' => $compulsory_exam['id'], 'year' => $compulsory_exam['year'], 'id' => $ce['id'] ]);
                        unset($compulsory_exams[$kc]);
                        unset($chosen_exams[$k]);
                        break;
                    }
                }
            }

            // Do essentially the same with compulsory groups
            foreach ($chosen_exams as $k => $ce) {
                $match_found = false;
                foreach ($compulsory_groups as $kc => $compulsory_group) {
                    // Check if the given exam match one of the exams in the group
                    foreach ($compulsory_group['exams'] as $cge) {
                        if ($cge['exam_id'] == $ce['exam_id']) {
                            // Found a match! save it in the database and remove this constraint; we also remove the year
                            // chosen for the exam in this case, it might have been guessed incorrectly before.
                            $this->myExecute('update chosen_exams set compulsory_group_id = :cgid, chosen_year = :year where id = :id',
                                [ 'cgid' => $compulsory_group['id'], 'year' => $compulsory_group['year'], 'id' => $ce['id'] ]);
                            unset($compulsory_groups[$kc]);
                            unset($chosen_exams[$k]);
                            $match_found = true;
                            break;
                        }
                    }

                    // No need to continue, we already have the right matching
                    if ($match_found) {
                        break;
                    }
                }
            }

            // Last but not least, match the remaining exam with free choice exams
            foreach ($free_choice_exams as $kc => $fce) {
                if (count($chosen_exams) > 0 ) {
                    $ce = array_pop($chosen_exams);
                    $this->myExecute('update chosen_exams set free_choice_exam_id = :fceid, chosen_year = :year where id = :id',
                        [ 'fceid' => $fce['id'], 'year' => $fce['year'], 'id' => $ce['id'] ]);
                    unset($free_choice_exams[$kc]);
                }
            }
        }
    }

    private function deleteByID($data, $id) {
        foreach ($data as $k => $d) {
            if ($d['id'] == $id) {
                unset($data[$k]);
            }
        }
    }

    private function findByID($data, $id) {
        foreach ($data as $d) {
            if ($d['id'] == $id) {
                return $d;
            }
        }

        return null;
    }

    private function myFetchAll($sql, $params) {
        $conn = $this->getAdapter()->getConnection();

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    private function myExecute($sql, $params) {
        $conn = $this->getAdapter()->getConnection();

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        return $stmt;
    }

    // Build a mapping between the values of the given key in the array data, and the position
    // in the original array, for easy O(1) lookup later on.
    private function createIndex($data, $key) {
        $map = [];
        foreach ($data as $k => $d) {
            $map[$d[$key]] = $k;
        }
        return $map;
    }
}