<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';

if (desk_user() !== null && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    $body = '<h1>Desk</h1><p><a class="btn" href="' . desk_url('products.php') . '">Add products</a></p>';
    $body .= '<p><a class="btn" href="' . desk_url('rfqs.php') . '">Check responses</a></p>';
    desk_layout('Desk', $body);
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim((string) ($_POST['user'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    if (desk_attempt($user, $password)) {
        header('Location: ' . desk_url());
        exit;
    }
    $error = 'Those details were not accepted.';
}

$body = '<div class="narrow"><h1>Desk</h1>';
$body .= '<p>Temporary sign-in: admin / aeroflux</p>';
if ($error !== '') {
    $body .= '<p>' . aero_h($error) . '</p>';
}
$body .= '<form method="post"><label>Name</label><input name="user" autocomplete="username" required>';
$body .= '<label>Password</label><input name="password" type="password" autocomplete="current-password" required>';
$body .= '<p><button type="submit">Sign in</button></p></form></div>';
desk_layout('Desk sign in', $body);
