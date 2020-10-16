<?php
namespace App\Form;

use Cake\Form\Schema;
use App\Form\FilterForm;

class UsersFilterForm extends FilterForm
{
    protected function _buildSchema(Schema $schema)
    {
        return $schema        
          ->addField('number', ['type' => 'string'])
          ->addField('name', ['type' => 'string'])
          ->addField('surname', ['type' => 'string'])
          ->addField('givenname', ['type' => 'string'])
          ->addField('email', ['type' => 'string'])
          ->addField('admin', ['type' => 'select', 'options' => ['admin']])
          ;
    }

    protected function _execute(array $data) {
      $this->setData($data);
      if ($this->getData('admin') === 'admin') {
          $this->filterFieldValue('Users.admin', true);
      }
      $this->filterFieldLike('Users.name', 'name');
      $this->filterFieldLike('Users.surname', 'surname');
      $this->filterFieldLike('Users.givenname', 'givenname');
      $this->filterFieldLike('Users.email', 'email');
      return $this->query;
    }
}
?>
