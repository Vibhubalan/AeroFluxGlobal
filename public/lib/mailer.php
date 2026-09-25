<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function aero_send_mail(string $to, string $subject, string $text, ?array $attachment, string $replyName, string $replyEmail): bool
{
    $config = aero_config() ?? [];
    $from = (string) ($config['mail_from'] ?? 'sales@aerofluxglobal.com');
    if (($config['resend_api_key'] ?? '') !== '') {
        return aero_resend_send($config, $from, $to, $subject, $text, $attachment, $replyName, $replyEmail);
    }
    if (($config['smtp_pass'] ?? '') !== '' && ($config['smtp_user'] ?? '') !== '') {
        return aero_smtp_send($config, $from, $to, $subject, $text, $attachment, $replyName, $replyEmail);
    }
    return aero_php_mail($from, $to, $subject, $text, $attachment, $replyName, $replyEmail);
}

function aero_resend_send(array $config, string $from, string $to, string $subject, string $text, ?array $attachment, string $replyName, string $replyEmail): bool
{
    $payload = [
        'from' => 'AeroFlux Global <' . $from . '>',
        'to' => [$to],
        'reply_to' => $replyName . ' <' . $replyEmail . '>',
        'subject' => $subject,
        'text' => $text,
    ];
    if ($attachment !== null) {
        $payload['attachments'] = [[
            'filename' => $attachment[0],
            'content' => base64_encode($attachment[1]),
        ]];
    }
    $handle = curl_init('https://api.resend.com/emails');
    if ($handle === false) {
        return false;
    }
    curl_setopt_array($handle, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $config['resend_api_key'],
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 20,
    ]);
    $response = curl_exec($handle);
    $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
    curl_close($handle);
    return $response !== false && $status >= 200 && $status < 300;
}

function aero_php_mail(string $from, string $to, string $subject, string $text, ?array $attachment, string $replyName, string $replyEmail): bool
{
    $replyName = str_replace(['<', '>', '"'], '', $replyName);
    $headers = [
        'From: AeroFlux Global <' . $from . '>',
        'Reply-To: ' . $replyName . ' <' . $replyEmail . '>',
        'MIME-Version: 1.0',
    ];
    if ($attachment === null) {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $body = $text;
    } else {
        $boundary = 'AF_' . bin2hex(random_bytes(8));
        $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';
        $body = "--{$boundary}\r\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
        $body .= $text . "\r\n";
        $body .= "--{$boundary}\r\n";
        $body .= 'Content-Type: application/octet-stream; name="' . $attachment[0] . "\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n";
        $body .= 'Content-Disposition: attachment; filename="' . $attachment[0] . "\"\r\n\r\n";
        $body .= chunk_split(base64_encode($attachment[1])) . "\r\n";
        $body .= "--{$boundary}--";
    }
    return mail($to, $subject, $body, implode("\r\n", $headers), '-f' . $from);
}

function aero_smtp_send(array $config, string $from, string $to, string $subject, string $text, ?array $attachment, string $replyName, string $replyEmail): bool
{
    $host = (string) ($config['smtp_host'] ?? 'smtp.hostinger.com');
    $port = (int) ($config['smtp_port'] ?? 587);
    $user = (string) $config['smtp_user'];
    $pass = (string) $config['smtp_pass'];
    $socket = @stream_socket_client('tcp://' . $host . ':' . $port, $errno, $error, 20);
    if (!$socket) {
        return false;
    }
    stream_set_timeout($socket, 20);
    $read = static function () use ($socket): string {
        $data = '';
        while ($line = fgets($socket, 515)) {
            $data .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $data;
    };
    $write = static function (string $command) use ($socket, $read): string {
        fwrite($socket, $command . "\r\n");
        return $read();
    };
    $greeting = $read();
    if (!str_starts_with($greeting, '220')) {
        fclose($socket);
        return false;
    }
    $write('EHLO aerofluxglobal.com');
    $tls = $write('STARTTLS');
    if (!str_starts_with($tls, '220') || !stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        fclose($socket);
        return false;
    }
    $write('EHLO aerofluxglobal.com');
    $write('AUTH LOGIN');
    $write(base64_encode($user));
    $auth = $write(base64_encode($pass));
    if (!str_starts_with($auth, '235')) {
        fclose($socket);
        return false;
    }
    $write('MAIL FROM:<' . $from . '>');
    $rcpt = $write('RCPT TO:<' . $to . '>');
    if (!str_starts_with($rcpt, '250')) {
        fclose($socket);
        return false;
    }
    $write('DATA');
    $replyName = str_replace(['<', '>', '"', "\r", "\n"], '', $replyName);
    $headers = [
        'From: AeroFlux Global <' . $from . '>',
        'To: <' . $to . '>',
        'Reply-To: ' . $replyName . ' <' . $replyEmail . '>',
        'Subject: ' . aero_smtp_header($subject),
        'MIME-Version: 1.0',
    ];
    if ($attachment === null) {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $payload = implode("\r\n", $headers) . "\r\n\r\n" . aero_smtp_dot($text);
    } else {
        $boundary = 'AF_' . bin2hex(random_bytes(8));
        $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';
        $payload = implode("\r\n", $headers) . "\r\n\r\n";
        $payload .= "--{$boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" . aero_smtp_dot($text) . "\r\n";
        $payload .= "--{$boundary}\r\n";
        $payload .= 'Content-Type: application/octet-stream; name="' . $attachment[0] . "\"\r\n";
        $payload .= "Content-Transfer-Encoding: base64\r\n";
        $payload .= 'Content-Disposition: attachment; filename="' . $attachment[0] . "\"\r\n\r\n";
        $payload .= chunk_split(base64_encode($attachment[1])) . "\r\n--{$boundary}--";
    }
    fwrite($socket, $payload . "\r\n.\r\n");
    $sent = $read();
    $write('QUIT');
    fclose($socket);
    return str_starts_with($sent, '250');
}

function aero_smtp_header(string $value): string
{
    return str_replace(["\r", "\n"], '', $value);
}

function aero_smtp_dot(string $value): string
{
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $lines = explode("\n", $value);
    foreach ($lines as &$line) {
        if (str_starts_with($line, '.')) {
            $line = '.' . $line;
        }
    }
    return implode("\r\n", $lines);
}
