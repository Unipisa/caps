<?php

namespace App\Controller\Api\v1;

use App\Controller\AppController;
use Cake\Http\Exception\BadRequestException;
use \Cake\View\JsonView;
use Cake\ORM\TableRegistry;

enum ResponseCode : int {
    case Ok = 200;
    case Forbidden = 403;
    case NotFound = 404;
    case MethodNotAllowed = 405;
    case Error = 500;
}

class RestController extends AppController {

    // A list of columns on which filtered queries are permitted. Override 
    // this in classes that inherit from RestController and then use 
    // RestController::applyFilters($query) to apply the filters automatically
    public $allowedFilters = [];

    // name of the corresponding database table
    protected $tableName = null;

    // name to be given to the "_type" attribute
    protected $typeName = null;

    // names of other tables to join with
    protected $associations = [];

    // list of fields included when returning a list of items
    protected $indexFields = ["id"];

    // list of fields included in single item
    protected $getFields = ["id"];

    protected function applyFilters($query) {
        foreach ($this->allowedFilters as $field) {
            $value = $this->request->getQuery($field);
            if ($value === null) continue;
            $value = json_decode($value);
            if ($value === null) continue; // bisognerebbe sollevare un BAD_REQUEST
            if ($value !== null) {
                $query = $query->where([ $field => $value ]);
            }
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

        $this->set('response', [
            'data' => $data, 
            'code' => $code->value, 
            'message' => $message
        ]);

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

        $this->JSONResponse(ResponseCode::Ok, [
            'settings' => $safe_settings, 
            'user' => $this->user
        ]);
    }

    protected function paginateQuery($query) {
        $limit = $this->request->getQuery('limit');
        $offset = $this->request->getQuery('offset');

        if ($limit !== null) {
            $query = $query->limit($limit);
        }

        if ($offset != null) {
            $query = $query->offset($offset);
        }

        return $query;
    }

    // keep only items the user can view
    // please override in derived classes
    protected function permissionFilter($query) {
        return $query;
    }

    protected function buildQuery() {
        $query = TableRegistry::getTableLocator()->get($this->tableName)
            ->find('all') 
            ->select(array_merge(["_type" => $this->typeName], $this->indexFields))
            ->contain($this->associations);

        $query = $this->applyFilters($query);

        $query = $this->permissionFilter($query);

        return $query;
    }

    public function index() {
        $query = $this->buildQuery();
        $query = $this->paginate($query);
        $this->JSONResponse(ResponseCode::Ok, $this->paginateQuery($query));
    }

    protected function getItem($id) {
        $item = TableRegistry::getTableLocator()->get($this->tableName)
            ->find('all')
            ->contain($this->associations)
            ->select(array_merge(["_type" => $this->typeName], $this->getFields))
            ->where([$this->tableName . ".id" => $id])
            ->first();
            // non riesco ad usare ->get($id) insieme a select

        return $item;
    }

    public function get($id) {
        $item = $this->getItem($id);

        if ($item === null) {
            $this->JSONResponse(ResponseCode::NotFound);
            return;
        }

        if (! $this->user->canView($item)) {
            $this->JSONResponse(ResponseCode::Forbidden);
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $item);
    }

    public function delete($id) {
        $item = TableRegistry::getTableLocator()->get($this->tableName)
            ->get($id);

        if (! $this->user->canDeleteForm($item)) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'The current user can not delete this item.');
            return;
        }

        try {
            $this->Forms->deleteOrFail($item);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::Error, null, 'Error while deleting the item');
            return;
        }

        $this->JSONResponse(ResponseCode::Ok);
    }
}

?>

