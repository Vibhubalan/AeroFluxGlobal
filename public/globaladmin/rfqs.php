<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';
desk_require();

$pdo = aero_pdo();
$rows = [];
if ($pdo instanceof PDO) {
    $rows = $pdo->query('SELECT id, created_at, company, name, email, product, mail_sent FROM rfq_submissions ORDER BY id DESC LIMIT 200')->fetchAll();
}

$body = '<p><a href="' . desk_url() . '">Desk</a></p><h1>Responses</h1>';
if (!$pdo instanceof PDO) {
    $body .= '<p>Database is not connected yet. Add config.php and import sql/schema.sql.</p>';
} elseif ($rows === []) {
    $body .= '<p>No responses yet.</p>';
} else {
    $body .= '<table><tr><th>When</th><th>Company</th><th>From</th><th>Product</th><th>Mail</th></tr>';
    foreach ($rows as $row) {
        $body .= '<tr><td><a href="' . desk_url('rfq.php') . '?id=' . (int) $row['id'] . '">' . aero_h((string) $row['created_at']) . '</a></td>';
        $body .= '<td>' . aero_h((string) $row['company']) . '</td><td>' . aero_h((string) $row['name']) . '<br>' . aero_h((string) $row['email']) . '</td>';
        $body .= '<td>' . aero_h((string) $row['product']) . '</td><td>' . ((int) $row['mail_sent'] === 1 ? 'Sent' : 'Stored') . '</td></tr>';
    }
    $body .= '</table>';
}
desk_layout('Responses', $body);
