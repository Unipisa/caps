<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\CurriculaTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\CurriculaTable Test Case
 */
class CurriculaTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\CurriculaTable
     */
    public $Curricula;

    /**
     * Fixtures
     *
     * @var array
     */
    public $fixtures = [
        'app.Curricula',
        'app.Proposals'
    ];

    /**
     * setUp method
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();
        $config = TableRegistry::getTableLocator()->exists('Curricula') ? [] : ['className' => CurriculaTable::class];
        $this->Curricula = TableRegistry::getTableLocator()->get('Curricula', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
    {
        unset($this->Curricula);

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
