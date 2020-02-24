<?php
namespace App\Form;

use Cake\Form\Form;
use Cake\Form\Schema;
use Cake\Validation\Validator;

class ProposalsFilterForm extends Form
{
    public function __construct($query) {
      parent::__construct();
      $this->query = $query;
    }

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

    public function validationDefault(Validator $validator)
    {
        // $validator->requirePresence('status')
        // ->requirePresence('surname');

        return $validator;
    }

    public function filterFieldLike($dbfield, $field) {
        if (!empty($this->getData($field))) {
          $this->query = $this->query->where([
            $dbfield.' LIKE' => '%'.$this->getData($field).'%'
          ]);
        }
      }

    public function filterFieldEqual($dbfield, $field) {
        if (!empty($this->getData($field))) {
          $this->query = $this->query->where([
            $dbfield => $this->getData($field)
          ]);
        }
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
