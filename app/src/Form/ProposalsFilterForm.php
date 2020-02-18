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
					->addField('surname', ['type' => 'string', 'label' => __('Cognome')]);
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
      return $proposals;
    }
}
?>
