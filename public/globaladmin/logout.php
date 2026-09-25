<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';
desk_start();
$_SESSION = [];
session_destroy();
header('Location: ' . desk_url('login.php'));
exit;
