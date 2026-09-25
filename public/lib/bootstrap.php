<?php
declare(strict_types=1);

function aero_config(): ?array
{
    static $loaded = false;
    static $config = null;
    if ($loaded) {
        return $config;
    }
    $loaded = true;
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
            'mysql:host=' . ($config['db_host'] ?? 'localhost') . ';dbname=' . $config['db_name'] . ';charset=utf8mb4',
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
