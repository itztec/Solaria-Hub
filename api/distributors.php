<?php
/**
 * DISTRIBUTORS API
 * Handles CRUD operations for Solar Distributors in MySQL.
 */

require_once 'config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Helper to format record
function formatDistributor($row) {
    if (!$row) return null;
    return [
        'id' => $row['id'],
        'companyName' => $row['company_name'],
        'distributorName' => $row['distributor_name'],
        'phone' => $row['phone'],
        'altPhone' => $row['alt_phone'] ?? '',
        'email' => $row['email'],
        'password' => $row['password'],
        'state' => $row['state'],
        'district' => $row['district'] ?? '',
        'area' => $row['area'] ?? '',
        'pincode' => $row['pincode'] ?? '',
        'fullAddress' => $row['full_address'] ?? '',
        'agreementDate' => $row['agreement_date'] ?? '',
        'status' => $row['status'] ?? 'Active',
        'photo' => $row['photo'] ?? '',
        'pdfDoc' => $row['pdf_doc'] ?? '',
        'notes' => $row['notes'] ?? '',
        'createdAt' => $row['created_at'] ?? ''
    ];
}

// 1. GET ALL OR SINGLE DISTRIBUTOR
if ($method === 'GET') {
    $id = $_GET['id'] ?? '';
    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM distributors WHERE id = ?");
        $stmt->execute([$id]);
        $dist = $stmt->fetch();
        if ($dist) {
            echo json_encode(['success' => true, 'distributor' => formatDistributor($dist)]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Distributor not found']);
        }
    } else {
        $stmt = $pdo->query("SELECT * FROM distributors ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        $list = array_map('formatDistributor', $rows);
        echo json_encode(['success' => true, 'distributors' => $list]);
    }
    exit();
}

// 2. CREATE NEW DISTRIBUTOR (POST)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['_action'] ?? ($input['action'] ?? '');

    // Allow method override for UPDATE or DELETE via POST
    if ($action === 'DELETE' || isset($input['_method']) && strtoupper($input['_method']) === 'DELETE') {
        $id = $input['id'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM distributors WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit();
    }

    if ($action === 'PUT' || isset($input['_method']) && strtoupper($input['_method']) === 'PUT') {
        $id = $input['id'] ?? '';
        updateDistributor($pdo, $id, $input);
        exit();
    }

    // Auto-generate Next Distributor ID if not provided
    $id = $input['id'] ?? '';
    if (!$id) {
        $year = date('Y');
        $stmt = $pdo->query("SELECT id FROM distributors WHERE id LIKE 'DIS-$year-%' ORDER BY id DESC LIMIT 1");
        $lastRow = $stmt->fetch();
        $num = 1;
        if ($lastRow && preg_match('/DIS-\d+-(\d+)/', $lastRow['id'], $m)) {
            $num = intval($m[1]) + 1;
        }
        $id = sprintf("DIS-%s-%03d", $year, $num);
    }

    $password = $input['password'] ?? ('Pass@' . rand(1000, 9999));

    $sql = "INSERT INTO distributors 
        (id, company_name, distributor_name, phone, alt_phone, email, password, state, district, area, pincode, full_address, agreement_date, status, photo, pdf_doc, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id,
        $input['companyName'] ?? '',
        $input['distributorName'] ?? '',
        $input['phone'] ?? '',
        $input['altPhone'] ?? '',
        $input['email'] ?? '',
        $password,
        $input['state'] ?? '',
        $input['district'] ?? '',
        $input['area'] ?? '',
        $input['pincode'] ?? '',
        $input['fullAddress'] ?? '',
        $input['agreementDate'] ?? date('Y-m-d'),
        $input['status'] ?? 'Active',
        $input['photo'] ?? '',
        $input['pdfDoc'] ?? '',
        $input['notes'] ?? ''
    ]);

    $stmtGet = $pdo->prepare("SELECT * FROM distributors WHERE id = ?");
    $stmtGet->execute([$id]);
    $created = $stmtGet->fetch();

    echo json_encode(['success' => true, 'distributor' => formatDistributor($created)]);
    exit();
}

// 3. UPDATE DISTRIBUTOR (PUT)
if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? ($input['id'] ?? '');
    updateDistributor($pdo, $id, $input);
    exit();
}

// 4. DELETE DISTRIBUTOR (DELETE)
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? '';
    }
    
    $stmt = $pdo->prepare("DELETE FROM distributors WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

function updateDistributor($pdo, $id, $input) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Distributor ID required for update']);
        exit();
    }

    $sql = "UPDATE distributors SET 
        company_name = COALESCE(?, company_name),
        distributor_name = COALESCE(?, distributor_name),
        phone = COALESCE(?, phone),
        alt_phone = COALESCE(?, alt_phone),
        email = COALESCE(?, email),
        password = COALESCE(?, password),
        state = COALESCE(?, state),
        district = COALESCE(?, district),
        area = COALESCE(?, area),
        pincode = COALESCE(?, pincode),
        full_address = COALESCE(?, full_address),
        agreement_date = COALESCE(?, agreement_date),
        status = COALESCE(?, status),
        photo = COALESCE(?, photo),
        pdf_doc = COALESCE(?, pdf_doc),
        notes = COALESCE(?, notes)
        WHERE id = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $input['companyName'] ?? null,
        $input['distributorName'] ?? null,
        $input['phone'] ?? null,
        $input['altPhone'] ?? null,
        $input['email'] ?? null,
        $input['password'] ?? null,
        $input['state'] ?? null,
        $input['district'] ?? null,
        $input['area'] ?? null,
        $input['pincode'] ?? null,
        $input['fullAddress'] ?? null,
        $input['agreementDate'] ?? null,
        $input['status'] ?? null,
        $input['photo'] ?? null,
        $input['pdfDoc'] ?? null,
        $input['notes'] ?? null,
        $id
    ]);

    $stmtGet = $pdo->prepare("SELECT * FROM distributors WHERE id = ?");
    $stmtGet->execute([$id]);
    $updated = $stmtGet->fetch();

    echo json_encode(['success' => true, 'distributor' => formatDistributor($updated)]);
}
