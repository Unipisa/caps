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
namespace App\Form;

use Cake\Form\Schema;
use App\Form\FilterForm;

class ProposalsFilterForm extends FilterForm
{
    protected function _buildSchema(Schema $schema): \Cake\Form\Schema
    {
        return $schema
          ->addField('state', ['type' => 'select', 'options' => ['draft', 'submitted', 'approved', 'rejected']])
          ->addField('surname', ['type' => 'string'])
          ->addField('academic_year', ['type' => 'string'])
          ->addField('degree', ['type' => 'string'])
          ->addField('curriculum', ['type' => 'string'])
          ->addField('exam_name', ['type' => 'string'])
          ->addField('free_exam_name', ['type' => 'string']);
    }

    protected function _execute(array $data) : bool
    {
        $this->setData($data);

        $exam_name = $this->getData('free_exam_name');
        if (!empty($exam_name)) {
            // potrebbe essere più efficiente usare "innerJoinWith" invece che "matching"
            $this->query = $this->query->matching('ChosenFreeChoiceExams', 
                function ($q) use($exam_name) {
                    return $q->where(['ChosenFreeChoiceExams.name LIKE' => '%' . $exam_name .'%']);
                });
        }

        $exam_name = $this->getData('exam_name');
        if (!empty($exam_name)) {
            $this->query = $this->query->matching('ChosenExams.Exams', 
                function ($q) use($exam_name) {
                    return $q->where(['Exams.name LIKE' => '%' . $exam_name .'%']);
                });
        }

        if ($this->getData('state') !== '') {
            $this->filterFieldEqual('Proposals.state', 'state');
        }
        $this->filterFieldLike('Users.surname', 'surname');
        $this->filterFieldEqual('Curricula.academic_year', 'academic_year');
        $this->filterFieldLike('Degrees.name', 'degree');
        $this->filterFieldLike('Curricula.name', 'curriculum');


        return true;
    }
}