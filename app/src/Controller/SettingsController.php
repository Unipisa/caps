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

            foreach ($data as $key => $value) {
                $this->Settings->query()->update()
                    ->set([ 'value' => $value ])
                    ->where([ 'key' => $key ])
                    ->execute();
            }
        }

        $settings = $this->paginate($this->Settings);
        $this->set(compact('settings'));
    }
}
