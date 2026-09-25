<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/../lib/catalog.php';
desk_require();

$notice = '';
$pdo = aero_pdo();
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'import') {
    require_once __DIR__ . '/../lib/product-save.php';
    if (!$pdo instanceof PDO) {
        $notice = 'Database is not connected.';
    } else {
        $count = 0;
        $statement = $pdo->prepare(
            'INSERT INTO catalog_items (category_slug, item_id, name, image, packs, description, applications, specifications, summary, featured)
             VALUES (?, ?, ?, ?, CAST(? AS jsonb), ?, ?, CAST(? AS jsonb), ?, ?)
             ON CONFLICT (category_slug, item_id) DO UPDATE SET
               name=EXCLUDED.name, image=EXCLUDED.image, packs=EXCLUDED.packs, description=EXCLUDED.description,
               applications=EXCLUDED.applications, specifications=EXCLUDED.specifications, summary=EXCLUDED.summary, featured=EXCLUDED.featured'
        );
        foreach (aero_items_from_json() as $item) {
            $statement->execute([
                $item['category'], $item['id'], $item['name'], $item['image'],
                json_encode($item['packs']), $item['description'], $item['applications'],
                json_encode($item['specifications']), $item['summary'], $item['featured'] ? 1 : 0,
            ]);
            $count++;
        }
        $notice = $count . ' items imported.';
    }
}

if ($pdo instanceof PDO && ($_GET['delete'] ?? '') !== '') {
    $pdo->prepare('DELETE FROM catalog_items WHERE id = ?')->execute([(int) $_GET['delete']]);
    header('Location: ' . desk_url('products.php'));
    exit;
}

$rows = $pdo instanceof PDO
    ? $pdo->query('SELECT id, category_slug, item_id, name, featured FROM catalog_items ORDER BY category_slug, name')->fetchAll()
    : [];

$category = (string) ($_GET['category'] ?? '');
$categories = aero_categories();
$body = '<p><a href="' . desk_url() . '">Desk</a></p>';
if ($category === '' || !isset($categories[$category])) {
    $body .= '<h1>Products</h1>';
    $body .= '<ul>';
    foreach ($categories as $slug => $title) {
        $body .= '<li><a href="' . desk_url('products.php') . '?category=' . aero_h($slug) . '">' . aero_h($title) . '</a></li>';
    }
    $body .= '</ul>';
} else {
    $body .= '<h1>' . aero_h($categories[$category]) . '</h1>';
    $body .= '<p><a class="btn" href="' . desk_url('product.php') . '?category=' . aero_h($category) . '">+ Add item</a></p>';
    if (!$pdo instanceof PDO) {
        $body .= '<p>Database is not connected yet.</p>';
    } else {
        $body .= '<ul>';
        foreach ($rows as $row) {
            if ((string) $row['category_slug'] !== $category) {
                continue;
            }
            $body .= '<li><a href="' . desk_url('product.php') . '?id=' . (int) $row['id'] . '">' . aero_h((string) $row['name']) . '</a></li>';
        }
        $body .= '</ul>';
    }
}
if ($notice !== '') {
    $body .= '<p>' . aero_h($notice) . '</p>';
}
$body .= '<form method="post"><input type="hidden" name="action" value="import"><button class="ghost" type="submit">Import current catalog</button></form>';
desk_layout('Products', $body);
