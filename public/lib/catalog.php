<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function aero_catalog_file(): ?string
{
    $candidates = [
        dirname(__DIR__, 2) . '/src/data/products.json',
        __DIR__ . '/../data/products.json',
    ];
    foreach ($candidates as $path) {
        if (is_file($path)) {
            return $path;
        }
    }
    return null;
}

function aero_detail(array $item): array
{
    $name = (string) ($item['name'] ?? '');
    $packs = aero_json_list($item['packs'] ?? null);
    $specs = aero_json_list($item['specifications'] ?? null);
    return [
        'packs' => $packs !== [] ? $packs : ['6x1 USQ', '208.1 L'],
        'description' => (string) (($item['description'] ?? '') !== ''
            ? $item['description']
            : $name . ' is supplied for aviation use with trace documentation. Pack size and availability are confirmed against the current specification at enquiry.'),
        'applications' => (string) (($item['applications'] ?? '') !== ''
            ? $item['applications']
            : 'Approved aviation applications where ' . $name . ' is the specified grade.'),
        'specifications' => $specs !== [] ? $specs : ['OEM traceable', 'Certificate of conformance on request'],
        'summary' => (string) (($item['summary'] ?? '') !== ''
            ? $item['summary']
            : 'Supplied to the current aviation specification.'),
    ];
}

function aero_public_item(array $row): array
{
    $detail = aero_detail($row);
    $image = (string) ($row['image'] ?? '');
    if ($image === '') {
        $image = '/images/products/' . $row['item_id'] . '.webp';
    }
    return [
        'id' => (string) $row['item_id'],
        'category' => (string) $row['category_slug'],
        'name' => (string) $row['name'],
        'image' => $image,
        'featured' => aero_flag($row['featured'] ?? false),
        'packs' => $detail['packs'],
        'description' => $detail['description'],
        'applications' => $detail['applications'],
        'specifications' => $detail['specifications'],
        'summary' => $detail['summary'],
    ];
}

function aero_items_from_json(?string $category = null): array
{
    $file = aero_catalog_file();
    if ($file === null) {
        return [];
    }
    $decoded = json_decode((string) file_get_contents($file), true);
    if (!is_array($decoded)) {
        return [];
    }
    $items = [];
    foreach ($decoded as $slug => $rows) {
        if ($category !== null && $slug !== $category) {
            continue;
        }
        if (!is_array($rows)) {
            continue;
        }
        foreach ($rows as $row) {
            if (!is_array($row) || empty($row['id']) || empty($row['name'])) {
                continue;
            }
            $row['category_slug'] = (string) $slug;
            $row['item_id'] = (string) $row['id'];
            $row['featured'] = !empty($row['featured']) ? 1 : 0;
            $items[] = aero_public_item($row);
        }
    }
    return $items;
}

function aero_items(?string $category = null, bool $featuredOnly = false): array
{
    $pdo = aero_pdo();
    if ($pdo instanceof PDO) {
        $sql = 'SELECT * FROM catalog_items';
        $where = [];
        $params = [];
        if ($category !== null) {
            $where[] = 'category_slug = ?';
            $params[] = $category;
        }
        if ($featuredOnly) {
            $where[] = 'featured = TRUE';
        }
        if ($where !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY name ASC';
        $statement = $pdo->prepare($sql);
        $statement->execute($params);
        $rows = $statement->fetchAll();
        if ($rows !== []) {
            return array_map('aero_public_item', $rows);
        }
    }
    $items = aero_items_from_json($category);
    if ($featuredOnly) {
        $items = array_values(array_filter($items, static fn ($item) => $item['featured']));
    }
    return $items;
}

function aero_find_item(string $category, string $id): ?array
{
    $pdo = aero_pdo();
    if ($pdo instanceof PDO) {
        $statement = $pdo->prepare('SELECT * FROM catalog_items WHERE category_slug = ? AND item_id = ? LIMIT 1');
        $statement->execute([$category, $id]);
        $row = $statement->fetch();
        if (is_array($row)) {
            return aero_public_item($row);
        }
    }
    foreach (aero_items_from_json($category) as $item) {
        if ($item['id'] === $id) {
            return $item;
        }
    }
    return null;
}
