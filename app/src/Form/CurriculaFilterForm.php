<?php
namespace App\Form;

use Cake\Form\Schema;
use App\Form\FilterForm;

class CurriculaFilterForm extends FilterForm
{
    protected function _buildSchema(Schema $schema)
    {
        return $schema
          ->addField('name', ['type' => 'string'])
          ->addField('academic_year', ['type' => 'string'])
          ->addField('degree', ['type' => 'string']);
    }

    protected function _execute(array $data)
    {
        $this->setData($data);
        $this->filterFieldLike('Curricula.name', 'name');
        $this->filterFieldEqual('Curricula.academic_year', 'academic_year');
        $this->filterFieldLike('Degrees.name', 'degree');

        return $this->query;
    }
}
