<?php
/**
 * ALED08 : traitement des formulaires de contact et de devis.
 * Compatible hébergements mutualisés (OVH, o2switch, IONOS…) disposant de la fonction mail().
 * L'adresse de destination est injectée au build depuis src/config.js.
 */
declare(strict_types=1);

const DEST = '__EMAIL__';
const SITE = '__SITE__';

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

$type = field('type', 20) === 'devis' ? 'devis' : 'contact';
$errorUrl = '/' . $type . '/?erreur=1';

// Anti-spam : champ piège rempli ou envoi trop rapide (< 3 s après l'affichage)
if (field('site_web') !== '') { back('/merci/'); }
$t = (int) field('_t', 20);
if ($t > 0 && (microtime(true) * 1000 - $t) < 3000) { back('/merci/'); }

$nom       = oneLine(field('nom', 120));
$telephone = oneLine(field('telephone', 30));
$email     = oneLine(field('email', 150));
$commune   = oneLine(field('commune', 120));
$adresse   = oneLine(field('adresse', 200));
$message   = field('message', 5000);
$prestation = oneLine(field('prestation', 80));
$urgence   = oneLine(field('urgence', 40));
$creneaux  = oneLine(field('creneaux', 120));
$consent   = field('consentement', 5);

if ($nom === '' || $message === '' || $consent !== 'oui') { back($errorUrl); }
if (!preg_match('/^[0-9 +().-]{10,20}$/', $telephone)) { back($errorUrl); }
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) { back($errorUrl); }

$sujet = $type === 'devis'
    ? 'Demande de devis : ' . ($prestation ?: 'prestation') . ', ' . ($commune ?: 'commune non précisée')
    : 'Message de contact : ' . $nom;

$corps = "Nouvelle demande reçue depuis le site " . SITE . "\n\n"
    . "Type        : " . ($type === 'devis' ? 'Demande de devis' : 'Contact') . "\n"
    . "Nom         : $nom\n"
    . "Téléphone   : $telephone\n"
    . "E-mail      : " . ($email ?: 'non renseigné') . "\n"
    . "Commune     : " . ($commune ?: 'non renseignée') . "\n"
    . ($adresse ? "Adresse     : $adresse\n" : '')
    . ($prestation ? "Prestation  : $prestation\n" : '')
    . ($urgence ? "Urgence     : $urgence\n" : '')
    . ($creneaux ? "Créneaux    : $creneaux\n" : '')
    . "\nMessage :\n$message\n\n"
    . "---\nConsentement RGPD : oui, le " . date('d/m/Y H:i') . "\n";

$host = preg_replace('/^www\./', '', parse_url(SITE, PHP_URL_HOST) ?: 'localhost');
$headers = [
    'From: ALED08 site web <no-reply@' . $host . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: ALED08',
];
if ($email !== '') { $headers[] = 'Reply-To: ' . $email; }

$ok = mail(DEST, '=?UTF-8?B?' . base64_encode($sujet) . '?=', $corps, implode("\r\n", $headers));
back($ok ? '/merci/' : $errorUrl);
