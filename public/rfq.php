<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /contact');
    exit;
}

if (!empty($_POST['company_website'])) {
    header('Location: /rfq-sent');
    exit;
}

function field(string $key, int $max = 300): string
{
    $value = isset($_POST[$key]) ? (string) $_POST[$key] : '';
    $value = trim(str_replace(["\r", "\n"], ' ', $value));
    if (strlen($value) > $max) {
        $value = substr($value, 0, $max);
    }
    return $value;
}

$name = field('name');
$company = field('company');
$email = field('email');
$phoneCode = field('phone_code', 12);
$phoneNumber = field('phone');
$phone = trim($phoneCode . ' ' . $phoneNumber);
$product = field('product', 80);
$quoteItems = field('quote_items', 4000);
$message = trim((string) ($_POST['message'] ?? ''));
$message = str_replace("\0", '', $message);
if (strlen($message) > 5000) {
    $message = substr($message, 0, 5000);
}

if ($name === '' || $company === '' || $phoneNumber === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: /rfq-error');
    exit;
}

$storedName = null;
$file = $_FILES['document'] ?? null;
$attachment = null;
if (is_array($file) && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        header('Location: /rfq-error');
        exit;
    }
    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0 || $size > 10 * 1024 * 1024) {
        header('Location: /rfq-error');
        exit;
    }
    $original = basename(str_replace(["\r", "\n", '"'], '', (string) ($file['name'] ?? 'document')));
    $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    $allowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'png', 'jpg', 'jpeg'];
    if (!in_array($ext, $allowed, true) || !is_uploaded_file((string) $file['tmp_name'])) {
        header('Location: /rfq-error');
        exit;
    }
    $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $original) ?: ('document.' . $ext);
    $dir = __DIR__ . '/uploads/rfq';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        header('Location: /rfq-error');
        exit;
    }
    $storedName = date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '-' . $safeName;
    if (!move_uploaded_file((string) $file['tmp_name'], $dir . '/' . $storedName)) {
        header('Location: /rfq-error');
        exit;
    }
    $binary = file_get_contents($dir . '/' . $storedName);
    if ($binary !== false) {
        $attachment = [$safeName, $binary];
    }
}

$config = aero_config() ?? [];
$to = (string) ($config['mail_to'] ?? 'sales@aerofluxglobal.com');
$subject = 'RFQ from ' . $company;
$text = implode("\n", [
    'New RFQ from the AeroFlux Global website',
    '',
    'Name: ' . $name,
    'Company: ' . $company,
    'Email: ' . $email,
    'Phone: ' . $phone,
    'Product: ' . $product,
    'Quote list: ' . $quoteItems,
    '',
    $message,
]);

$pdo = aero_pdo();
$saved = false;
$submissionId = 0;
if ($pdo instanceof PDO) {
    $statement = $pdo->prepare(
        'INSERT INTO rfq_submissions (name, company, email, phone, product, quote_items, message, attachment_path, mail_sent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)'
    );
    $statement->execute([$name, $company, $email, $phone, $product, $quoteItems, $message, $storedName]);
    $submissionId = (int) $pdo->lastInsertId();
    $saved = $submissionId > 0;
}

$sent = aero_send_mail($to, $subject, $text, $attachment, $name, $email);
if ($sent && $pdo instanceof PDO && $submissionId > 0) {
    $pdo->prepare('UPDATE rfq_submissions SET mail_sent = 1 WHERE id = ?')->execute([$submissionId]);
}

if ($saved || $sent) {
    header('Location: /rfq-sent');
    exit;
}

header('Location: /rfq-error');
exit;
