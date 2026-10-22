<?php
declare(strict_types=1);
namespace App\Test\TestCase\Controller\Api\v1;

use App\Test\TestCase\Controller\MyIntegrationTestCase;
use Cake\I18n\DateTime;
use Laminas\Diactoros\UploadedFile;
use PHPUnit\Framework\Attributes\DataProvider;

class ThesisDefenseAttachmentsControllerTest extends MyIntegrationTestCase
{
    public array $fixtures = ['app.DegreeSessions', 'app.ThesisDefenses', 'app.ThesisDefenseAttachments', 'app.Users', 'app.Settings'];

    private function defense(string $state = 'submitted')
    {
        $sessions = $this->getTableLocator()->get('DegreeSessions');
        $session = $sessions->newEntity(['type' => 'master', 'name' => 'Sessione', 'start_date' => '2027-01-01']);
        $sessions->saveOrFail($session);
        $defenses = $this->getTableLocator()->get('ThesisDefenses');
        return $defenses->saveOrFail($defenses->newEntity([
            'degree_session_id' => $session->id, 'user_id' => 1, 'title' => 'Tesi',
            'enrollment_year' => 2020, 'state' => $state, 'submitted_at' => DateTime::now(),
        ]));
    }

    private function upload(int $error = UPLOAD_ERR_OK): UploadedFile
    {
        $stream = fopen('php://memory', 'r+');
        fwrite($stream, 'Test attachment');
        rewind($stream);
        return new UploadedFile($stream, 15, $error, 'thesis.txt', 'text/plain');
    }

    public static function states(): array
    {
        return [['submitted'], ['approved'], ['rejected']];
    }

    #[DataProvider('states')]
    public function testOwnerCanUploadAfterSubmissionAndDownload(string $state): void
    {
        $defense = $this->defense($state);
        $this->studentSession();
        $this->enableCsrfToken();
        $this->configRequest(['files' => ['file' => [$this->upload(), $this->upload()]]]);
        $this->post('/api/v1/thesis_defense_attachments/' . $defense->id);
        $this->assertResponseOk();
        $data = json_decode((string)$this->_response->getBody(), true)['data'];
        $this->assertCount(2, $data);
        $this->assertArrayNotHasKey('data', $data[0]);
        $this->get('/api/v1/thesis_defense_attachments/' . $data[0]['id'] . '/download');
        $this->assertResponseOk();
        $this->assertSame('Test attachment', (string)$this->_response->getBody());
    }

    public function testAnotherStudentCannotUpload(): void
    {
        $defense = $this->defense();
        $this->studentSession(3);
        $this->enableCsrfToken();
        $this->configRequest(['files' => ['file' => [$this->upload()]]]);
        $this->post('/api/v1/thesis_defense_attachments/' . $defense->id);
        $this->assertResponseCode(403);
        $this->assertSame(0, $this->getTableLocator()->get('ThesisDefenseAttachments')->find()->count());
    }

    public function testFailedBatchDoesNotLeavePartialUploads(): void
    {
        $defense = $this->defense();
        $this->studentSession();
        $this->enableCsrfToken();
        $this->configRequest(['files' => ['file' => [$this->upload(), $this->upload(UPLOAD_ERR_PARTIAL)]]]);
        $this->post('/api/v1/thesis_defense_attachments/' . $defense->id);
        $this->assertResponseCode(500);
        $this->assertSame(0, $this->getTableLocator()->get('ThesisDefenseAttachments')->find()->count());
    }
}
