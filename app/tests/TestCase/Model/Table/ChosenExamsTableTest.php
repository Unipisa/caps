<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\ChosenExamsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\ChosenExamsTable Test Case
 */
class ChosenExamsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\ChosenExamsTable
     */
    public $ChosenExams;

    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = [
        'app.ChosenExams',
        'app.Exams',
        'app.Proposals'
    ];

    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = TableRegistry::getTableLocator()->exists('ChosenExams') ? [] : ['className' => ChosenExamsTable::class];
        $this->ChosenExams = TableRegistry::getTableLocator()->get('ChosenExams', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
    {
        unset($this->ChosenExams);

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
