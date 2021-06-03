<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\CompulsoryExamsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\CompulsoryExamsTable Test Case
 */
class CompulsoryExamsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\CompulsoryExamsTable
     */
    public $CompulsoryExams;

    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = [
        'app.CompulsoryExams',
        'app.Exams',
        'app.Curricula'
    ];

    /**
     * setUp method
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();
        $config = TableRegistry::getTableLocator()->exists('CompulsoryExams') ? [] : ['className' => CompulsoryExamsTable::class];
        $this->CompulsoryExams = TableRegistry::getTableLocator()->get('CompulsoryExams', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
    {
        unset($this->CompulsoryExams);

        parent::tearDown();
    }

    /**
     * Test initialize method
     *
     * @return void
     */
    public function testInitialize()
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test validationDefault method
     *
     * @return void
     */
    public function testValidationDefault()
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test buildRules method
     *
     * @return void
     */
    public function testBuildRules()
    {
        $this->markTestIncomplete('Not implemented yet.');
    }
}
