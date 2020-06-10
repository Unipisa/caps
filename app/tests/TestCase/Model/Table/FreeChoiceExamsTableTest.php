<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\FreeChoiceExamsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\FreeChoiceExamsTable Test Case
 */
class FreeChoiceExamsTableTest extends \Cake\TestSuite\TestCase
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
    public $fixtures = ['app.FreeChoiceExams', 'app.Curricula'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('FreeChoiceExams') ? [] : ['className' => \App\Model\Table\FreeChoiceExamsTable::class];
        $this->FreeChoiceExams = \Cake\ORM\TableRegistry::getTableLocator()->get('FreeChoiceExams', $config);
    }
    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
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
