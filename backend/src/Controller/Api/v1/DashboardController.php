<?php

namespace App\Controller\Api\v1;

use App\Controller\Api\v1\RestController;
use Cake\ORM\TableRegistry;
use Cake\I18n\Time;
use Cake\Database\Expression\QueryExpression;

class DashboardController extends RestController
{
    public function initialize(): void
    {
        parent::initialize();
        $this->Proposals = TableRegistry::getTableLocator()->get('proposals');
        $this->Forms = TableRegistry::getTableLocator()->get('forms');
    }

   /** 
     * Get the number of submissions groups per month, in the last 12 months, 
     * including the current one. 
     */
    private function get_submission_counts($Table, $date_field) {
        // we do this by separate queries because it appears to be
        // difficult to do in a database-independent way.
        $start = Time::now();
        $start->day(1); // Go the start of this month
        $start = $start->addMonth(-12);
        $end = new Time($start);
        $end = $end->addMonth(1);
        $submission_counts = [];

        for ($i = 0; $i < 12; $i++) {
            $start = $start->addMonth(1);
            $end   = $end->addMonth(1);

            $submission_counts[$i] = $Table->find()->where(
                function (QueryExpression $exp) use ($start, $end, $date_field) {
                    return $exp->lt($date_field, $end)
                        ->gte($date_field, $start);
                }
            )->count();
        }

        return $submission_counts;
    }

    /**
     * Some data in the dashboard is loaded asynchronously through JS. 
     * 
     * This function provides an interface for that data.
     */
    /*
     public function dashboardData() {
        $submission_counts = $this->get_submission_counts('submitted_date');
        $approval_counts = $this->get_submission_counts('approved_date');

        $this->set(compact('submission_counts', 'approval_counts'));
        $this->viewBuilder()->setOption('serialize', [
            'submission_counts', 'approval_counts'
        ]);
    }
    */

    function index() {
        $data = [
            'proposal_submission_counts' => $this->get_submission_counts($this->Proposals, 'submitted_date'),
            'proposal_approval_counts' => $this->get_submission_counts($this->Proposals, 'approved_date'),
            'form_submission_counts' => $this->get_submission_counts($this->Forms, 'date_submitted'),
            'form_approval_counts' => $this->get_submission_counts($this->Forms, 'date_managed')
        ];
        $this->JSONResponse(ResponseCode::Ok, $data);
    }
}