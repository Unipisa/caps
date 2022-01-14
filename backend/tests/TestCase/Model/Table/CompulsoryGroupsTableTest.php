<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\CompulsoryGroupsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\CompulsoryGroupsTable Test Case
 */
class CompulsoryGroupsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\CompulsoryGroupsTable
     */
    public $CompulsoryGroups;

    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = [
        'app.CompulsoryGroups',
        'app.Groups',
        'app.Curricula'
    ];

    /**
     * setUp method
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();
        $config = TableRegistry::getTableLocator()->exists('CompulsoryGroups') ? [] : ['className' => CompulsoryGroupsTable::class];
        $this->CompulsoryGroups = TableRegistry::getTableLocator()->get('CompulsoryGroups', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
    {
        unset($this->CompulsoryGroups);

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
