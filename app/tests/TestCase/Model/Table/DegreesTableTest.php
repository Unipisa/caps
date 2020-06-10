<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\DegreesTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\DegreesTable Test Case
 */
class DegreesTableTest extends \Cake\TestSuite\TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\DegreesTable
     */
    public $Degrees;
    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = ['app.Degrees', 'app.Curricula'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('Degrees') ? [] : ['className' => \App\Model\Table\DegreesTable::class];
        $this->Degrees = \Cake\ORM\TableRegistry::getTableLocator()->get('Degrees', $config);
    }
    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
    {
        unset($this->Degrees);
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
