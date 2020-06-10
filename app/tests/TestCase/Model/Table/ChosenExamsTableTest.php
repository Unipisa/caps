<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\ChosenExamsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\ChosenExamsTable Test Case
 */
class ChosenExamsTableTest extends \Cake\TestSuite\TestCase
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
    public $fixtures = ['app.ChosenExams', 'app.Exams', 'app.Proposals'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('ChosenExams') ? [] : ['className' => \App\Model\Table\ChosenExamsTable::class];
        $this->ChosenExams = \Cake\ORM\TableRegistry::getTableLocator()->get('ChosenExams', $config);
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
