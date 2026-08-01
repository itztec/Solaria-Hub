<?php
/**
 * AUTHENTICATION API
 * Handles login validation, master password verification, and site lock controls.
 */

require_once 'config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'get_system_config') {
        $stmt = $pdo->query("SELECT admin_username, is_locked, lock_reason FROM system_config WHERE id = 1");
        $config = $stmt->fetch() ?: [
            'admin_username' => 'ASM26itztec',
            'is_locked' => 0,
            'lock_reason' => ''
        ];
        echo json_encode(['success' => true, 'config' => $config]);
        exit();
    }

    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? '';

    // 1. LOGIN ACTION
    if ($action === 'login' || isset($input['selectedRole'])) {
        $role = $input['selectedRole'] ?? 'Channel Partner';
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');
        $targetDistId = trim($input['targetDistId'] ?? '');

        // Fetch System Config
        $sysStmt = $pdo->query("SELECT * FROM system_config WHERE id = 1");
        $sysConfig = $sysStmt->fetch();

        // Check Site Lock
        if (!empty($sysConfig['is_locked']) && $sysConfig['is_locked'] == 1 && $username !== 'superadmin_master') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Service Temporarily Suspended due to maintenance or subscription status.']);
            exit();
        }

        if ($role === 'Channel Partner') {
            $adminUser = $sysConfig['admin_username'] ?? 'ASM26itztec';
            $adminPass = $sysConfig['admin_password'] ?? 'A2S6MSS';

            if ($username !== $adminUser || $password !== $adminPass) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Invalid Channel Partner Username or Password']);
                exit();
            }

            $userSession = [
                'username' => $adminUser,
                'name' => 'Channel Partner Admin',
                'role' => 'Channel Partner',
                'email' => $adminUser . '@asmmoneyshefsolar.com',
                'token' => 'solar_token_' . time()
            ];

            echo json_encode(['success' => true, 'user' => $userSession]);
            exit();
        }

        if ($role === 'Distributor') {
            $searchKey = $targetDistId ?: $username;
            
            $stmt = $pdo->prepare("SELECT * FROM distributors WHERE id = ? OR LOWER(email) = LOWER(?) OR LOWER(company_name) LIKE LOWER(?) LIMIT 1");
            $stmt->execute([$searchKey, $searchKey, "%$searchKey%"]);
            $dist = $stmt->fetch();

            if (!$dist) {
                // If not found, check any first distributor
                $stmtFirst = $pdo->query("SELECT * FROM distributors LIMIT 1");
                $dist = $stmtFirst->fetch();
            }

            if ($dist && !empty($dist['password']) && !empty($password) && $dist['password'] !== $password) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Invalid Distributor Password']);
                exit();
            }

            if (!$dist) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Distributor account not found']);
                exit();
            }

            $userSession = [
                'username' => $dist['id'],
                'name' => $dist['company_name'],
                'distributorName' => $dist['distributor_name'],
                'role' => 'Distributor',
                'distributorId' => $dist['id'],
                'email' => $dist['email'],
                'token' => 'solar_token_' . time()
            ];

            echo json_encode(['success' => true, 'user' => $userSession]);
            exit();
        }
    }

    // 2. VERIFY MASTER PASSWORD
    if ($action === 'verify_master_password') {
        $password = trim($input['password'] ?? '');
        $sysStmt = $pdo->query("SELECT master_password FROM system_config WHERE id = 1");
        $masterPass = $sysStmt->fetch()['master_password'] ?? 'SUPER@ASM2026';

        if ($password === $masterPass) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid Master SuperAdmin Password']);
        }
        exit();
    }

    // 3. SET SITE LOCK
    if ($action === 'set_site_lock') {
        $isLocked = !empty($input['isLocked']) ? 1 : 0;
        $reason = trim($input['reason'] ?? '');

        $stmt = $pdo->prepare("UPDATE system_config SET is_locked = ?, lock_reason = ? WHERE id = 1");
        $stmt->execute([$isLocked, $reason]);

        echo json_encode(['success' => true, 'isLocked' => $isLocked, 'reason' => $reason]);
        exit();
    }

    // 4. UPDATE CHANNEL PARTNER CREDS
    if ($action === 'update_admin_creds') {
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if ($username && $password) {
            $stmt = $pdo->prepare("UPDATE system_config SET admin_username = ?, admin_password = ? WHERE id = 1");
            $stmt->execute([$username, $password]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Username and password required']);
        }
        exit();
    }

    // 5. UPDATE MASTER PASSWORD
    if ($action === 'update_master_password') {
        $password = trim($input['password'] ?? '');

        if ($password) {
            $stmt = $pdo->prepare("UPDATE system_config SET master_password = ? WHERE id = 1");
            $stmt->execute([$password]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Password required']);
        }
        exit();
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Invalid request']);
