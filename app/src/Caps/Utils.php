<?php

namespace App\Caps;

class Utils {

    /*
     * Transform an error returned by a failed insertion and/or update in the
     * database into a string that can be displayed to the user.
     */
     public static function error_to_string($errs) {
         $error_msg = "";

         foreach ($errs as $table) {
             foreach ($table as $field) {
                 foreach ($field as $err) {
                     foreach ($err as $msg) {
                         $error_msg = $error_msg . $msg . "\n";
                     }
                 }
             }
         }

         return $error_msg;
  }

}

?>
