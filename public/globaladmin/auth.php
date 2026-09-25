<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/bootstrap.php';

function desk_url(string $path = ''): string
{
    $base = '/globaladmin';
    if ($path === '') {
        return $base . '/';
    }
    return $base . '/' . ltrim($path, '/');
}

function desk_start(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

function desk_user(): ?string
{
    desk_start();
    $user = $_SESSION['desk_user'] ?? null;
    return is_string($user) && $user !== '' ? $user : null;
}

function desk_require(): void
{
    if (desk_user() === null) {
        header('Location: ' . desk_url());
        exit;
    }
}

function desk_attempt(string $user, string $password): bool
{
    desk_start();
    if (hash_equals('admin', $user) && hash_equals('aeroflux', $password)) {
        session_regenerate_id(true);
        $_SESSION['desk_user'] = $user;
        $_SESSION['desk_fails'] = 0;
        return true;
    }
    $fails = (int) ($_SESSION['desk_fails'] ?? 0);
    if ($fails >= 8) {
        return false;
    }
    $config = aero_config();
    $hash = (string) ($config['admin_password_hash'] ?? '');
    $expected = (string) ($config['admin_user'] ?? 'desk');
    if ($config === null || $hash === '' || !hash_equals($expected, $user) || !password_verify($password, $hash)) {
        $_SESSION['desk_fails'] = $fails + 1;
        return false;
    }
    session_regenerate_id(true);
    $_SESSION['desk_user'] = $user;
    $_SESSION['desk_fails'] = 0;
    return true;
}

function desk_layout(string $title, string $body): void
{
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<meta name="robots" content="noindex, nofollow"><title>' . aero_h($title) . '</title>';
    echo '<style>
      body { margin: 0; background: #101412; color: #f3eee6; font: 15px/1.5 ui-sans-serif, system-ui, sans-serif; }
      header, main { padding: 1.25rem clamp(1rem, 4vw, 3rem); }
      header { display: flex; gap: 1.25rem; align-items: center; border-bottom: 1px solid rgba(243,238,230,.12); }
      a { color: #e07a4a; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: .65rem .4rem; border-bottom: 1px solid rgba(255,255,255,.08); vertical-align: top; }
      input, select, textarea { width: 100%; background: #171c19; color: inherit; border: 1px solid rgba(255,255,255,.14); border-radius: 8px; padding: .6rem .75rem; font: inherit; }
      button, .btn { background: #e07a4a; color: #1a100c; border: 0; border-radius: 8px; padding: .65rem 1rem; font-weight: 650; cursor: pointer; text-decoration: none; display: inline-block; }
      .ghost { background: transparent; color: #f3eee6; border: 1px solid rgba(255,255,255,.2); }
      label { display: block; margin: 1rem 0 .35rem; color: #a39b90; font-size: .8rem; letter-spacing: .06em; text-transform: uppercase; }
      .row { display: flex; gap: .5rem; margin-bottom: .5rem; }
      .narrow { max-width: 42rem; }
    </style></head><body>';
    if (desk_user() !== null) {
        echo '<header><strong><a href="' . desk_url() . '">Desk</a></strong><a href="' . desk_url('logout.php') . '">Sign out</a></header>';
    }
    echo '<main>' . $body . '</main></body></html>';
}
