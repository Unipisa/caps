<?php
namespace App\Form;

use Cake\Form\Schema;
use App\Form\FilterForm;

class ExamsFilterForm extends FilterForm
{
    protected function _buildSchema(Schema $schema)
    {
        return $schema
          ->addField('name', ['type' => 'string'])
          ->addField('code', ['type' => 'string'])
          ->addField('sector', ['type' => 'string'])
          ->addField('credits', ['type' => 'integer']);
    }

    protected function _execute(array $data)
    {
        $this->setData($data);
        $this->filterFieldLike('Exams.name', 'name');
        $this->filterFieldEqual('Exams.code', 'code');
        $this->filterFieldLike('Exams.sector', 'sector');
        $this->filterFieldEqual('Exams.credits', 'credits');

        return $this->query;
    }
}
