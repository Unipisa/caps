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
use Cake\Auth\DefaultPasswordHasher;
use Authentication\IdentityInterface;
use App\Model\Entity\Proposal;
use App\Model\Entity\Attachment;

/**
 * User Entity
 *
 * @property string $id
 * @property string|null $username
 * @property string|null $name
 * @property string|null $number
 *
 * @property \App\Model\Entity\Proposal[] $proposals
 */
class User extends Entity implements IdentityInterface
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
        'username' => true,
        'name' => true,
        'number' => true,
        'proposal' => true,
        'givenname' => true,
        'surname' => true,
        'email' => true,
        'admin' => true,
        'documents' => true
    ];

    public function getIdentifier()
    {
        return $this->username;
    }

    public function getOriginalData()
    {
        return $this;
    }

    public function canView(Entity $item, $secrets = []) : bool {
        if ($item instanceof Proposal) {
            return $this->canViewProposal($item, $secrets);
        }
        if ($item instanceof Attachment) {
            return $this->canViewAttachment($item, $secrets);
        }
        if ($item instanceof Form) {
            return $this['admin'] || ($this['id'] == $item['user_id']);
        }
        return $this['admin'];
    }

    public function canAddAttachment(Proposal $proposal, $secrets = []) : bool
    {
        return $this['admin'] ||
            $this['id'] == $proposal['user_id'] ||
            $proposal->checkSecrets($secrets);
    }

    public function canViewAttachment(Attachment $attachment, $secrets = []) : bool
    {
        return $this['admin'] ||
            $this['username'] == $attachment->user['username'] ||
            ($attachment->proposal != null && $this['id'] == $attachment->proposal['user_id']) ||
            ($attachment->proposal != null && $attachment->proposal->checkSecrets($secrets));
    }

    public function canDeleteAttachment(Attachment $attachment) : bool
    {
        return $this['admin'] ||
            $this['id'] == $attachment['user_id'];
    }

    public function canDeleteForm(Form $form) : bool 
    {
        return $this['admin'] || ($this['id'] == $form['user_id']);
    }

    public function canViewProposal(Proposal $proposal, $secrets = []) : bool 
    {
        return $this['admin'] || ($this['id'] == $p['user_id']) || $p->checkSecrets($secrets);
    }

    public function canDeleteProposal(Proposal $proposal) : bool
    {
        return $this['admin'] || (($this['id'] == $proposal['user_id']) && ($proposal['state'] == 'draft'));
    }

    public function getDisplayName() {
        return $this->givenname . " " . $this->surname;
    }

    protected function _setPassword(string $password) : ?string
    {
        if (strlen($password) > 0) {
            return (new DefaultPasswordHasher())->hash($password);
        }
    }

    public function checkPassword(string $password): bool {
        return (new DefaultPasswordHasher())->hash($password) == $this->password;
    }
}
