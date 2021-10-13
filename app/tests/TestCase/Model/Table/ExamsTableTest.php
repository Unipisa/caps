<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\ExamsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\ExamsTable Test Case
 */
class ExamsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\ExamsTable
     */
    public $Exams;

    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = [
        'app.Exams'
    ];

    /**
     * setUp method
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();
        $config = TableRegistry::getTableLocator()->exists('Exams') ? [] : ['className' => ExamsTable::class];
        $this->Exams = TableRegistry::getTableLocator()->get('Exams', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
    {
        unset($this->Exams);

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
}
