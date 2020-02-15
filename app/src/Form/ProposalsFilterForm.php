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
					->addField('surname', ['type' => 'string']);
    }

    public function validationDefault(Validator $validator)
    {
        // $validator->requirePresence('status')
        // ->requirePresence('surname');

        return $validator;
    }
}
?>
