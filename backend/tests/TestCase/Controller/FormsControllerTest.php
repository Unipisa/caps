<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller;

use Cake\ORM\TableRegistry;
use PhpOffice\PhpSpreadsheet\IOFactory;

class FormsControllerTest extends MyIntegrationTestCase
{
    public array $fixtures = [
        'app.Degrees',
        'app.Users',
        'app.Forms',
        'app.FormTemplates',
        'app.Settings',
    ];

    public function testJsonExportUsesConfiguredFields(): void
    {
        $this->adminSession();
        $this->get('/forms/index.json');

        $this->assertResponseOk();
        $data = json_decode((string)$this->_response->getBody(), true);
        $this->assertNotEmpty($data);
        $this->assertArrayHasKey('data', $data[0]);
        $this->assertArrayHasKey('user', $data[0]);
        $this->assertArrayHasKey('form_template', $data[0]);
        $this->assertArrayNotHasKey('password', $data[0]['user']);
        $this->assertArrayNotHasKey('text', $data[0]['form_template']);
        $this->assertArrayNotHasKey('code', $data[0]['form_template']);
    }

    public function testCsvExportExpandsConfiguredJsonFieldsAcrossRows(): void
    {
        $this->createFormsWithDifferentJsonKeys();
        $this->adminSession();
        $this->get('/forms/index.csv');

        $this->assertResponseOk();
        $rows = $this->readCsv((string)$this->_response->getBody());
        $this->assertExpandedJsonRows($rows);
    }

    public function testXlsxExportExpandsConfiguredJsonFieldsAcrossRows(): void
    {
        $this->createFormsWithDifferentJsonKeys();
        $this->adminSession();
        $this->get('/forms/index.xlsx');

        $this->assertResponseOk();
        $filename = tempnam(sys_get_temp_dir(), 'caps-xlsx-');
        $this->assertNotFalse($filename);
        file_put_contents($filename, (string)$this->_response->getBody());

        try {
            $rows = IOFactory::load($filename)->getActiveSheet()->toArray();
        } finally {
            unlink($filename);
        }

        $this->assertExpandedJsonRows($rows);
    }

    private function createFormsWithDifferentJsonKeys(): void
    {
        $forms = TableRegistry::getTableLocator()->get('Forms');
        $forms->removeBehavior('Timestamp');
        $first = $forms->get(1);
        $first->data = '{"A":1,"B":{"nested":2}}';
        $forms->saveOrFail($first);

        $second = $forms->newEntity([
            'form_template_id' => 1,
            'user_id' => 1,
            'state' => 'draft',
            'template_text' => 'Template',
            'data' => '{"A":4,"C":3}',
        ]);
        $forms->saveOrFail($second);
    }

    /**
     * @return list<list<string|null>>
     */
    private function readCsv(string $contents): array
    {
        $stream = fopen('php://memory', 'r+');
        fwrite($stream, $contents);
        rewind($stream);

        $rows = [];
        while (($row = fgetcsv($stream, null, ',', '"', '')) !== false) {
            $rows[] = $row;
        }
        fclose($stream);

        return $rows;
    }

    private function assertExpandedJsonRows(array $rows): void
    {
        $headers = array_shift($rows);
        $this->assertContains('data.A', $headers);
        $this->assertContains('data.B', $headers);
        $this->assertContains('data.C', $headers);
        $this->assertNotContains('data.B.nested', $headers);
        $this->assertNotContains('data_A', $headers);

        $idColumn = array_search('id', $headers, true);
        $aColumn = array_search('data.A', $headers, true);
        $bColumn = array_search('data.B', $headers, true);
        $cColumn = array_search('data.C', $headers, true);
        $rowsById = [];
        foreach ($rows as $row) {
            $rowsById[(string)$row[$idColumn]] = $row;
        }

        $this->assertEquals(1, $rowsById['1'][$aColumn]);
        $this->assertSame('{"nested":2}', $rowsById['1'][$bColumn]);
        $this->assertEmpty($rowsById['1'][$cColumn]);
        $this->assertEquals(4, $rowsById['2'][$aColumn]);
        $this->assertEmpty($rowsById['2'][$bColumn]);
        $this->assertEquals(3, $rowsById['2'][$cColumn]);
    }
}
