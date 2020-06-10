<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\ExamsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\ExamsTable Test Case
 */
class ExamsTableTest extends \Cake\TestSuite\TestCase
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
    public $fixtures = ['app.Exams'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('Exams') ? [] : ['className' => \App\Model\Table\ExamsTable::class];
        $this->Exams = \Cake\ORM\TableRegistry::getTableLocator()->get('Exams', $config);
    }
    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
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
