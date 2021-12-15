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

use Cake\I18n\Time;
use Cake\ORM\Entity;
use App\Model\Entity\User;
use Cake\Core\Configure;


class DocumentBase extends Entity
{
    // common functionality for Documents and Attachments
    /**
     * Check if this attachment is in PDF format.
     *
     * This function only checks the filename (assuming this attachment actually
     * contains any file), and not the data itself.
     *
     * @return bool
     */
    public function isPDF() {
        if ($this->filename != null) {
            return preg_match('/\.(?i)pdf$/', $this->filename);
        }

        return false;
    }

    /**
     * Find and validate PEF signatures makes a remote request, might take some time.
     *
     * The function returns an array of signatures, with the format specified by the
     * PDF Signature Verifier API, see https://github.com/robol/pdf-signature-verifier.
     *
     * @return array
     */
    public function signatures() {
        // If PDF signature verification is disabled, we just make this a NOOP.
        $Caps = Configure::read('Caps');
        $psv_api = $Caps['psv_api'];

        if ($psv_api == null || $psv_api == "") {
            return [];
        }
        else {
            $attachment = $this;

            // Check if the file is a PDF; otherwise, just return an
            // empty set.
            if ($attachment->filename == null || !$attachment->isPDF()) {
                return [];
            }
            $curl = curl_init($psv_api);
            $v = array(
                'data' => base64_encode(stream_get_contents($attachment->data))
            );

            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($v));
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

            $res = curl_exec($curl);
            curl_close($curl);

            $response = json_decode($res);

            // In case the API is broken or not available, we return an empty array which
            // means no signatures were detected. Note that in case we implement caching
            // for this remote API, this is one case where the result should not be stored.
            if (! is_array($response)) {
                $response = [];
            }

            return $response;
        }
    }
}
