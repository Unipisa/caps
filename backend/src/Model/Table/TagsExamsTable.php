<?php
declare(strict_types=1);

namespace App\Model\Table;

use Cake\ORM\Table;

/**
 * Junction table for tags and exams.
 */
class TagsExamsTable extends Table
{
    /**
     * @inheritDoc
     */
    public function initialize(array $config): void
    {
        parent::initialize($config);

        $this->setTable('tags_exams');
        $this->setPrimaryKey('id');
        $this->belongsTo('Tags', ['foreignKey' => 'tag_id']);
        $this->belongsTo('Exams', ['foreignKey' => 'exam_id']);
    }
}
