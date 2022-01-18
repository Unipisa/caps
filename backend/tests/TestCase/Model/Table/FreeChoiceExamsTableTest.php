<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\FreeChoiceExamsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\FreeChoiceExamsTable Test Case
 */
class FreeChoiceExamsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\FreeChoiceExamsTable
     */
    public $FreeChoiceExams;

    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = [
        'app.FreeChoiceExams',
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
        $config = TableRegistry::getTableLocator()->exists('FreeChoiceExams') ? [] : ['className' => FreeChoiceExamsTable::class];
        $this->FreeChoiceExams = TableRegistry::getTableLocator()->get('FreeChoiceExams', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
    {
        unset($this->FreeChoiceExams);

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
