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

use Cake\Form\Form;
use Cake\Form\Schema;
use Cake\Validation\Validator;

class FilterForm extends Form
{
    public function __construct($query)
    {
        parent::__construct();
        $this->query = $query;
    }

    public function validate_and_execute(array $data) {
        if ($this->validate($data)) {
            $this->execute($data);
        }

        return $this->query;
    }
 
    public function validationDefault(Validator $validator) : Validator
    {
        // $validator->requirePresence('status')
        // ->requirePresence('surname');

        return $validator;
    }

    protected function filterFieldLike($dbfield, $field)
    {
        if (!empty($this->getData($field))) {
            $this->query = $this->query->where([
            $dbfield . ' LIKE' => '%' . $this->getData($field) . '%'
            ]);
        }
    }

    protected function filterFieldEqual($dbfield, $field)
    {
        if (!empty($this->getData($field))) {
            $this->query = $this->query->where([
            $dbfield => $this->getData($field)
            ]);
        }
    }

    protected function filterFieldValue($dbfield, $value) {
        $this->query = $this->query->where([$dbfield => $value]);
    }

    protected function filterFieldBoolean($dbfield, $field) {
        $bool_values = [
            '0' => FALSE,
            '1' => TRUE
        ];
        $value = $this->getData($field);
        if (array_key_exists($value, $bool_values)) {
            $this->query = $this->query->where([
                $dbfield => $bool_values[$value]
            ]);
        }
    }
}