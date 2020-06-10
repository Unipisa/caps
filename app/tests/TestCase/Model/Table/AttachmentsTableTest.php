<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\AttachmentsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\AttachmentsTable Test Case
 */
class AttachmentsTableTest extends \Cake\TestSuite\TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\AttachmentsTable
     */
    public $Attachment;
    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = ['app.Attachment', 'app.Users', 'app.Proposals'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('Attachment') ? [] : ['className' => \App\Model\Table\AttachmentsTable::class];
        $this->Attachment = \Cake\ORM\TableRegistry::getTableLocator()->get('Attachment', $config);
    }
    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
    {
        unset($this->Attachment);
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
