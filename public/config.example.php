<?php
/**
 * Copy to private/aeroflux.php one level above public_html.
 * Neon host is the endpoint hostname only, for example ep-xxxx.region.aws.neon.tech.
 * Generate the password hash on the server:
 *   php -r "echo password_hash('your-password', PASSWORD_DEFAULT), PHP_EOL;"
 */
return [
    'db_host' => 'ep-xxxx.region.aws.neon.tech',
    'db_port' => '5432',
    'db_name' => 'neondb',
    'db_user' => 'neondb_owner',
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
