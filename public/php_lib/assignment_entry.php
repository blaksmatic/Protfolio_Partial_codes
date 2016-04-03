<?php

/**
 * Created by PhpStorm.
 * User: admin
 * Date: 3/8/16
 * Time: 10:43 PM
 */

/**
 * Class assignment_entry
 * This class is for an assignment. An assignment has a name, a kind, its last revision_number number,
 * its last editing date, and its history recoreds.
 */
class assignment_entry
{
    public $name;
    public $genre;
    public $kind;
    public $last_revision;
    public $size;
    public $last_date;
    public $id;
    public $path;
    public $history_records; //The history recores is a list of log that contains all the log info, such as messages.
    public $comments;

    public function __construct($name, $kind, $lastrev, $lastdate, $size, $id)
    {
        $this->name = $name;
        $this->kind = $kind;
        $this->size = (int)$size;
        $this->last_revision = (int)$lastrev;
        $this->last_date = $lastdate;
        $this->history_records = array();
        $this->id = (int)$id;
        $this->path = 'subversion.ews.illinois.edu/svn/sp16-cs242/yzeng19/' . $name;
        $this->genre = array();
        $this->comments = array();
    }

    /**
     * This function adds a new records.
     * @param $new_entry
     * @param $revision
     */
    public function add_log_entry($new_entry, $revision)
    {
        $this->history_records[] = $new_entry;
    }

    public function add_genre($new_genre)
    {
        $this->genre[] = $new_genre;
    }

}


?>