<?php
// Formulaire de contact : envoie la demande par e-mail à l'adresse de config.php.
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
$json = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;
$fin = function ($ok) use ($json) {
    if ($json) { echo json_encode(['ok' => $ok]); exit; }
    header('Content-Type: text/html; charset=utf-8');
    header('Location: /' . ($ok ? '?envoye=1' : '?erreur=1') . '#contact', true, 303); exit;
};
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') $fin(false);
if (!empty($_POST['site'])) $fin(true); // robot : on fait semblant
$cfg = require __DIR__ . '/config.php';
$dest = trim($cfg['destinataire'] ?? '');
$propre = function ($v, $max) { return mb_substr(trim(str_replace(["\r", "\n"], ' ', (string) $v)), 0, $max); };
$nom = $propre($_POST['nom'] ?? '', 80);
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$theme = $propre($_POST['theme'] ?? '', 60);
$msg = mb_substr(trim((string) ($_POST['message'] ?? '')), 0, 2000);
if (!$dest || $nom === '' || !$email || $msg === '') $fin(false);
$corps = "Nom : $nom\nE-mail : $email\nThème : $theme\n\n$msg\n";
$entetes = "From: Les Notes du Temps <no-reply@lesnotesdutemps.fr>\r\nReply-To: $email\r\nContent-Type: text/plain; charset=utf-8";
$ok = mail($dest, '=?UTF-8?B?' . base64_encode('Nouvelle demande : ' . $theme) . '?=', $corps, $entetes);
$fin((bool) $ok);
