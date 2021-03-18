<?php

namespace App\View\Helper;
use Cake\Core\Configure;
use Cake\View\Helper;


class CapsHelper extends Helper {

    /**
     * Return an appropriate bootstrap color based on the proposal state. 
     * In particular, green if accepted, yellow for submission, red for 
     * rejected, gray otherwise. 
     */
    public function proposalColor($proposal) {
        switch ($proposal['state']) {
            case 'approved':
                return "success";
                break;
            case 'submitted':
                return "warning";
                break;
            case 'rejected':
                return "danger";
                break;
            default:
                return 'secondary';
                break;
        }
    }

    public function badge($proposal, $class = "") {
        $statusclass = $this->proposalColor($proposal);

        switch ($proposal['state']) {
            case 'draft':
                $status = 'Bozza';
                break;
            case 'submitted':
                $status = 'Sottomesso';
                break;
            case 'approved':
                $status = "Approvato";
                break;
            case 'rejected':
                $status = 'Rigettato';
                break;
            default:
                $status = $proposal['state'];
                break;
        }

        $cl = "badge" . " " . $class;
        return "<span class=\"$cl badge-$statusclass\">$status</span>";
    }

    public function proposalMessage($proposal) {
        switch ($proposal['state']) {
            case 'approved':
                return $proposal['curriculum']['degree']['approval_message'];
                break;
            case 'submitted':
                return $proposal['curriculum']['degree']['submission_message'];
                break;
            case 'rejected':
                return $proposal['curriculum']['degree']['rejection_message'];
                break;
            default:
                return "";
                break;
        }
    }

    // Format a date according the standard in Caps; if the data is null, just 
    // return the alternative string provided. 
    public function formatDate($d, $fallback = "nessuna data") {
      $Caps = Configure::read('Caps');

      if ($d != null)
        return $d->setTimezone($Caps['timezone'])->i18nformat('dd/MM/yyyy, HH:mm');
      else
        return $fallback;
    }

}

?>