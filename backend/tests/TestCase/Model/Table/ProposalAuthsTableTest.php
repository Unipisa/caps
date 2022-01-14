<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\ProposalAuthsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\ProposalAuthsTable Test Case
 */
class ProposalAuthsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\ProposalAuthsTable
     */
    public $ProposalAuths;

    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = [
        'app.ProposalAuths',
        'app.Proposals',
        'app.Users',
    ];

    /**
     * setUp method
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();
        $config = TableRegistry::getTableLocator()->exists('ProposalAuths') ? [] : ['className' => ProposalAuthsTable::class];
        $this->ProposalAuths = TableRegistry::getTableLocator()->get('ProposalAuths', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
    {
        unset($this->ProposalAuths);

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
