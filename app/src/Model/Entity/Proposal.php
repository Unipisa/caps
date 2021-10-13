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
use \App\Model\Entity\User;

/**
 * Proposal Entity
 *
 * @property int $id
 * @property bool|null $approved
 * @property bool|null $submitted
 * @property bool|null $frozen
 * @property int|null $user_id
 * @property \Cake\I18n\FrozenTime|null $modified
 *
 * @property \App\Model\Entity\User $user
 */
class Proposal extends Entity
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
        'state' => true,
        'user_id' => true, // TODO: Forse questo campo dovrebbe non essere qui?
        'modified' => true,
        'curriculum_id' => true,
        'user' => true,
        'chosen_exams' => true,
        'chosen_free_choice_exams' => true,
        'submitted_date' => true,
        'approved_date' => true,
        'auths' => true
    ];

    public function getStateString()
    {
        switch ($this->state) {
            case 'draft':
                return 'bozza';
            case 'submitted':
                return 'sottomesso';
            case 'approved':
                return 'approvato';
            case 'rejected':
                return 'rigettato';
            default:
                return $this->state;
        }
    }

    /**
     * Checks if a user is authorized to access a proposal, using a
     * secret token.
     *
     * @param string $secret The token to check
     * @return bool
     */
    public function checkSecret(string $secret)
    {
        if ($secret == null) {
            return false;
        }

        foreach ($this->auths as $a) {
            if ($a['secret'] == $secret) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks if a user can access a proposal, based on an array of
     * possible secret tokens. Equivalent to calling
     * Proposal::checkSecret() in a loop.
     *
     * @param array $secrets The secrets to check
     * @return bool
     */
    public function checkSecrets(array $secrets)
    {
        foreach ($secrets as $secret)
        {
            if ($this->checkSecret($secret))
                return true;
        }

        return false;
    }

    public function removeSecrets() {
        foreach ($this['auths'] as $auth) {
            $auth['secret'] = null;
        }

        return $this;
    }

}
