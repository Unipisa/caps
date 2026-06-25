<?php
namespace App\Test\TestCase\Model\Table;

use App\Model\Table\DegreesTable;
use Cake\ORM\TableRegistry;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\DegreesTable Test Case
 */
class DegreesTableTest extends TestCase
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
    public $fixtures = [
        'app.Degrees',
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
        $config = TableRegistry::getTableLocator()->exists('Degrees') ? [] : ['className' => DegreesTable::class];
        $this->Degrees = TableRegistry::getTableLocator()->get('Degrees', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    public function tearDown(): void
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
        $this->assertSame('title', $this->Degrees->getDisplayField());
    }

    public function testFindListFormatsDegreeTitle()
    {
        $degrees = $this->Degrees->find('list')->toArray();

        $this->assertSame(
            'Lorem ipsum dolor sit amet, aliquet feugiat. Convallis morbi fringilla gravida, phasellus feugiat dapibus velit nunc, pulvinar eget sollicitudin venenatis cum nullam, vivamus ut a sed, mollitia lectus. Nulla vestibulum massa neque ut et, id hendrerit sit, feugiat in taciti enim proin nibh, tempor dignissim, rhoncus duis vestibulum nunc mattis convallis. (2020/2021)',
            $degrees[1]
        );
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
