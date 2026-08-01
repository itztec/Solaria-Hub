<?php
/**
 * CUSTOMERS API
 * Handles CRUD operations for Customer Registrations in MySQL.
 */

require_once 'config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// Helper to format record
function formatCustomer($row) {
    if (!$row) return null;
    $docs = !empty($row['documents']) ? json_decode($row['documents'], true) : new stdClass();
    return [
        'id' => $row['id'],
        'customerName' => $row['customer_name'],
        'phone' => $row['phone'],
        'email' => $row['email'] ?? '',
        'address' => $row['address'] ?? '',
        'pincode' => $row['pincode'] ?? '',
        'city' => $row['city'] ?? '',
        'district' => $row['district'] ?? '',
        'state' => $row['state'] ?? '',
        'systemSize' => $row['system_size'] ?? '',
        'leadSource' => $row['lead_source'] ?? '',
        'caNumber' => $row['ca_number'] ?? '',
        'sanctionLoad' => $row['sanction_load'] ?? '',
        'bankLoan' => $row['bank_loan'] ?? 'No',
        'projectCost' => $row['project_cost'] ?? '',
        'discomName' => $row['discom_name'] ?? '',
        'connectionType' => $row['connection_type'] ?? '',
        'distributorId' => $row['distributor_id'],
        'distributorName' => $row['distributor_name'] ?? '',
        'status' => $row['status'] ?? 'Active',
        'documents' => $docs,
        'createdAt' => $row['created_at'] ?? ''
    ];
}

// 1. GET CUSTOMERS
if ($method === 'GET') {
    $id = $_GET['id'] ?? '';
    $distributorId = $_GET['distributorId'] ?? '';

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
        $stmt->execute([$id]);
        $cust = $stmt->fetch();
        if ($cust) {
            echo json_encode(['success' => true, 'customer' => formatCustomer($cust)]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Customer not found']);
        }
    } elseif ($distributorId) {
        $stmt = $pdo->prepare("SELECT * FROM customers WHERE distributor_id = ? ORDER BY created_at DESC");
        $stmt->execute([$distributorId]);
        $rows = $stmt->fetchAll();
        $list = array_map('formatCustomer', $rows);
        echo json_encode(['success' => true, 'customers' => $list]);
    } else {
        $stmt = $pdo->query("SELECT * FROM customers ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        $list = array_map('formatCustomer', $rows);
        echo json_encode(['success' => true, 'customers' => $list]);
    }
    exit();
}

// 2. CREATE NEW CUSTOMER (POST)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['_action'] ?? ($input['action'] ?? '');

    // Allow method override for DELETE or UPDATE via POST
    if ($action === 'DELETE' || isset($input['_method']) && strtoupper($input['_method']) === 'DELETE') {
        $id = $input['id'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        exit();
    }

    if ($action === 'PUT' || isset($input['_method']) && strtoupper($input['_method']) === 'PUT') {
        $id = $input['id'] ?? '';
        updateCustomer($pdo, $id, $input);
        exit();
    }

    // Auto-generate Next Customer ID if not provided
    $id = $input['id'] ?? '';
    if (!$id) {
        $year = date('Y');
        $stmt = $pdo->query("SELECT id FROM customers WHERE id LIKE 'CUST-$year-%' ORDER BY id DESC LIMIT 1");
        $lastRow = $stmt->fetch();
        $num = 1;
        if ($lastRow && preg_match('/CUST-\d+-(\d+)/', $lastRow['id'], $m)) {
            $num = intval($m[1]) + 1;
        }
        $id = sprintf("CUST-%s-%03d", $year, $num);
    }

    $docsJson = isset($input['documents']) ? json_encode($input['documents']) : json_encode(new stdClass());

    $sql = "INSERT INTO customers 
        (id, customer_name, phone, email, address, pincode, city, district, state, system_size, lead_source, ca_number, sanction_load, bank_loan, project_cost, discom_name, connection_type, distributor_id, distributor_name, status, documents) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id,
        $input['customerName'] ?? '',
        $input['phone'] ?? '',
        $input['email'] ?? '',
        $input['address'] ?? '',
        $input['pincode'] ?? '',
        $input['city'] ?? '',
        $input['district'] ?? '',
        $input['state'] ?? '',
        $input['systemSize'] ?? '',
        $input['leadSource'] ?? '',
        $input['caNumber'] ?? '',
        $input['sanctionLoad'] ?? '',
        $input['bankLoan'] ?? 'No',
        $input['projectCost'] ?? '',
        $input['discomName'] ?? '',
        $input['connectionType'] ?? '',
        $input['distributorId'] ?? '',
        $input['distributorName'] ?? '',
        $input['status'] ?? 'Active',
        $docsJson
    ]);

    $stmtGet = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
    $stmtGet->execute([$id]);
    $created = $stmtGet->fetch();

    echo json_encode(['success' => true, 'customer' => formatCustomer($created)]);
    exit();
}

// 3. UPDATE CUSTOMER (PUT)
if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? ($input['id'] ?? '');
    updateCustomer($pdo, $id, $input);
    exit();
}

// 4. DELETE CUSTOMER (DELETE)
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? '';
    }
    
    $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit();
}

function updateCustomer($pdo, $id, $input) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Customer ID required for update']);
        exit();
    }

    $docsJson = isset($input['documents']) ? json_encode($input['documents']) : null;

    $sql = "UPDATE customers SET 
        customer_name = COALESCE(?, customer_name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        pincode = COALESCE(?, pincode),
        city = COALESCE(?, city),
        district = COALESCE(?, district),
        state = COALESCE(?, state),
        system_size = COALESCE(?, system_size),
        lead_source = COALESCE(?, lead_source),
        ca_number = COALESCE(?, ca_number),
        sanction_load = COALESCE(?, sanction_load),
        bank_loan = COALESCE(?, bank_loan),
        project_cost = COALESCE(?, project_cost),
        discom_name = COALESCE(?, discom_name),
        connection_type = COALESCE(?, connection_type),
        distributor_id = COALESCE(?, distributor_id),
        distributor_name = COALESCE(?, distributor_name),
        status = COALESCE(?, status),
        documents = COALESCE(?, documents)
        WHERE id = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $input['customerName'] ?? null,
        $input['phone'] ?? null,
        $input['email'] ?? null,
        $input['address'] ?? null,
        $input['pincode'] ?? null,
        $input['city'] ?? null,
        $input['district'] ?? null,
        $input['state'] ?? null,
        $input['systemSize'] ?? null,
        $input['leadSource'] ?? null,
        $input['caNumber'] ?? null,
        $input['sanctionLoad'] ?? null,
        $input['bankLoan'] ?? null,
        $input['projectCost'] ?? null,
        $input['discomName'] ?? null,
        $input['connectionType'] ?? null,
        $input['distributorId'] ?? null,
        $input['distributorName'] ?? null,
        $input['status'] ?? null,
        $docsJson,
        $id
    ]);

    $stmtGet = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
    $stmtGet->execute([$id]);
    $updated = $stmtGet->fetch();

    echo json_encode(['success' => true, 'customer' => formatCustomer($updated)]);
}
