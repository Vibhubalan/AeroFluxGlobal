<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';
desk_require();

$id = (int) ($_GET['id'] ?? 0);
$pdo = aero_pdo();
if (!$pdo instanceof PDO || $id <= 0) {
    http_response_code(404);
    exit;
}
$statement = $pdo->prepare('SELECT attachment_path FROM rfq_submissions WHERE id = ?');
$statement->execute([$id]);
$path = (string) ($statement->fetchColumn() ?: '');
$file = dirname(__DIR__) . '/uploads/rfq/' . basename($path);
if ($path === '' || !is_file($file)) {
    http_response_code(404);
    exit;
}
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . basename($file) . '"');
readfile($file);
exit;
