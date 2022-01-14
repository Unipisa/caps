<?php
declare(strict_types=1);

namespace App\Test\TestCase\Model\Table;

use App\Model\Table\FormTemplatesTable;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\FormTemplatesTable Test Case
 */
class FormTemplatesTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\FormTemplatesTable
     */
    protected $FormTemplates;

    /**
     * Fixtures
     *
     * @var array
     */
    protected $fixtures = [
        'app.FormTemplates'
    ];

    /**
     * setUp method
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();
        $config = $this->getTableLocator()->exists('FormTemplates') ? [] : ['className' => FormTemplatesTable::class];
        $this->FormTemplates = $this->getTableLocator()->get('FormTemplates', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
    {
        unset($this->FormTemplates);

        parent::tearDown();
    }

    /**
     * Test validationDefault method
     *
     * @return void
     * @uses \App\Model\Table\FormTemplatesTable::validationDefault()
     */
    public function testValidationDefault(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }
}
