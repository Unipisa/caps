<?php
namespace App\Controller\Api\v1;

use Cake\Datasource\ConnectionManager;

class ThesisDefenseAttachmentsController extends RestController
{
    /**
     * Download a thesis defense attachment.
     * GET /api/v1/thesis-defense-attachments/{id}/download
     */
    public function download($id)
    {
        try {
            $attachment = $this->ThesisDefenseAttachments->get($id, [
                'contain' => ['ThesisDefenses'],
            ]);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound, null, 'Attachment not found');
            return;
        }

        $defense = $attachment->thesis_defense;

        // Check permissions
        if (!$this->user) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Authentication required');
            return;
        }

        if (!$this->user['admin'] && $defense->user_id !== $this->user['id']) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Access not allowed to this attachment');
            return;
        }

        // Return the file content as a response
        $this->response = $this->response
            ->withType($attachment->mimetype)
            ->withDownload($attachment->filename)
            ->withStringBody(stream_get_contents($attachment->data));
        $this->viewBuilder()->setOption('serialize', false);
    }

    /**
     * Create an attachment for a thesis defense.
     * POST /api/v1/thesis-defense-attachments/{thesisDefenseId}
     */
    public function post($thesisDefenseId)
    {
        if (!$this->user) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Authentication required');
            return;
        }

        try {
            $defense = $this->ThesisDefenseAttachments->ThesisDefenses->get($thesisDefenseId, [
                'contain' => ['Users'],
            ]);
        } catch (\Exception $e) {
            $this->JSONResponse(ResponseCode::NotFound, null, 'ThesisDefense not found');
            return;
        }

        // Only the owner or admin can add attachments
        if (!$this->user['admin'] && $defense->user_id !== $this->user['id']) {
            $this->JSONResponse(ResponseCode::Forbidden, null, 'Access not allowed');
            return;
        }

        // Handle file upload from the request
        $files = $this->request->getFile('file');
        if (!$files || (is_array($files) && count($files) === 0)) {
            $this->JSONResponse(ResponseCode::BadRequest, null, 'No file uploaded');
            return;
        }

        if (!is_array($files)) {
            $files = [$files];
        }

        $createdAttachments = [];

        try {
            ConnectionManager::get('default')->transactional(function () use ($defense, $files, &$createdAttachments): void {
                foreach ($files as $file) {
                    if ($file->getError() !== UPLOAD_ERR_OK) {
                        continue;
                    }

                    $attachment = $this->ThesisDefenseAttachments->newEntity([
                        'thesis_defense_id' => $defense->id,
                        'filename' => $file->getClientFilename(),
                        'mimetype' => $file->getClientMediaType() ?: 'application/octet-stream',
                        'data' => $file->getStream()->getContents(),
                    ]);

                    if ($this->ThesisDefenseAttachments->save($attachment)) {
                        $createdAttachments[] = $attachment;
                    }
                }
            });
        } catch (\Exception $e) {
            $this->log($e->getMessage());
            $this->JSONResponse(ResponseCode::Error, null, 'A database error occurred while saving the attachment');
            return;
        }

        if (empty($createdAttachments)) {
            $this->JSONResponse(ResponseCode::Error, null, 'No files were successfully saved');
            return;
        }

        $this->JSONResponse(ResponseCode::Ok, $createdAttachments);
    }
}