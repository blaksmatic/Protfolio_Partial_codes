<?php

/**
 * Created by PhpStorm.
 * User: admin
 * Date: 3/8/16
 * Time: 10:47 PM
 */

/**
 * Class log_entry
 * This class is an entry for a log. A log has a date, a message and a revision_number number
 * It will be appended to assignment, so that one assignment can have multiple log entry.
 */
class log_entry
{
    public $date; //the date
    public $revision_number; //the revision_number number
    public $message; //the message

    public function __construct($message, $date, $revision)
    {
        $this->revision_number = $revision;
        $this->date = $date;
        $this->message = $message;
    }

}
