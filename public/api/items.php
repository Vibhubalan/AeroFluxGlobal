<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/catalog.php';

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

$category = isset($_GET['c']) ? (string) $_GET['c'] : '';
$featured = isset($_GET['featured']);
if ($category !== '' && !isset(aero_categories()[$category])) {
    http_response_code(404);
    echo '{"items":[]}';
    exit;
}

$items = aero_items($category !== '' ? $category : null, $featured);
echo json_encode(['items' => $items], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
