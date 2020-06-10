<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\TagsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\TagsTable Test Case
 */
class TagsTableTest extends \Cake\TestSuite\TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\TagsTable
     */
    public $Tags;
    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = ['app.Tags', 'app.Exams'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('Tags') ? [] : ['className' => \App\Model\Table\TagsTable::class];
        $this->Tags = \Cake\ORM\TableRegistry::getTableLocator()->get('Tags', $config);
    }
    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
    {
        unset($this->Tags);
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
