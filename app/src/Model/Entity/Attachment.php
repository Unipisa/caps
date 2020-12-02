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

use Cake\I18n\Time;
use Cake\ORM\Entity;
use App\Model\Entity\User;

/**
 * Attachment Entity
 *
 * @property int $id
 * @property string|null $filename
 * @property int|null $user_id
 * @property int|null $proposal_id
 *
 * @property \App\Model\Entity\User $user
 * @property \App\Model\Entity\Proposal $proposal
 */
class Attachment extends Entity
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
        'filename' => true,
        'user_id' => true,
        'proposal_id' => true,
        'user' => true,
        'data' => true,
        'proposal' => true,
        'created' => true,
        'comment' => true
    ];

    /**
     * This function returns a list of signatures found in this PDF file. If the
     * filename does end in .pdf, this list is always empty. Otherwise, the PDF
     * is parsed and signatures are returned, but not verified.
     *
     * The returned array has the format:
     *
     * [
     *   [ 'name' => 'John Smith', 'date' => ... ],
     *   ...
     * ]
     *
     * where 'date' is a Cake/I18n/Time object.
     *
     * @return array Returns a list of the signatures in the PDF file.
     */
    public function getSignatures() {
        $signatures = [];

        // Check if this is likely to be a PDF file. If not, avoid parsing it.
        if (strtolower(substr($this->filename, -4)) != '.pdf') {
            return $signatures;
        }

        $found_sig = false;
        $signature = [];

        $data = stream_get_contents($this->data);

        foreach (explode("\n", $data) as $line) {
            if ($found_sig) {
                if (substr($line, 0, 6) == "/Name ") {
                    $name = substr($line, 7, -1);
                    $signature["name"] = $name;
                }
                if (substr($line, 0, 3) == "/M ") {
                    $date = substr($line, 6, -8);
                    $signature["date"] = Time::createFromFormat("YmdHis", $date);
                }
                if ($line == "endobj") {
                    $found_sig = false;
                    $signatures[] = $signature;
                }
            }
            else {
                if (substr($line, 0, 10) == '/Type /Sig') {
                    $found_sig = true;
                }
                $signature = [];
            }
        }

        return $signatures;
    }
}
