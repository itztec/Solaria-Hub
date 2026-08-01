<?php
/**
 * cPanel Web Installer & Database Diagnostics
 * Access via browser: https://your-domain.com/api/install.php
 */

header('Content-Type: text/html; charset=utf-8');
require_once 'config.php';

$message = '';
$status = 'unknown';
$tableDetails = [];

try {
    $pdo = getDB();
    $status = 'success';
    $message = 'Successfully connected to MySQL database: <strong>' . DB_NAME . '</strong> as user <strong>' . DB_USER . '</strong> on host <strong>' . DB_HOST . '</strong>!';

    // Handle Manual Reset/Re-install trigger
    if (isset($_POST['action']) && $_POST['action'] === 'reset_database') {
        $pdo->exec("DROP TABLE IF EXISTS `customers`, `distributors`, `settings`, `system_config`");
        autoSetupTables($pdo);
        $message = 'Database tables successfully re-created and re-seeded with initial data!';
    }

    // Get Table Statistics
    $tables = ['settings', 'system_config', 'distributors', 'customers'];
    foreach ($tables as $t) {
        $countStmt = $pdo->query("SELECT COUNT(*) as cnt FROM `$t`");
        $cnt = $countStmt->fetch()['cnt'];
        $tableDetails[$t] = $cnt;
    }

} catch (Exception $e) {
    $status = 'error';
    $message = 'Database Connection Error: ' . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASM Money Shef Solar - cPanel DB Installer</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; width: 100%; max-width: 600px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4); }
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .icon-box { width: 52px; height: 52px; background: linear-gradient(135deg, #eab308, #ca8a04); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        h1 { font-size: 20px; font-weight: 700; color: #ffffff; }
        p.subtitle { font-size: 13px; color: #94a3b8; margin-top: 2px; }
        .alert { padding: 16px; border-radius: 12px; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
        .alert-success { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #6ee7b7; }
        .alert-error { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; }
        .table-list { background: #0f172a; border-radius: 12px; border: 1px solid #334155; padding: 16px; margin-bottom: 24px; }
        .table-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #334155; font-size: 14px; }
        .table-item:last-child { border-bottom: none; }
        .badge { background: #0284c7; color: #e0f2fe; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
        .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 14px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: 0.2s; text-decoration: none; }
        .btn-primary { background: #eab308; color: #0f172a; }
        .btn-primary:hover { background: #facc15; }
        .btn-secondary { background: #334155; color: #f8fafc; margin-top: 12px; }
        .btn-secondary:hover { background: #475569; }
        .footer-text { margin-top: 20px; font-size: 12px; text-align: center; color: #64748b; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="icon-box">⚡</div>
            <div>
                <h1>ASM Money Shef Solar</h1>
                <p class="subtitle">cPanel Database Auto-Installer & System Diagnostics</p>
            </div>
        </div>

        <div class="alert alert-<?php echo $status; ?>">
            <?php echo $message; ?>
        </div>

        <?php if ($status === 'success'): ?>
            <h3 style="font-size: 15px; margin-bottom: 12px; color: #cbd5e1;">Database Tables Overview</h3>
            <div class="table-list">
                <?php foreach ($tableDetails as $tableName => $rowCount): ?>
                    <div class="table-item">
                        <span>📁 Table: <strong><?php echo $tableName; ?></strong></span>
                        <span class="badge"><?php echo $rowCount; ?> Records</span>
                    </div>
                <?php endforeach; ?>
            </div>

            <a href="../" class="btn btn-primary">🚀 Launch Solar Application</a>

            <form method="POST" style="margin-top: 12px;" onsubmit="return confirm('Are you sure you want to reset and re-seed all database tables?');">
                <input type="hidden" name="action" value="reset_database">
                <button type="submit" class="btn btn-secondary">🔄 Reset & Re-seed Database Tables</button>
            </form>
        <?php else: ?>
            <div style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
                <strong style="color: #f8fafc;">Troubleshooting Instructions:</strong><br>
                1. Ensure you created the database <code>kdbkxqfy_main</code> in cPanel MySQL Databases.<br>
                2. Ensure user <code>kdbkxqfy_root</code> is assigned to <code>kdbkxqfy_main</code> with "ALL PRIVILEGES".<br>
                3. Open <code>api/config.php</code> file and edit the password line (line 19) if you set a password for user <code>kdbkxqfy_root</code>.
            </div>
        <?php endif; ?>

        <div class="footer-text">
            ASM Money Shef Solar • Automated cPanel Database System
        </div>
    </div>
</body>
</html>
