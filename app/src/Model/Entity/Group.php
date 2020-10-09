<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Group Entity
 *
 * @property int $id
 * @property string|null $name
 *
 * @property \App\Model\Entity\ExamsGroup[] $exams_groups
 * @property \App\Model\Entity\Exam[] $exams
 */
class Group extends Entity
{
    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array
     */
    protected $_accessible = [
        'name' => true,
        'exams' => true
    ];

    public function shortExamList($max_exams=5, $max_characters=120) {
        $s = implode(', ',
            array_map(function($exam) {
                return $exam->name;          
            },array_splice($this->exams,0 , $max_exams)));
        if (count($this->exams)> $max_exams) {
            $s .= ",\u{2026}"; // add ellipsis
        }
        if (strlen($s)>$max_characters) {
            // truncate and add ellipsis
            $s = substr($s, 0, $max_characters-1) . "\u{2026}";
        }
        return $s;
    }
};