<?php
/**
 * ALED08 : traitement du formulaire de demande de devis.
 * Compatible hébergements mutualisés (o2switch, OVH, IONOS…) disposant de la fonction mail().
 * L'adresse de destination est injectée au build depuis src/config.js.
 */
declare(strict_types=1);

const DEST = 'alx.poquet@gmail.com';
const SITE = 'https://www.aled08.fr';

function back(string $path): void {
    header('Location: ' . $path, true, 303);
    exit;
}
function field(string $name, int $max = 500): string {
    $v = $_POST[$name] ?? '';
    if (is_array($v)) { $v = implode(', ', array_map('strval', $v)); }
    $v = trim(strip_tags((string) $v));
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    return mb_substr($v, 0, $max);
}
function oneLine(string $v): string {
    return trim(preg_replace('/[\r\n\t]+/', ' ', $v));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { back('/contact/'); }

$errorUrl = '/contact/?erreur=1#devis';

// Anti-spam : champ piège rempli ou envoi trop rapide (< 3 s après l'affichage)
if (field('site_web') !== '') { back('/merci/'); }
$t = (int) field('_t', 20);
if ($t > 0 && (microtime(true) * 1000 - $t) < 3000) { back('/merci/'); }

$nom       = oneLine(field('nom', 120));
$email     = oneLine(field('email', 150));
$telephone = oneLine(field('telephone', 30));
$type      = oneLine(field('type', 80));
$forfait   = oneLine(field('forfait', 40));
$paiement  = oneLine(field('paiement', 40));
$domaine   = oneLine(field('domaine', 120));
$message   = field('message', 5000);
$consent   = field('consentement', 5);

if ($nom === '' || $message === '' || $type === '' || $consent !== 'oui') { back($errorUrl); }
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { back($errorUrl); }
if ($telephone !== '' && !preg_match('/^[0-9 +().-]{6,20}$/', $telephone)) { $telephone = 'invalide : ' . $telephone; }

$sujet = 'Demande : ' . $type . ($forfait && $forfait !== 'Je ne sais pas encore' ? ', forfait ' . $forfait : '') . ' (' . $nom . ')';

$corps = "Nouvelle demande reçue depuis le site " . SITE . "\n\n"
    . "Nom         : $nom\n"
    . "E-mail      : $email\n"
    . "Téléphone   : " . ($telephone ?: 'non renseigné') . "\n"
    . "Site        : $type\n"
    . "Forfait     : " . ($forfait ?: 'non précisé') . "\n"
    . "Paiement    : " . ($paiement ?: 'non précisé') . "\n"
    . "Domaine     : " . ($domaine ?: 'non précisé') . "\n"
    . "\nMessage :\n$message\n\n"
    . "---\nConsentement RGPD : oui, le " . date('d/m/Y H:i') . "\n";

$host = preg_replace('/^www\./', '', parse_url(SITE, PHP_URL_HOST) ?: 'localhost');
$headers = [
    'From: ALED08 site web <no-reply@' . $host . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: ALED08',
];

$ok = mail(DEST, '=?UTF-8?B?' . base64_encode($sujet) . '?=', $corps, implode("\r\n", $headers));
back($ok ? '/merci/' : $errorUrl);
