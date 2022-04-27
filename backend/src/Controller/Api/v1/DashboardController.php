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
    private function get_submission_counts($Table, $date_field, $months) {
        // we do this by separate queries because it appears to be
        // difficult to do in a database-independent way.
        $start = Time::now();
        $start->day(1); // Go the start of this month
        $start = $start->addMonth(-$months);
        $end = new Time($start);
        $end = $end->addMonth(1);
        $submission_counts = [];

        for ($i = 0; $i < $months; $i++) {
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
        $submitted_count = $this->Proposals->find()->where([ 'state' => 'submitted' ])->count();
        $months = 24;

        $conn = $this->Proposals->getConnection();
        $proposal_comments = $conn->execute(
            'SELECT proposals.id AS id, 
                    users.name AS user_name, 
                    users.id AS user_id,
                    req_date,
                    curricula.name AS curriculum_name 
                    FROM (SELECT proposals.id AS id, COUNT(attachments.id) AS att, COUNT(proposal_auths.id) AS req, 
                    MAX(proposal_auths.created) AS req_date,
                    MAX(attachments.created) AS att_date 
                    FROM proposals 
                    INNER JOIN proposal_auths ON proposals.id = proposal_auths.proposal_id
                    LEFT JOIN attachments ON proposals.id = attachments.proposal_id
                    GROUP BY proposals.id) proposals_counts
                    LEFT JOIN proposals ON proposals_counts.id = proposals.id
                    LEFT JOIN curricula ON proposals.curriculum_id = curricula.id
                    LEFT JOIN users ON proposals.user_id = users.id
                    WHERE (att = 0 OR att_date < req_date) AND state = \'submitted\'
                    ORDER BY req_date ASC'
        );


        $data = [
            'submitted_count' => $submitted_count,
            'proposal_comments' => $proposal_comments,
            'proposal_submission_counts' => $this->get_submission_counts($this->Proposals, 'submitted_date', $months),
            'proposal_approval_counts' => $this->get_submission_counts($this->Proposals, 'approved_date', $months),
            'form_submission_counts' => $this->get_submission_counts($this->Forms, 'date_submitted', $months),
            'form_approval_counts' => $this->get_submission_counts($this->Forms, 'date_managed', $months)
        ];
        $this->JSONResponse(ResponseCode::Ok, $data);
    }
}