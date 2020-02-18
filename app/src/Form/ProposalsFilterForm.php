<?php
namespace App\Form;

use Cake\Form\Form;
use Cake\Form\Schema;
use Cake\Validation\Validator;

class ProposalsFilterForm extends Form
{
    protected function _buildSchema(Schema $schema)
    {
        return $schema
				  ->addField('status', ['type' => 'select', 'options' => ['pippo', 'pluto', 'topolino']])
					->addField('surname', ['type' => 'string'])
          ->addField('academic_year', ['type' => 'string'])
          ->addField('degree', ['type' => 'string', 'label' => __('laurea')]);
    }

    public function validationDefault(Validator $validator)
    {
        // $validator->requirePresence('status')
        // ->requirePresence('surname');

        return $validator;
    }

    public function filterProposals($proposals) {
      if ($this->getData('status') == 'pending') {
        $proposals = $proposals->where([
            'Proposals.submitted' => true,
            'Proposals.approved' => false
        ]);
      } else if ($this->getData('status') == 'approved') {
        $proposals = $proposals->where([
          'Proposals.approved' => true,
          'Proposals.frozen' => false ]);
      } else if ($this->getData('status') == 'archived') {
        $proposals = $proposals->where([
          'Proposals.frozen' => true ]);
      }
      if (!empty($this->getData('surname'))) {
        $proposals = $proposals->where([
          'Users.surname LIKE' => '%'.$this->getData('surname').'%'
        ]);
      }
      if (!empty($this->getData('academic_year'))) {
        // Error: SQLSTATE[HY000]: General error: 1 no such column: Curricula.academic_year
        $proposals = $proposals->where([
          'Curricula.academic_year' => $this->getData('academic_year')
        ]);
      }
      if (!empty($this->getData('degree'))) {
        // Error: Error: SQLSTATE[HY000]: General error: 1 no such column: Degree.name
        $proposals = $proposals->where([
          'Degrees.name LIKE' => '%'.$this->getData('degree').'%'
        ]);
      }
      return $proposals;
    }
}
?>
