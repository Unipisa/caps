<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
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
use Cake\Event\Event;

/**
 * Curricula Entity
 *
 * @property int $id
 * @property string|null $name
 *
 * @property \App\Model\Entity\Proposal[] $proposals
 */
class Curriculum extends Entity
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
        'name' => true,
        'proposals' => true,
        'degree' => true,
        'compulsory_exams' => true,
        'compulsory_groups' => true,
        'free_choice_exams' => true,
        'academic_year' => true,
        'degree_id' => true,
        'notes' => true,
        'credits_per_year' => true
    ];

    protected $_virtual = ['credits'];

    public function toString()
    {
        return $this['degree']['name'] .
            " — Curriculum " .
            $this['name'] .
            " — Anno Accademico " .
            $this['academic_year'] .
            "/" .
            ($this['academic_year'] + 1);
    }

    // Curriculum has a virtual field 'credits' that is the array 
    // version of 'credits_per_year', which is stored in the database 
    // as a comma separated list of values. 
    //
    // Assignment of arrays to credits_per_year are still converted to 
    // the right format by the Model.beforeMarshal event, which is run 
    // when using patchEntity(), and Model.beforeSave(), which is run 
    // before persisting data to the database. 
    public function _getCredits() {
      return explode(",", $this->credits_per_year);
    }
}