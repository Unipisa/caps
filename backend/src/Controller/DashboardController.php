<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */

namespace App\Controller;

use App\Caps\Utils;
use App\Form\ProposalsFilterForm;
use App\Model\Entity\Proposal;
use App\Model\Entity\ProposalAuth;
use Cake\Core\Configure;
use Cake\Log\Log;
use Cake\Database\Expression\QueryExpression;
use Cake\Http\Exception\NotFoundException;
use Cake\Http\Exception\ForbiddenException;
use Cake\Mailer\Email;
use Cake\I18n\Time;
use Cake\Utility\Security;
use Cake\Validation\Validation;
use Cake\ORM\TableRegistry;
use Dompdf\Dompdf;
use DateTime;

class DashboardController extends AppController
{
    public function index()
    {
        $Proposals = TableRegistry::getTableLocator()->get('proposals');
        // We need to find a few stats about proposals
        $submitted_count = $Proposals->find()->where([ 'state' => 'submitted' ])->count();

        // Raw SQL query, as this appear to be quite hard to be done using
        // Cake's ORM Query & co. This query selects all the proposals where there is
        // at least one request, and either no attachments, or the most recent attachment
        // is older than the most recent request.
        $conn = $Proposals->getConnection();
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

        $this->set(compact('submitted_count', 'proposal_comments'));
    }

}
