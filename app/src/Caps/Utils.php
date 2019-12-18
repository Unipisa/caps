<?php

namespace App\Caps;

class Utils {

    /*
     * Transform an error returned by a failed insertion and/or update in the
     * database into a string that can be displayed to the user.
     */
     public static function error_to_string($errs) {
         $error_msg = "";
         foreach ($errs as $field) {
             foreach ($field as $err) {
                  $error_msg = $error_msg . $err . "\n";
             }
         }

         return $error_msg;
  }

}

?>
