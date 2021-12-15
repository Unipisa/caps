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
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * ChosenExam Entity
 *
 * @property int $id
 * @property int|null $credits
 * @property int|null $exam_id
 * @property int|null $proposal_id
 *
 * @property \App\Model\Entity\Exam $exam
 * @property \App\Model\Entity\Proposal $proposal
 */
class ChosenExam extends Entity
{
    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array
     */
    protected $_accessible = [
        'credits' => true,
        'exam_id' => true,
        'proposal_id' => true,
        'exam' => true,
        'chosen_year' => true,
        'compulsory_group_id' => true,
        'compulsory_exam_id' => true,
        'compulsory_group' => true,
        'compulsory_exam' => true,
        'free_choice_exam' => true,
        'free_choice_exam_id' => true,
        'proposal' => true
    ];
}