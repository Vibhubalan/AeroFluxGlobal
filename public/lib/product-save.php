<?php
declare(strict_types=1);

require_once __DIR__ . '/catalog.php';

function aero_slug(string $name): string
{
    $slug = strtolower(trim($name));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug) ?? '';
    return trim($slug, '-') ?: 'item';
}

function aero_lines(string $key): array
{
    $raw = $_POST[$key] ?? [];
    if (!is_array($raw)) {
        return [];
    }
    $lines = [];
    foreach ($raw as $line) {
        $line = trim((string) $line);
        if ($line !== '') {
            $lines[] = $line;
        }
    }
    return $lines;
}

function aero_r2_put_upload(string $itemId, string $ext, string $tmp): ?string
{
    $config = aero_config() ?? [];
    $account = (string) ($config['r2_account_id'] ?? '');
    $access = (string) ($config['r2_access_key'] ?? '');
    $secret = (string) ($config['r2_secret_key'] ?? '');
    $bucket = (string) ($config['r2_bucket'] ?? '');
    $public = rtrim((string) ($config['r2_public_url'] ?? ''), '/');
    if ($account === '' || $access === '' || $secret === '' || $bucket === '' || $public === '') {
        return null;
    }
    $body = file_get_contents($tmp);
    if ($body === false) {
        return '';
    }
    $key = 'products/' . $itemId . '.' . $ext;
    $host = $account . '.r2.cloudflarestorage.com';
    $uri = '/' . $bucket . '/' . $key;
    $now = gmdate('Ymd\THis\Z');
    $day = gmdate('Ymd');
    $payloadHash = hash('sha256', $body);
    $headers = [
        'host' => $host,
        'x-amz-content-sha256' => $payloadHash,
        'x-amz-date' => $now,
    ];
    ksort($headers);
    $canonicalHeaders = '';
    $signedHeaders = [];
    foreach ($headers as $name => $value) {
        $canonicalHeaders .= $name . ':' . trim($value) . "\n";
        $signedHeaders[] = $name;
    }
    $signedHeaderNames = implode(';', $signedHeaders);
    $canonical = "PUT\n{$uri}\n\n{$canonicalHeaders}\n{$signedHeaderNames}\n{$payloadHash}";
    $scope = $day . '/auto/s3/aws4_request';
    $stringToSign = "AWS4-HMAC-SHA256\n{$now}\n{$scope}\n" . hash('sha256', $canonical);
    $dateKey = hash_hmac('sha256', $day, 'AWS4' . $secret, true);
    $regionKey = hash_hmac('sha256', 'auto', $dateKey, true);
    $serviceKey = hash_hmac('sha256', 's3', $regionKey, true);
    $signingKey = hash_hmac('sha256', 'aws4_request', $serviceKey, true);
    $signature = hash_hmac('sha256', $stringToSign, $signingKey);
    $authorization = 'AWS4-HMAC-SHA256 Credential=' . $access . '/' . $scope . ', SignedHeaders=' . $signedHeaderNames . ', Signature=' . $signature;
    $handle = curl_init('https://' . $host . $uri);
    if ($handle === false) {
        return '';
    }
    curl_setopt_array($handle, [
        CURLOPT_CUSTOMREQUEST => 'PUT',
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Host: ' . $host,
            'x-amz-content-sha256: ' . $payloadHash,
            'x-amz-date: ' . $now,
            'Authorization: ' . $authorization,
            'Content-Type: application/octet-stream',
        ],
        CURLOPT_TIMEOUT => 30,
    ]);
    curl_exec($handle);
    $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
    curl_close($handle);
    if ($status < 200 || $status >= 300) {
        return '';
    }
    return $public . '/' . $key;
}

function aero_store_image(string $itemId): ?string
{
    $file = $_FILES['image'] ?? null;
    if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return '';
    }
    $ext = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true) || (int) ($file['size'] ?? 0) > 8 * 1024 * 1024) {
        return '';
    }
    $remote = aero_r2_put_upload($itemId, $ext, (string) $file['tmp_name']);
    if (is_string($remote) && $remote !== '') {
        return $remote;
    }
    $dir = dirname(__DIR__) . '/images/products';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return '';
    }
    $target = $dir . '/' . $itemId . '.webp';
    if ($ext === 'webp') {
        if (!move_uploaded_file((string) $file['tmp_name'], $target)) {
            return '';
        }
    } else {
        $binary = file_get_contents((string) $file['tmp_name']);
        if ($binary === false || !function_exists('imagecreatefromstring')) {
            return '';
        }
        $source = imagecreatefromstring($binary);
        if ($source === false || !imagewebp($source, $target, 82)) {
            return '';
        }
        imagedestroy($source);
    }
    return '/images/products/' . $itemId . '.webp';
}

function aero_save_product(PDO $pdo): string
{
    $categories = aero_categories();
    $category = (string) ($_POST['category_slug'] ?? '');
    $name = trim((string) ($_POST['name'] ?? ''));
    $itemId = aero_slug((string) ($_POST['item_id'] ?? $name));
    $recordId = (int) ($_POST['record_id'] ?? 0);
    if (!isset($categories[$category]) || $name === '' || $itemId === '') {
        return 'Category and name are required.';
    }
    $packs = aero_lines('packs');
    $specs = aero_lines('specifications');
    if ($packs === []) {
        return 'Add at least one pack size.';
    }
    $image = aero_store_image($itemId);
    if ($image === '') {
        return 'Image must be a JPG, PNG, or WebP under 8 MB.';
    }
    $description = trim((string) ($_POST['description'] ?? ''));
    $applications = trim((string) ($_POST['applications'] ?? ''));
    $summary = trim((string) ($_POST['summary'] ?? ''));
    $featured = isset($_POST['featured']) ? 1 : 0;
    $existingImage = '';
    if ($recordId > 0) {
        $current = $pdo->prepare('SELECT image FROM catalog_items WHERE id = ?');
        $current->execute([$recordId]);
        $existingImage = (string) ($current->fetchColumn() ?: '');
    }
    if ($image === null) {
        $image = $existingImage !== '' ? $existingImage : '/images/products/' . $itemId . '.webp';
    }
    if ($recordId > 0) {
        $statement = $pdo->prepare(
            'UPDATE catalog_items SET category_slug=?, item_id=?, name=?, image=?, packs=CAST(? AS jsonb), description=?, applications=?, specifications=CAST(? AS jsonb), summary=?, featured=? WHERE id=?'
        );
        $statement->execute([
            $category, $itemId, $name, $image,
            json_encode($packs), $description, $applications, json_encode($specs), $summary, $featured, $recordId,
        ]);
        return '';
    }
    $statement = $pdo->prepare(
        'INSERT INTO catalog_items (category_slug, item_id, name, image, packs, description, applications, specifications, summary, featured)
         VALUES (?, ?, ?, ?, CAST(? AS jsonb), ?, ?, CAST(? AS jsonb), ?, ?)'
    );
    $statement->execute([
        $category, $itemId, $name, $image,
        json_encode($packs), $description, $applications, json_encode($specs), $summary, $featured,
    ]);
    return '';
}
