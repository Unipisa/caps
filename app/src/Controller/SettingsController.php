<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Form\Form;
use Cake\Http\Exception\ForbiddenException;
use Cake\Mailer\Email;

/**
 * Settings Controller
 *
 * @property \App\Model\Table\SettingsTable $Settings
 *
 * @method \App\Model\Entity\Setting[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class SettingsController extends AppController
{
    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    {
        if (! $this->user['admin']) {
            throw new ForbiddenException('');
        }

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

        // This cannot be called settings because that's already used by AppController.
        $settings_data = $this->Settings->find('all');
        $this->set(compact('settings_data'));
    }
}
