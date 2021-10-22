<?php

namespace App\View\Helper;
use Cake\Cache\Cache;
use Cake\Core\Configure;
use Cake\View\Helper;


class CapsHelper extends Helper {

    public function jsName() {
        return $this->computeAssetVersioning();
    }

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
        // $proposal can also be a Form instance (not only Proposal)
        $statusclass = $this->proposalColor($proposal);
        $status = [
            'draft' => 'Bozza',
            'submitted' => 'Inviato',
            'approved' => 'Approvato',
            'rejected' => 'Rifiutato'
        ][$proposal['state']];

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

        /**
     * Compute an MD5 sum of the static assets (JS and CSS) files that
     * will be served with the applications.
     *
     * Since these change frequently in production, we server them with
     * a short query string that forces a cache refresh when an update
     * is pushed.
     *
     * The information is cached, so this is only computed at the first
     * call to this function, or after the cache has been manually cleared.
     *
     * @return void
     */
    private function computeAssetVersioning()
    {
        $js_name = Cache::read('js_name');
        $js_time = Cache::read('js_time');

        $prefix = Configure::read('debug') ? "caps.js" : "caps.min.js";

        $ver_file = WWW_ROOT . DS . "js" . DS . $prefix . ".version";
        $ver_time = stat($ver_file)["mtime"];

        if ($js_name == false || $ver_time > $js_time) {
            $js_name = file_get_contents($ver_file);
            Cache::write('js_name', $js_name);
            Cache::write('js_time', $ver_time);
        }

        return $js_name;
    }

}

?>