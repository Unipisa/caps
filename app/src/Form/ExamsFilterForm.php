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
namespace App\Form;

use Cake\Form\Schema;
use App\Form\FilterForm;

class ExamsFilterForm extends FilterForm
{
    protected function _buildSchema(Schema $schema): \Cake\Form\Schema
    {
        return $schema
          ->addField('name', ['type' => 'string'])
          ->addField('code', ['type' => 'string'])
          ->addField('sector', ['type' => 'string'])
          ->addField('credits', ['type' => 'integer']);
    }

    protected function _execute(array $data) : bool
    {
        $this->setData($data);
        $this->filterFieldLike('Exams.name', 'name');
        $this->filterFieldEqual('Exams.code', 'code');
        $this->filterFieldLike('Exams.sector', 'sector');
        $this->filterFieldEqual('Exams.credits', 'credits');

        return true;
    }
}