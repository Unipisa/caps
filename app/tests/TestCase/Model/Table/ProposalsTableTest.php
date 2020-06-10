<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\ProposalsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\ProposalsTable Test Case
 */
class ProposalsTableTest extends \Cake\TestSuite\TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\ProposalsTable
     */
    public $Proposals;
    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = ['app.Proposals', 'app.Users'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('Proposals') ? [] : ['className' => \App\Model\Table\ProposalsTable::class];
        $this->Proposals = \Cake\ORM\TableRegistry::getTableLocator()->get('Proposals', $config);
    }
    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
    {
        unset($this->Proposals);
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
