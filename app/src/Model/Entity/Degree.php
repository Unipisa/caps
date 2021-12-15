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
 * Degree Entity
 *
 * @property int $id
 * @property string|null $name
 *
 * @property \App\Model\Entity\Curriculum[] $curricula
 */
class Degree extends Entity
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
        'academic_year' => true,
        'curricula' => true,
        'years' => true,
        'enabled' => true,
        'default_group_id' => true,
        'enable_sharing' => true,
        'approval_message' => true,
        'submission_message' => true,
        'rejection_message' => true,
        'acceptance_confirmation' => true,
        'submission_confirmation' => true,
        'rejection_confirmation' => true,
        'free_choice_message' => true,
    ];

    public function academic_years() {
        return $this['academic_year'] . "/" . ($this['academic_year'] % 100 + 1);
    }

    public function isSharingEnabled($user = null) {
        switch ($this->enable_sharing) {
            case 0:
                return false;
            case 1:
                return true;
            case 2:
                return ($user != null && $user['admin']);
            default:
                return false;
        }
    }

    /**
     * Return a string representation of the current enable_sharing value. 
     */
    public function sharingMode() {
        switch ($this['enable_sharing']) {
            case 0:
                return 'Non abilitata';
                break;
            case 1:
                return 'Abilitata';
                break;
            case 2:
                return 'Solo per gli amministratori';
                break;
            default:
                return 'Valore non corretto nel database';
                break;
            }
    }
}