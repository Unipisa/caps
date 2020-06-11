<?php
namespace App\Form;

use Cake\Form\Schema;
use App\Form\FilterForm;

class ProposalsFilterForm extends FilterForm
{
    protected function _buildSchema(Schema $schema)
    {
        return $schema
          ->addField('state', ['type' => 'select', 'options' => ['draft', 'submitted', 'approved', 'rejected']])
          ->addField('surname', ['type' => 'string'])
          ->addField('academic_year', ['type' => 'string'])
          ->addField('degree', ['type' => 'string'])
          ->addField('curriculum', ['type' => 'string'])
          ;
    }

    protected function _execute(array $data) {
      $this->setData($data);
      if ($this->getData('state') !== 'all') {
          $this->filterFieldEqual('Proposals.state', 'state');
      }
      $this->filterFieldLike('Users.surname', 'surname');
      $this->filterFieldEqual('Curricula.academic_year', 'academic_year');
      $this->filterFieldLike('Degrees.name', 'degree');
      $this->filterFieldLike('Curricula.name', 'curriculum');
      return $this->query;
    }
}
?>
