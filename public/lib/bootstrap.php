<?php
declare(strict_types=1);

function aero_env_map(): array
{
    return [
        'DB_HOST' => 'db_host',
        'DB_PORT' => 'db_port',
        'DB_NAME' => 'db_name',
        'DB_USER' => 'db_user',
        'DB_PASS' => 'db_pass',
        'MAIL_FROM' => 'mail_from',
        'MAIL_TO' => 'mail_to',
        'RESEND_API_KEY' => 'resend_api_key',
        'SMTP_HOST' => 'smtp_host',
        'SMTP_PORT' => 'smtp_port',
        'SMTP_USER' => 'smtp_user',
        'SMTP_PASS' => 'smtp_pass',
        'ADMIN_USER' => 'admin_user',
        'ADMIN_PASSWORD_HASH' => 'admin_password_hash',
        'R2_ACCOUNT_ID' => 'r2_account_id',
        'R2_ACCESS_KEY' => 'r2_access_key',
        'R2_SECRET_KEY' => 'r2_secret_key',
        'R2_BUCKET' => 'r2_bucket',
        'R2_PUBLIC_URL' => 'r2_public_url',
    ];
}

function aero_load_env_file(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $values = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES);
    if ($lines === false) {
        return [];
    }
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $split = strpos($line, '=');
        if ($split === false) {
            continue;
        }
        $name = trim(substr($line, 0, $split));
        $value = trim(substr($line, $split + 1));
        if ($value !== '' && ($value[0] === '"' || $value[0] === "'") && str_ends_with($value, $value[0])) {
            $value = substr($value, 1, -1);
        }
        $values[$name] = $value;
    }
    return $values;
}

function aero_config(): ?array
{
    static $loaded = false;
    static $config = null;
    if ($loaded) {
        return $config;
    }
    $loaded = true;
    $fileValues = [];
    foreach ([__DIR__ . '/../.env', dirname(__DIR__, 2) . '/.env'] as $path) {
        $fileValues = array_merge($fileValues, aero_load_env_file($path));
    }
    $config = [];
    foreach (aero_env_map() as $envName => $key) {
        $fromPanel = getenv($envName);
        if (is_string($fromPanel) && $fromPanel !== '') {
            $config[$key] = $fromPanel;
            continue;
        }
        if (isset($fileValues[$envName]) && $fileValues[$envName] !== '') {
            $config[$key] = $fileValues[$envName];
        }
    }
    if (($config['db_name'] ?? '') !== '' && ($config['db_user'] ?? '') !== '') {
        return $config;
    }
    $candidates = [
        dirname(__DIR__, 2) . '/private/aeroflux.php',
        __DIR__ . '/../config.php',
    ];
    foreach ($candidates as $path) {
        if (is_file($path)) {
            $value = require $path;
            $config = is_array($value) ? $value : null;
            break;
        }
    }
    return $config;
}

function aero_pdo(): ?PDO
{
    static $pdo = false;
    if ($pdo instanceof PDO || $pdo === null) {
        return $pdo instanceof PDO ? $pdo : null;
    }
    $config = aero_config();
    if ($config === null || ($config['db_name'] ?? '') === '' || ($config['db_user'] ?? '') === '') {
        $pdo = null;
        return null;
    }
    try {
        $pdo = new PDO(
            'pgsql:host=' . ($config['db_host'] ?? '') . ';port=' . ($config['db_port'] ?? '5432') . ';dbname=' . $config['db_name'] . ';sslmode=require',
            (string) $config['db_user'],
            (string) ($config['db_pass'] ?? ''),
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    } catch (Throwable $error) {
        $pdo = null;
    }
    return $pdo instanceof PDO ? $pdo : null;
}

function aero_h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function aero_flag($value): bool
{
    return $value === true || $value === 1 || $value === '1' || $value === 't' || $value === 'true';
}

function aero_categories(): array
{
    return [
        'piston-engine-oil' => 'Piston Engine Oils',
        'turbine-engine-oil' => 'Turbine Engine Oils',
        'aviation-greases' => 'Aviation Greases',
        'hydraulic-fluids' => 'Hydraulic Fluids',
        'speciality-fluids' => 'Specialty Fluids',
        'aviation-tyres' => 'Aviation Tyres',
        'aerospace-tapes-and-protection-films' => 'Aerospace Tapes & Protection Films',
        'adhesives-and-sealants' => 'Adhesives & Sealants',
        'cleaners-and-degreasers' => 'Cleaners & Degreasers',
        'aircraft-spares' => 'Aircraft Spares',
    ];
}

function aero_json_list($value): array
{
    if (is_array($value)) {
        return array_values(array_filter(array_map('strval', $value), static fn ($item) => $item !== ''));
    }
    if (!is_string($value) || $value === '') {
        return [];
    }
    $decoded = json_decode($value, true);
    return is_array($decoded) ? aero_json_list($decoded) : [];
}
