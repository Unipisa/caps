<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\DocumentsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\DocumentsTable Test Case
 */
class DocumentsTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\DocumentsTable
     */
    public $Documents;

    /**
     * Fixtures
     *
     * @var array
     */
    public array $fixtures = [
        'app.Documents',
        'app.Users'
    ];

    /**
     * setUp method
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();
        $config = TableRegistry::getTableLocator()->exists('Documents') ? [] : ['className' => DocumentsTable::class];
        $this->Documents = TableRegistry::getTableLocator()->get('Documents', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
    {
        unset($this->Documents);

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

    public function testAllFinderExcludesData(): void
    {
        $document = $this->Documents->find()->firstOrFail();

        $this->assertFalse($document->has('data'));
    }

    public function testWithDataFinderIncludesData(): void
    {
        $document = $this->Documents->find('withData')->firstOrFail();

        $this->assertTrue($document->has('data'));
    }

    public function testUsersContainDocumentsExcludesData(): void
    {
        $user = $this->Documents->Users->get(
            1,
            contain: ['Documents.Users', 'Documents.Owners'],
        );

        $this->assertCount(1, $user->documents);
        $this->assertFalse($user->documents[0]->has('data'));
        $this->assertSame(1, $user->documents[0]->user->id);
        $this->assertSame(1, $user->documents[0]->owner->id);
    }
}
