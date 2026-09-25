<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';
desk_require();

$id = (int) ($_GET['id'] ?? 0);
$pdo = aero_pdo();
$row = null;
if ($pdo instanceof PDO && $id > 0) {
    $statement = $pdo->prepare('SELECT * FROM rfq_submissions WHERE id = ?');
    $statement->execute([$id]);
    $found = $statement->fetch();
    $row = is_array($found) ? $found : null;
}
if ($row === null) {
    desk_layout('Enquiry', '<p>Enquiry not found.</p>');
    exit;
}

$body = '<p><a href="' . desk_url('rfqs.php') . '">All enquiries</a></p>';
$body .= '<h1>' . aero_h((string) $row['company']) . '</h1>';
$body .= '<p>' . aero_h((string) $row['name']) . ' · ' . aero_h((string) $row['email']) . ' · ' . aero_h((string) $row['phone']) . '</p>';
$body .= '<p>Product: ' . aero_h((string) $row['product']) . '</p>';
if ((string) $row['quote_items'] !== '') {
    $body .= '<p>Quote list: ' . aero_h((string) $row['quote_items']) . '</p>';
}
$body .= '<p style="white-space:pre-wrap">' . aero_h((string) $row['message']) . '</p>';
if ((string) ($row['attachment_path'] ?? '') !== '') {
    $body .= '<p><a href="' . desk_url('download.php') . '?id=' . (int) $row['id'] . '">Download attachment</a></p>';
}
desk_layout('Enquiry', $body);
