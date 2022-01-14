<?php
declare(strict_types=1);

namespace App\Test\TestCase\Model\Table;

use App\Model\Table\FormsTable;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\FormsTable Test Case
 */
class FormsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\FormsTable
     */
    protected $Forms;

    /**
     * Fixtures
     *
     * @var array
     */
    protected $fixtures = [
        'app.Forms',
        'app.FormTemplates',
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
        $config = $this->getTableLocator()->exists('Forms') ? [] : ['className' => FormsTable::class];
        $this->Forms = $this->getTableLocator()->get('Forms', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
    {
        unset($this->Forms);

        parent::tearDown();
    }

    /**
     * Test validationDefault method
     *
     * @return void
     * @uses \App\Model\Table\FormsTable::validationDefault()
     */
    public function testValidationDefault(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }

    /**
     * Test buildRules method
     *
     * @return void
     * @uses \App\Model\Table\FormsTable::buildRules()
     */
    public function testBuildRules(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }
}
