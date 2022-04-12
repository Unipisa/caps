<?php

namespace App\Controller\Api\v1;

use App\Controller\AppController;
use Cake\Event\EventInterface;
use \Cake\Routing\Router;
use Cake\Http\Exception\BadRequestException;
use Cake\Http\Exception\InternalErrorException;

enum ResponseCode : int {
    case Ok = 200;
    case Forbidden = 403;
    case NotFound = 404;
    case MethodNotAllowed = 405;
    case Error = 500;
}

function array_get_default($key, $array, $default=null) {
    if (array_key_exists($key, $array)) {
        return $array[$key];
    }
    return $default;
}

class RestController extends AppController {

    // A list of columns on which filtered queries are permitted. Override 
    // this in classes that inherit from RestController and then use 
    // RestController::applyFilters($query) to apply the filters automatically
    public $allowedFilters = [];

    private $paginationData = [
        'offset' => 0,
        'limit' => null,
        'total' => null,
        'sort' => null,
        'direction' => null
    ];

    protected function applyFilters($query) {
        $limit = $this->request->getQuery('_limit');
        $offset = $this->request->getQuery('_offset');
        $sort = $this->request->getQuery('_sort');
        $direction = $this->request->getQuery('_direction');

        foreach($this->allowedFilters as $field => $opts) {
            if (is_array($opts)) {
                $type = array_get_default('type', $opts);
                $options = array_get_default('options', $opts);
                $dbfield = array_get_default('dbfield', $opts, $field);
                $modifier = array_get_default('modifier', $opts);
            } else {
                $type = $opts;
                $options = null;
                $dbfield = $field;
                $modifier = null;
            }

            if ($sort != null && $sort == $field) {
                if ($direction == 'desc') {
                    $d = 'desc';
                }
                else if ($direction == 'asc' || $direction == null) {
                    $d = 'asc';
                }
                else {
                    throw new BadRequestException('Invalid direction for sorting: ' . $direction);
                }
    
                $query = $query->order([ $dbfield => $d ]);
                $this->paginationData['sort'] = $sort;
                $this->paginationData['direction'] = $d;
            }
            
            // !!! PHP converts dots to underscores in query strings 
            $value = $this->request->getQuery(str_replace(".", "_", $field));
            if ($value === null) continue;

            if ($type === Boolean::class) {
                if ($value === "true") $value = True;
                else if ($value === "false") $value = False;
                else throw new BadRequestException("invalid value '" . $value . "' for boolean field '" . $field . "'");
            } else if ($type === Integer::class) {
                $value = intval($value);
            } else if ($type === String::class) {
                // pass
            } else {
                throw new InternalErrorException("internal error: '" . $field ."' has unknown type");
            }

            if ($options !== null && !in_array($value, $options)) {
                throw new BadRequestException("invalid value '" . $value . "' for field '" . $field . "'");
            }

            if ($modifier === 'LIKE') {
                $query = $query->where([$dbfield . " LIKE" => '%' . $value . '%']);
            } else if ($modifier === null) {
                $query = $query->where([ $dbfield => $value ]);
            } else {
                throw new InternalErrorException("internal error: '" . $field ."' has unknown modifier");
            }            
        }

        // FIXME: Are there any performance conerns with this?
        $this->paginationData['total'] = $query->count();

        if ($limit !== null) {
            $query = $query->limit($limit);
            $this->paginationData['limit'] = intval($limit);
        }

        if ($offset != null) {
            $query = $query->offset($offset);
            $this->paginationData['offset'] = intval($offset);
        }        

        return $query;
    }

    protected function JSONResponse(ResponseCode $code, mixed $data = null, string $message = null) : void {
        $this->viewBuilder()->setOption('serialize', 'response');
        $this->viewBuilder()->setClassName('\Cake\View\JsonView');

        if ($message == null) {
            switch ($code) {
                case ResponseCode::Ok:
                    $message = "OK";
                    break;
                case ResponseCode::Forbidden:
                    $message = "Forbidden";
                    break;
                case ResponseCode::NotFound:
                    $message = "Not Found";
                    break;
                case ResponseCode::MethodNotAllowed:
                    $message = "Method not allowed";
                    break;
                case ResponseCode::Error:
                    $message = "Internal server error";
                    break;
            }
        }

        $response = [
            'data' => $data, 
            'code' => $code->value, 
            'message' => $message,
            'pagination' => $this->paginationData
        ];

        $this->set('response', $response);
        $this->response = $this->response->withStatus($code->value);
    }

    function status() {
        /* We only expose the settings that are safe to view from the client-side */
        $settings = $this->getSettings();
        $safe_settings = [ 
            'user-instructions' => $settings['user-instructions'], 
            'cds' => $settings['cds'], 
            'disclaimer' => $settings['disclaimer'],
            'department' => $settings['department'], 
            'approval-signature-text' => $settings['approval-signature-text']
        ];

        // clean unwanted information
        unset($this->user['password']);
            
        $this->JSONResponse(ResponseCode::Ok, [
            'settings' => $safe_settings, 
            'user' => $this->user,
            'form_templates_enabled' => $this->form_templates_enabled
        ]);
    }

    protected function paginateQuery($query) {
        return $query;
    }

}

?>

