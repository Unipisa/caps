<?php
namespace App\Form;

use Cake\Form\Form;
use Cake\Form\Schema;
use Cake\Validation\Validator;

class FilterForm extends Form
{
    public function __construct($query) {
      parent::__construct();
      $this->query = $query;
    }

    public function validationDefault(Validator $validator)
    {
        // $validator->requirePresence('status')
        // ->requirePresence('surname');

        return $validator;
    }

    protected function filterFieldLike($dbfield, $field) {
        if (!empty($this->getData($field))) {
          $this->query = $this->query->where([
            $dbfield.' LIKE' => '%'.$this->getData($field).'%'
          ]);
        }
      }

    protected function filterFieldEqual($dbfield, $field) {
        if (!empty($this->getData($field))) {
          $this->query = $this->query->where([
            $dbfield => $this->getData($field)
          ]);
        }
    }

    protected function filterFieldValue($dbfield, $value) {
        $this->query = $this->query->where([$dbfield => $value]);
    }
}
?>
