<?php
/**
 * FILE UPLOAD API
 * Saves uploaded documents/photos to the cPanel /uploads/ folder and returns URL.
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$targetDir = __DIR__ . '/../uploads/';
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0755, true);
}

// 1. Check for standard multipart file upload ($_FILES)
if (!empty($_FILES['file'])) {
    $file = $_FILES['file'];
    $fileName = basename($file['name']);
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
    if (!in_array($fileExt, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Allowed: JPG, PNG, GIF, PDF, DOC']);
        exit();
    }

    $newFileName = time() . '_' . uniqid() . '.' . $fileExt;
    $targetFilePath = $targetDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
        echo json_encode([
            'success' => true,
            'url' => 'uploads/' . $newFileName,
            'filename' => $newFileName
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
    }
    exit();
}

// 2. Check for Base64 Data URL upload
$input = json_decode(file_get_contents('php://input'), true);
if (!empty($input['base64Data'])) {
    $base64Data = $input['base64Data'];
    if (preg_match('/^data:(image\/(\w+)|application\/pdf);base64,/', $base64Data, $type)) {
        $data = substr($base64Data, strpos($base64Data, ',') + 1);
        $typeStr = strtolower($type[2] ?? 'pdf');
        $data = base64_decode($data);

        if ($data === false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Base64 decode failed']);
            exit();
        }

        $newFileName = time() . '_' . uniqid() . '.' . ($typeStr === 'jpeg' ? 'jpg' : $typeStr);
        $targetFilePath = $targetDir . $newFileName;

        if (file_put_contents($targetFilePath, $data)) {
            echo json_encode([
                'success' => true,
                'url' => 'uploads/' . $newFileName,
                'filename' => $newFileName
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save base64 file']);
        }
        exit();
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'No file uploaded or invalid payload']);
