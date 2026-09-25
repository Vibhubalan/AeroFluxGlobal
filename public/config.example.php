<?php
/**
 * Copy to config.php (same folder) or to ../private/aeroflux.php
 * and fill in Hostinger MySQL + mailbox details.
 * Generate the password hash on the server:
 *   php -r "echo password_hash('your-password', PASSWORD_DEFAULT), PHP_EOL;"
 */
return [
    'db_host' => 'localhost',
    'db_name' => 'u000000_aeroflux',
    'db_user' => 'u000000_aeroflux',
    'db_pass' => 'change-me',

    'mail_from' => 'sales@aerofluxglobal.com',
    'mail_to' => 'sales@aerofluxglobal.com',
    'resend_api_key' => '',
    'smtp_host' => 'smtp.hostinger.com',
    'smtp_port' => 587,
    'smtp_user' => 'sales@aerofluxglobal.com',
    'smtp_pass' => '',

    'admin_user' => 'desk',
    'admin_password_hash' => '',

    'r2_account_id' => '',
    'r2_access_key' => '',
    'r2_secret_key' => '',
    'r2_bucket' => '',
    'r2_public_url' => '',
];
