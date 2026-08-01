<?php
/**
 * SETTINGS API
 * Handles reading and updating company settings in MySQL.
 */

require_once 'config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM settings WHERE id = 1");
    $settings = $stmt->fetch();

    if (!$settings) {
        $settings = [
            'companyName' => 'ASM Money Shef Solar',
            'tagline' => 'Smart Energy • Safe Future',
            'logo' => 'assets/logo.jpg',
            'address' => 'Solar Innovation Tower, Tech Park Road, Sector 62',
            'city' => 'Noida',
            'state' => 'Uttar Pradesh',
            'pincode' => '201301',
            'phone' => '+91 98765 43210',
            'email' => 'info@asmmoneyshefsolar.com',
            'website' => 'https://www.asmmoneyshefsolar.com'
        ];
    } else {
        $settings = [
            'companyName' => $settings['company_name'],
            'tagline' => $settings['tagline'],
            'logo' => $settings['logo'],
            'address' => $settings['address'],
            'city' => $settings['city'],
            'state' => $settings['state'],
            'pincode' => $settings['pincode'],
            'phone' => $settings['phone'],
            'email' => $settings['email'],
            'website' => $settings['website']
        ];
    }

    echo json_encode(['success' => true, 'settings' => $settings]);
    exit();
}

if ($method === 'POST' || $method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $sql = "UPDATE settings SET 
        company_name = COALESCE(?, company_name),
        tagline = COALESCE(?, tagline),
        logo = COALESCE(?, logo),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        website = COALESCE(?, website)
        WHERE id = 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $input['companyName'] ?? null,
        $input['tagline'] ?? null,
        $input['logo'] ?? null,
        $input['address'] ?? null,
        $input['city'] ?? null,
        $input['state'] ?? null,
        $input['pincode'] ?? null,
        $input['phone'] ?? null,
        $input['email'] ?? null,
        $input['website'] ?? null
    ]);

    echo json_encode(['success' => true, 'settings' => $input]);
    exit();
}
