<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;
use Cake\I18n\Time;
use App\Model\Entity\FormAuth;
use Cake\Utility\Security;
use Cake\Validation\Validation;
use Cake\Mailer\Email;


class FormsController extends RestController {

    private static $associations = [ 'Users', 'FormTemplates' ];

    // TODO: decidere come specificare i filtri per i campi associati
    public $allowedFilters = [ 
        'form_id' => Integer::class, 
        'user_id' => Integer::class,
        'state' => ['type' => String::class, 
                    'options' => ["draft", "submitted", "approved", "rejected"]],
        'user.surname' => [ 'type' => String::class, 
                            'dbfield' => "Users.surname",
                            'modifier' => "LIKE" ],
        'form_template.name' => [ 'type' =>  String::class,
                                'dbfield' => "FormTemplates.name",
                                'modifier' => "LIKE" ],
        'modified' => Integer::class,
        'date_submitted' => Integer::class,
        'date_managed' => Integer::class
        ];

    public function index() {
        $query = $this->request->getQuery();

        $forms = $this->Forms->find('all', 
            [ 'contain' => FormsController::$associations ]);

        $forms = $this->applyFilters($forms);

        // Check permissions
        if (!$this->user['admin'] && $this->user['id'] != $this->request->getQuery('user_id')) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        // clean the resulting data
        foreach($forms as $form) {
            $form['data'] = json_decode($form['data']);
            unset($form['user']['password']);
            unset($form['form_template']['text']);
            unset($form['form_template']['code']);
        }

        $this->JSONResponse(ResponseCode::Ok, $forms);
    }

    public function get($id) {
        try {
            $form = $this->Forms->get($id, [ 'contain' => FormsController::$associations ]);
            $form['data'] = json_decode($form['data']);
        }
        catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound);
            return;
        }

        if (! $this->user->canViewForm($form)) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $form);
    }

    public function delete($id) {
        $form = $this->Forms->get($id);

        if (! $this->user->canDeleteForm($form)) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'The current user can not delete this form.');
            return;
        }

        try {
            $this->Forms->deleteOrFail($form);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::Error, null, 'Error while deleting the proposal');
            return;
        }

        $this->JSONResponse(ResponseCode::Ok);
    }

    public function patch($id) {
        $form = $this->Forms->get($id, [ 'contain' => FormsController::$associations ]); // TODO: catch exception
        $payload = json_decode($this->request->getBody());

        if (!$form || !($this->user['admin'] || $this->user['id'] == $form['user_id'])) {
            // don't leak information:
            // if the form does not exist give the same error as if you cannot access it
            $this->JSONResponse(ResponseCode::Error, null, 'The current user can not edit this form or form does not exist.');
        }

        foreach($payload as $field => $value) {
            if ($field == "state") {
                // Solo il proprietario e l'amministratore possono modifica
                if ($this->user['admin'] || $form['state'] == "draft") {
                    $form[$field] = $value;
                    $form["date_managed"] = Time::now();
                } else {
                    $this->JSONResponse(ResponseCode::Error, null, 'Cannot change a submitted form');
                    return;
                }
            } else if ($field == "data") {
                if ($form['state'] == "draft") {
                    $form[$field] = $value;
                } else {
                    $this->JSONResponse(ResponseCode::Error, null, 'Cannot modify the data of a submitted form');
                    return;
                }
            }
        }
        $this->Forms->save($form);
        $this->JSONResponse(ResponseCode::Ok, $form);
    }

    public function post($id) {
        error_log("post form ".$id);
        // $path is something like /api/v1/forms/2050/share
        $path = parse_url($this->getRequest()->getRequestTarget(), PHP_URL_PATH);
        if (str_ends_with($path, "/share")) {
            return $this->share($id);
        } else {
            $this->JSONResponse(ResponseCode::Forbidden, null, "Bad request");
            return;
        }
    }

    function share($id) {
        error_log("share form ".$id);
        try {
            $form = $this->Forms->get($id, [ 'contain' => array_merge(FormsController::$associations, [ 'FormAuths' ]) ]);
            $form['data_expanded'] = json_decode($form['data']);
        } catch (\Exception $e) {
            $this->log($e);
            $this->JSONResponse(ResponseCode::NotFound, null, "Form not found");
            return;
        }
        if (!$this->user['admin'] && $this->user['id'] != $form['user_id']) {
            $this->JSONResponse(ResponseCode::Forbidden, null, "User cannot share this form");
            return;
        }

        if ($form['state'] != 'submitted') {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Si può chiedere un parere solo su form inviati.');
            return;
        }

        $data = json_decode($this->request->getBody());
        
        $form_auth = new FormAuth();
        $form_auth['form_id'] = $form['id'];
        $form_auth['email'] = $data->email;
        $form_auth['secret'] = base64_encode(Security::randomBytes(8));

        // Validate the email
        if (! Validation::email($form_auth['email']))
        {
            $this->JSONResponse(ResponseCode::BadRequest, 
                null, 'Email non valida');
            return;
        }

        if ($this->Forms->FormAuths->save($form_auth)) {
            $email = $this->createFormEmail($form)
            ->setTo($form_auth['email'])
            ->setSubject('[CAPS] richiesta di parere su modulo inviato');
            $email->setViewVars(['form_auth' => $form_auth]);
            $email->viewBuilder()->setTemplate('share_form');
            
            try {
                $email->send();
            } catch (\Exception $e) {
                $this->log($e);
                $this->log("Could not send the email: " . $e->getMessage());
            }
            $this->JSONResponse(ResponseCode::Ok, null, "inviato email a <{$form_auth['email']}> con richiesta di parere");
            return;
        } else {
            $this->JSONResponse(ResponseCode::Error, null, "Errore interno (database)");
            return;
        }
    }

    private function createFormEmail($form)
    {
        $email = new Email();

        // Find the address that need to be notified in Cc, if any
        $cc_addresses = array_map(
            function ($address) {
                return trim($address);
            },
            array_merge(
                explode(',', $this->getSetting('notified-emails')),
                explode(',', $form['form_template']['notify_emails']))
        );
        $cc_addresses = array_filter($cc_addresses, function ($address) {
            return trim($address) != "";
        });
        if (count($cc_addresses) > 0) {
            $email->addCc($cc_addresses);
        }

        $email->setViewVars([ 'settings' => $this->getSettings(), 'form' => $form ])
            ->setEmailFormat('html');

        return $email;
    }
}

?>