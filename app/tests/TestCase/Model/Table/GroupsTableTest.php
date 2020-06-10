<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\GroupsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\GroupTable Test Case
 */
class GroupsTableTest extends \Cake\TestSuite\TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\GroupsTable
     */
    public $Groups;
    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = ['app.Groups', 'app.Exams'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('Groups') ? [] : ['className' => \App\Model\Table\GroupsTable::class];
        $this->Groups = \Cake\ORM\TableRegistry::getTableLocator()->get('Groups', $config);
    }
    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
    {
        unset($this->Groups);
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
