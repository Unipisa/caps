<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\SettingsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;
/**
 * App\Model\Table\SettingsTable Test Case
 */
class SettingsTableTest extends \Cake\TestSuite\TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\SettingsTable
     */
    public $Settings;
    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = ['app.Settings'];
    /**
     * setUp method
     *
     * @return void
     */
    public function setUp()
    {
        parent::setUp();
        $config = \Cake\ORM\TableRegistry::getTableLocator()->exists('Settings') ? [] : ['className' => \App\Model\Table\SettingsTable::class];
        $this->Settings = \Cake\ORM\TableRegistry::getTableLocator()->get('Settings', $config);
    }
    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown()
    {
        unset($this->Settings);
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
