<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\AttachmentsTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\AttachmentsTable Test Case
 */
class AttachmentsTableTest extends TestCase
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
    public array $fixtures = [
        'app.Attachments',
        'app.Users',
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
        $config = TableRegistry::getTableLocator()->exists('Attachment') ? [] : ['className' => AttachmentsTable::class];
        $this->Attachment = TableRegistry::getTableLocator()->get('Attachment', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
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

    public function testAllFinderExcludesData(): void
    {
        $attachment = $this->Attachment->find()->firstOrFail();

        $this->assertFalse($attachment->has('data'));
    }

    public function testWithDataFinderIncludesData(): void
    {
        $attachment = $this->Attachment->find('withData')->firstOrFail();

        $this->assertTrue($attachment->has('data'));
    }

    public function testProposalsContainAttachmentsExcludesData(): void
    {
        $proposal = $this->Attachment->Proposals->get(
            1,
            contain: ['Attachments.Users', 'Attachments.Proposals'],
        );

        $this->assertCount(1, $proposal->attachments);
        $this->assertFalse($proposal->attachments[0]->has('data'));
        $this->assertSame(1, $proposal->attachments[0]->user->id);
        $this->assertSame(1, $proposal->attachments[0]->proposal->id);
    }
}
