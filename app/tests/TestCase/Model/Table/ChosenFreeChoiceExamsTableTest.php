<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\ChosenFreeChoiceExamsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\ChosenFreeChoiceExamsTable Test Case
 */
class ChosenFreeChoiceExamsTableTest extends \Cake\TestSuite\TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\ChosenFreeChoiceExamsTable
     */
    public $ChosenFreeChoiceExams;
    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = ['app.ChosenFreeChoiceExams', 'app.Proposals'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('ChosenFreeChoiceExams') ? [] : ['className' => \App\Model\Table\ChosenFreeChoiceExamsTable::class];
        $this->ChosenFreeChoiceExams = \Cake\ORM\TableRegistry::getTableLocator()->get('ChosenFreeChoiceExams', $config);
    }
    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
    {
        unset($this->ChosenFreeChoiceExams);
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
