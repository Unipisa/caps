<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Form\Form;
use Cake\Http\Exception\ForbiddenException;

/**
 * Settings Controller
 *
 * @property \App\Model\Table\SettingsTable $Settings
 *
 * @method \App\Model\Entity\Setting[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class SettingsController extends AppController
{
    // Here is a list of the fields which are expected to be present in the database.
    // If they are not, we automatically create the relevant fields in the form when
    // the user navigates there.
    //
    // The value specified here is the default value proposed in case there is nothing
    // set in the database. Please note that if the code queries the Settings before
    // this page is accessed and saved, then a null value will be returned, instead of
    // this default.
    //
    // Additional fields are still displayed and shown to the user, for compatibility.
    private $required_fields = [
        [ 'field' => 'user-instructions', 'value' => '', 'fieldtype' => 'textarea' ],
        [ 'field' => 'approved-message',  'value' => '', 'fieldtype' => 'text' ],
        [ 'field' => 'submitted-message', 'value' => '', 'fieldtype' => 'text' ],
    ];

    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    {
        if (! $this->user['admin'])
            throw new ForbiddenException('');

        if ($this->request->is('post')) {
            // We need to loop over the provided data, and update the relevant fields in the database.
            $data = $this->request->getData();

            foreach ($data as $field => $value) {
                $this->Settings->query()->update()
                    ->set([ 'value' => $value ])
                    ->where([ 'field' => $field ])
                    ->execute();
            }
        }

        $settings = $this->Settings->find('all')->toArray();
        $settings_keys = array_map(function ($s) { return $s['field']; }, $settings);

        foreach ($this->required_fields as $field) {
            if (! in_array($field['field'], $settings_keys)) {
                $newsetting = $this->Settings->newEntity($field);
                $this->Settings->save($newsetting);
                $settings[] = $newsetting;
            }
        }

        $this->set(compact('settings'));
    }
}
