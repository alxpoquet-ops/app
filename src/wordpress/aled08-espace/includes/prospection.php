<?php
/**
 * Les Minis Monstres Espace client : la prospection par e-mail (décision d'Alex, 25 novembre 2026). ÉTEINTE PAR DÉFAUT.
 *
 * Deux agents de plus (tâches planifiées, comme le constructeur, le contrôleur et Jarvis) :
 *   - le Repéreur : trouve, partout en France, des TPE, artisans, commerçants, indépendants et associations sans site internet,
 *     avec une adresse e-mail publiée par l'entreprise elle-même, et les ajoute ici ;
 *   - le Facteur  : relit chaque prospect trouvé (l'œil neuf), puis écrit le mail, dans la limite du quota du jour.
 *     Une seule relance, au moins 7 jours après, puis plus rien.
 * L'agent ne fournit jamais de HTML : il donne quelques morceaux de texte (sujet, phrase vraie, trois points du métier) et
 * c'est ce fichier qui fabrique le mail validé par Alex (logo, offre, code personnel, pied légal, désinscription en un clic).
 *
 * Les garde-fous (conditions de la CNIL pour écrire à des professionnels sans leur accord préalable) : une adresse
 * professionnelle publiée par l'entreprise elle-même, une offre liée à son métier, l'identité de l'expéditeur, la source de
 * l'adresse et la désinscription en un clic dans chaque mail. La liste d'opposition (empreintes des adresses et des SIREN)
 * reste même quand un prospect est effacé : on ne réécrit jamais à quelqu'un qui a dit non.
 * Les règles des agents : .claude/skills/nouveau-site/regles/prospection.md, agent-repereur.md, agent-facteur.md.
 *
 * L'offre (décision d'Alex, 25 novembre 2026, soir) : LA MÊME QUE POUR TOUT LE MONDE, le prix de lancement du site
 * (data.json « lancement »). Plus de code de réduction : data.json « prospection » a remise 0. (Si remise repasse au-dessus
 * de 0, le code personnel MAIL10-7KQ2 revient tout seul, accepté « jours » jours après l'envoi.) Une commande passée avec
 * l'adresse e-mail du prospect le marque « commande ».
 *
 * La suite (includes/prospection-suite.php) : l'aperçu personnalisé du site pour les meilleurs prospects, la relance plus
 * tôt pour ceux qui ont cliqué, ce qui marche le mieux (par métier, département, type de sujet), le Répondeur (qui lit
 * les réponses), le débrief du soir pour Alex et la mise en pause automatique si trop de refus.
 *
 * Réglages (options) :
 *   aled08_prospection_active        '0' (défaut) ou '1' : rien ne part tant que ce n'est pas '1'
 *   aled08_prospection_quota_depart  20 : envois par jour la première semaine (les relances comptent)
 *   aled08_prospection_quota_max     150 : plafond ; le quota monte de 20 chaque semaine depuis le premier envoi
 *   30 envois par heure au plus, en semaine de 8 h à 18 h (heure du site), et seulement quand le site et les ventes sont ouverts.
 *
 * Routes (administrateur, comme l'atelier) :
 *   POST /aled08/v1/atelier/prospects  {prospects: [...], zone: {departement, metier}}   ajouter (le Repéreur)
 *   GET  /aled08/v1/atelier/prospects  ?etat=&q=&limite=&page=                            la liste et le résumé
 *   POST /aled08/v1/atelier/prospect   {prospect, faire, ...}   retenir, envoyer, relancer, ecarter, repondu, desinscrire, apercu, essai
 *   GET  /aled08/v1/atelier/poste?agent=repereur|facteur       (includes/agents.php) la fiche de poste et le travail
 * Pages publiques (sans connexion, liens signés) : /?lmm_stop=… (désinscription) et /?lmm_px=… (un clic noté, puis la page).
 */
defined('ABSPATH') || exit;

define('ALED08E_PX_HEURE_MAX', 30);   // envois par heure, au plus
define('ALED08E_PX_PALIER', 20);      // le quota monte de 20 chaque semaine
define('ALED08E_PX_NOTE_MIN', 60);    // en dessous : écarté

/* ====================================================================== réglages et offre */
function aled08e_px_active() { return get_option('aled08_prospection_active', '0') === '1'; }
/* La collecte seule (option aled08_prospection_collecte = '1') : on peut enregistrer des prospects pour plus tard pendant
 * que la prospection est éteinte. Rien ne part : l'envoi, lui, demande toujours aled08_prospection_active. */
function aled08e_px_collecte() { return aled08e_px_active() || get_option('aled08_prospection_collecte', '0') === '1'; }
/* Les envois demandent aussi un site ouvert et des ventes ouvertes : on ne promet pas un code qu'on ne pourrait pas honorer */
function aled08e_px_site_pret() { return get_option('aled08_site_ouvert', '0') === '1' && get_option('aled08_ventes_ouvertes', '0') === '1'; }
/* En semaine, de 8 h à 18 h, heure du site : on écrit à des professionnels pendant leurs heures de travail */
function aled08e_px_heure_ok($t = null) {
    $t = $t ?? time();
    $j = (int) wp_date('N', $t);
    $h = (int) wp_date('G', $t);
    return (bool) apply_filters('aled08e_px_heure_ok', $j <= 5 && $h >= 8 && $h < 18, $t);
}
function aled08e_px_offre() {
    $p = (array) (aled08e_data()['prospection'] ?? []);
    return ['remise' => max(0, min(50, (int) ($p['remise'] ?? 0))), 'jours' => max(1, min(90, (int) ($p['jours'] ?? 30))), 'relance' => max(1, min(30, (int) ($p['relanceJours'] ?? 7))),
        'relance_clic' => max(1, min(30, (int) ($p['relanceClicJours'] ?? 3))), 'apercu_note' => max(0, min(101, (int) ($p['apercuNote'] ?? 80)))];
}
/* L'offre de lancement du site, la même que pour tout le monde : la date de fin et le prix d'après. null quand elle est finie. */
function aled08e_px_lancement() {
    $D = aled08e_data();
    $l = (array) ($D['lancement'] ?? []);
    $normal = (float) ($D['creation']['prixNormal'] ?? 0);
    if (empty($l['actif']) || empty($l['jusquauTexte']) || $normal <= 0) return null;
    if (!empty($l['jusquau'])) { $fin = date_create($l['jusquau'] . ' 23:59:59', wp_timezone()); if ($fin && time() > $fin->getTimestamp()) return null; }
    return ['jusquau' => (string) $l['jusquauTexte'], 'normal' => $normal];
}
/* L'offre en une phrase (espace de gestion, débrief, poste des agents) */
function aled08e_px_offre_txt() {
    $prix = aled08e_px_prix();
    $l = aled08e_px_lancement();
    $t = aled08e_euro_txt($prix['prix']) . ' la création du site' . ($l ? ', prix de lancement jusqu’au ' . $l['jusquau'] . ', puis ' . aled08e_euro_txt($l['normal']) : '');
    if (aled08e_px_remise() > 0) $t .= ' ; avec le code personnel du mail : -' . aled08e_px_remise() . ' %, soit ' . aled08e_euro_txt($prix['reduit']);
    return $t;
}
/* « 4 à 5 » fois moins cher qu'une agence : le prix d'entrée d'une agence (data.json « marche.agenceMin ») divisé par notre prix
 * après l'offre de lancement, puis par notre prix d'aujourd'hui, arrondis vers le bas. '' si on ne peut pas le dire. */
function aled08e_px_fois_agence() {
    $min = (float) (aled08e_data()['marche']['agenceMin'] ?? 0);
    $prix = (float) aled08e_px_prix()['prix'];
    $l = aled08e_px_lancement();
    $apres = $l ? max($prix, (float) $l['normal']) : $prix;
    if ($min <= 0 || $prix <= 0) return '';
    $haut = (int) floor($min / $prix);
    $bas = (int) floor($min / $apres);
    if ($haut < 2) return '';
    return ($bas >= 2 && $bas < $haut) ? $bas . ' à ' . $haut : (string) $haut;
}
/* Ce qui nous distingue, dit dans le mail (Alex, 25 novembre 2026) : c'est moins cher, il y a un suivi, tout appartient au client */
function aled08e_px_atouts() {
    $f = aled08e_px_fois_agence();
    return [
        [$f !== '' ? $f . ' fois moins cher qu’une agence.' : 'Un prix doux.', 'Nos charges sont réduites au maximum, et c’est vous qui en profitez.'],
        // sans parler du forfait Mini (Alex, 25 novembre 2026)
        ['Un vrai suivi, pas seulement un site.', 'Un espace client pour tout suivre, des tutos pour chaque étape, et une bande qui reste à vos côtés.'],
        ['Tout vous appartient.', 'Le site et le nom de domaine sont à vous : vous récupérez votre site quand vous voulez.'],
    ];
}
/* Ce qui est compris dans la création, dit simplement pour le mail (Alex, 26 novembre 2026) */
function aled08e_px_inclus() {
    return [
        'Un site à votre image, adapté au téléphone et à l’ordinateur',
        'Les textes écrits pour vous, à partir de vos réponses',
        'Vos services, vos photos, votre numéro en grand et un formulaire de contact',
        'Les bases pour être bien trouvé sur Google',
        'La mise en ligne complète, en 24 à 48 heures',
        'Un site qui vous appartient : vous le récupérez quand vous voulez',
    ];
}
/* L'hébergement proposé (le forfait Mini, sans le nommer) : prix tirés de la configuration */
function aled08e_px_hebergement() {
    $f = function_exists('aled08e_forfait') ? (array) aled08e_forfait('base') : [];
    $mois = (float) ($f['month'] ?? 10);
    $dom = (float) (aled08e_data()['domainePrix'] ?? 0);
    return 'On peut aussi garder votre site en ligne pour vous : hébergement, sécurité, sauvegardes, mises à jour et vos modifications comprises, pour '
        . aled08e_euro_txt($mois) . ' par mois' . ($dom > 0 ? ' (' . aled08e_euro_txt($mois + $dom) . ' si on vous fournit le nom de domaine)' : '') . '. Sans engagement.';
}
/* Le téléphone pour en parler (data.json « prospection.telephone », donné par Alex) : vide tant qu'il n'est pas réglé */
function aled08e_px_telephone() {
    $t = (string) ((aled08e_data()['prospection'] ?? [])['telephone'] ?? '');
    return preg_match('/^[0-9 +.]{10,20}$/', $t) ? trim($t) : '';
}
/* D'où partent les mails, et où arrivent les réponses. Une adresse d'envoi à part protège les mails des clients :
 * si des prospects signalent nos messages, ce n'est pas l'adresse des clients qui en souffre. */
function aled08e_px_expediteur() { $e = sanitize_email((string) get_option('aled08_prospection_expediteur', '')); return is_email($e) ? $e : aled08e_mail_from(); }
function aled08e_px_reponse() { $e = sanitize_email((string) get_option('aled08_prospection_reponse', '')); return is_email($e) ? $e : aled08e_to(); }
function aled08e_px_remise() { return aled08e_px_offre()['remise']; }
/* Le prix de création du Site Essentiel (data.json), et le prix avec la remise du mail */
function aled08e_px_prix() {
    $t = aled08e_type('une-page');
    $prix = (float) ($t['price'] ?? (aled08e_data()['creation']['prix'] ?? 0));
    return ['prix' => $prix, 'reduit' => round($prix * (100 - aled08e_px_remise()) / 100, 2)];
}
function aled08e_px_etats() {
    return ['nouveau' => 'Trouvé, à vérifier', 'a_ecrire' => 'Vérifié, à écrire', 'envoye' => 'Écrit', 'relance' => 'Relancé', 'repondu' => 'A répondu',
        'desinscrit' => 'Désinscrit', 'commande' => 'A commandé', 'ecarte' => 'Écarté'];
}

/* ====================================================================== le quota */
function aled08e_px_quota_jour($now = null) {
    $now = $now ?? time();
    $depart = max(0, (int) get_option('aled08_prospection_quota_depart', 20));
    $max = max($depart, (int) get_option('aled08_prospection_quota_max', 150));
    $premier = (int) get_option('aled08_prospection_premier_envoi', 0);
    $semaines = $premier ? (int) floor(max(0, $now - $premier) / WEEK_IN_SECONDS) : 0;
    return (int) min($max, $depart + ALED08E_PX_PALIER * $semaines);
}
/* Les compteurs du jour (envois, relances, clics, réponses, désinscriptions, commandes), gardés 120 jours */
function aled08e_px_stats() { $s = get_option('aled08_prospection_stats', []); return is_array($s) ? $s : []; }
function aled08e_px_stat($quoi, $n = 1) {
    $s = aled08e_px_stats();
    $j = wp_date('Y-m-d');
    $s[$j][$quoi] = (int) ($s[$j][$quoi] ?? 0) + (int) $n;
    ksort($s);
    update_option('aled08_prospection_stats', array_slice($s, -120, null, true), false);
}
/* La somme des compteurs sur les $jours derniers jours (aujourd'hui compris) */
function aled08e_px_stats_sur($jours) {
    $depuis = wp_date('Y-m-d', time() - (max(1, (int) $jours) - 1) * DAY_IN_SECONDS);
    $out = ['envois' => 0, 'relances' => 0, 'clics_demo' => 0, 'clics_site' => 0, 'clics_apercu' => 0, 'repondus' => 0, 'interesses' => 0, 'brouillons' => 0, 'desinscrits' => 0, 'rebonds' => 0, 'commandes' => 0, 'ajoutes' => 0, 'ecartes' => 0];
    foreach (aled08e_px_stats() as $j => $c) if ($j >= $depuis) foreach ((array) $c as $k => $v) $out[$k] = (int) ($out[$k] ?? 0) + (int) $v;
    return $out;
}
function aled08e_px_envoyes_aujourdhui() { $c = aled08e_px_stats_sur(1); return (int) $c['envois'] + (int) $c['relances']; }
/* Les heures d'envoi de la dernière journée : pour ne pas dépasser 30 envois par heure */
function aled08e_px_envois_recents() {
    $l = get_option('aled08_prospection_envois', []);
    $l = is_array($l) ? array_map('intval', $l) : [];
    return array_values(array_filter($l, function ($t) { return $t > time() - DAY_IN_SECONDS; }));
}
function aled08e_px_envois_heure() { return count(array_filter(aled08e_px_envois_recents(), function ($t) { return $t > time() - HOUR_IN_SECONDS; })); }
/* Minutes à attendre avant le prochain envoi possible dans l'heure (0 : tout de suite) */
function aled08e_px_attente_minutes() {
    $h = array_values(array_filter(aled08e_px_envois_recents(), function ($t) { return $t > time() - HOUR_IN_SECONDS; }));
    if (count($h) < ALED08E_PX_HEURE_MAX) return 0;
    sort($h);
    return max(1, (int) ceil(($h[count($h) - ALED08E_PX_HEURE_MAX] + HOUR_IN_SECONDS - time()) / 60));
}
function aled08e_px_noter_envoi() {
    $l = aled08e_px_envois_recents();
    $l[] = time();
    update_option('aled08_prospection_envois', array_slice($l, -400), false);
    if (!get_option('aled08_prospection_premier_envoi')) update_option('aled08_prospection_premier_envoi', time(), false);
}
function aled08e_px_quota_restant() { return max(0, aled08e_px_quota_jour() - aled08e_px_envoyes_aujourdhui()); }

/* ====================================================================== la liste d'opposition */
/* Des empreintes (jamais l'adresse en clair), avec un sel propre au site : gardées même quand le prospect est effacé */
function aled08e_px_opposition() {
    $o = get_option('aled08_prospection_opposition', []);
    if (!is_array($o) || empty($o['sel'])) {
        $o = ['sel' => wp_generate_password(32, false, false), 'e' => is_array($o['e'] ?? null) ? $o['e'] : []];
        update_option('aled08_prospection_opposition', $o, false);
    }
    return $o;
}
function aled08e_px_empreinte($valeur, $sel) { return substr(hash('sha256', $sel . '|' . $valeur), 0, 32); }
function aled08e_px_norm_email($e) { return strtolower(trim((string) $e)); }
function aled08e_px_norm_siren($s) { return preg_replace('/\D/', '', (string) $s); }
function aled08e_px_oppose($email, $siren = '') {
    $o = aled08e_px_opposition();
    $e = aled08e_px_norm_email($email);
    $s = aled08e_px_norm_siren($siren);
    return ($e !== '' && isset($o['e'][aled08e_px_empreinte('m:' . $e, $o['sel'])])) || ($s !== '' && isset($o['e'][aled08e_px_empreinte('s:' . $s, $o['sel'])]));
}
function aled08e_px_opposer($email, $siren = '') {
    $o = aled08e_px_opposition();
    $e = aled08e_px_norm_email($email);
    $s = aled08e_px_norm_siren($siren);
    if ($e !== '') $o['e'][aled08e_px_empreinte('m:' . $e, $o['sel'])] = wp_date('Y-m-d');
    if ($s !== '') $o['e'][aled08e_px_empreinte('s:' . $s, $o['sel'])] = wp_date('Y-m-d');
    update_option('aled08_prospection_opposition', $o, false);
}

/* ====================================================================== les vérifications à l'ajout */
/* Le SIREN : 9 chiffres et la clé de Luhn (La Poste fait exception) */
function aled08e_px_siren_ok($s) {
    $s = aled08e_px_norm_siren($s);
    if (strlen($s) !== 9) return false;
    if ($s === '356000000') return true;
    $somme = 0;
    for ($i = 0; $i < 9; $i++) { $d = (int) $s[$i]; if ($i % 2 === 1) { $d *= 2; if ($d > 9) $d -= 9; } $somme += $d; }
    return $somme % 10 === 0;
}
/* Les départements, dans l'ordre de la tournée : les Ardennes d'abord, puis tous les autres */
function aled08e_px_departements() {
    $l = [];
    for ($i = 1; $i <= 95; $i++) { if ($i === 20) { $l[] = '2A'; $l[] = '2B'; continue; } $l[] = sprintf('%02d', $i); }
    $l = array_merge($l, ['971', '972', '973', '974', '976']);
    return array_values(array_unique(array_merge(['08'], $l)));
}
function aled08e_px_departement_ok($d) { return in_array(strtoupper((string) $d), aled08e_px_departements(), true); }
/* Les messageries grand public : une adresse chez elles n'est acceptée que pour une entreprise individuelle, ou si elle porte
 * le nom de l'entreprise (boulangerie.martin@gmail.com) : c'est alors clairement l'adresse de l'entreprise, pas celle d'un particulier. */
function aled08e_px_webmails() {
    return ['gmail.com', 'googlemail.com', 'yahoo.fr', 'yahoo.com', 'ymail.com', 'hotmail.fr', 'hotmail.com', 'outlook.fr', 'outlook.com', 'live.fr', 'live.com', 'msn.com',
        'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr', 'neuf.fr', 'cegetel.net', 'club-internet.fr', 'laposte.net', 'bbox.fr', 'aliceadsl.fr', 'numericable.fr', 'noos.fr',
        'icloud.com', 'me.com', 'mac.com', 'aol.com', 'aol.fr', 'gmx.fr', 'gmx.com', 'gmx.net', 'protonmail.com', 'proton.me', 'mail.com', 'yandex.com', 'tutanota.com'];
}
function aled08e_px_mots($texte) {
    $vides = ['sarl', 'sasu', 'eurl', 'scop', 'snc', 'earl', 'gaec', 'scea', 'societe', 'entreprise', 'etablissements', 'association', 'france', 'services', 'service', 'groupe', 'chez', 'les', 'des', 'and'];
    $t = strtolower(remove_accents((string) $texte));
    $mots = preg_split('/[^a-z0-9]+/', $t, -1, PREG_SPLIT_NO_EMPTY);
    return array_values(array_filter(array_unique($mots), function ($m) use ($vides) { return strlen($m) >= 4 && !in_array($m, $vides, true); }));
}
/* '' si l'adresse est acceptable, sinon la raison du refus */
function aled08e_px_email_refus($email, $p = []) {
    $email = aled08e_px_norm_email($email);
    if ($email === '' || !is_email($email) || substr_count($email, '@') !== 1) return 'adresse e-mail mal formée';
    list($local, $dom) = explode('@', $email);
    if (!preg_match('/^[a-z0-9.-]+\.[a-z]{2,24}$/', $dom)) return 'adresse e-mail mal formée';
    if (preg_match('/^(no-?reply|ne-?pas-?repondre|donotreply|postmaster|abuse|mailer-daemon|dpo|rgpd|gdpr|privacy|unsubscribe)([.+_-]|$)/', $local)) return 'adresse technique (pas une adresse de contact)';
    if (preg_match('/(^|\.)gouv\.fr$|(^|\.)education\.fr$|(^|\.)ac-[a-z-]+\.fr$/', $dom)) return 'adresse d’une administration';
    if (in_array($dom, aled08e_px_webmails(), true) && empty($p['entreprise_individuelle'])) {
        $l = preg_replace('/[^a-z0-9]/', '', $local);
        foreach (aled08e_px_mots(($p['entreprise'] ?? '') . ' ' . ($p['raison_sociale'] ?? '') . ' ' . ($p['metier'] ?? '')) as $m) if (strpos($l, $m) !== false) return '';
        return 'messagerie personnelle (' . $dom . ') pour une société : on n’écrit à une adresse de ce genre que si c’est une entreprise individuelle, ou si l’adresse porte le nom ou le métier de l’entreprise';
    }
    return '';
}
function aled08e_px_url($v) {
    $v = trim((string) $v);
    if ($v === '' || !preg_match('#^https?://#i', $v)) return '';
    $v = esc_url_raw($v, ['http', 'https']);
    return $v && wp_parse_url($v, PHP_URL_HOST) ? $v : '';
}
/* « sa fiche Google », « sa page Facebook »… d'après l'adresse de la source, si le Repéreur ne l'a pas écrit */
function aled08e_px_source_libelle($url) {
    $h = strtolower((string) wp_parse_url($url, PHP_URL_HOST));
    if (preg_match('/(^|\.)google\.|(^|\.)goo\.gl$|maps\.app\.goo\.gl/', $h)) return 'sa fiche Google';
    if (preg_match('/(^|\.)facebook\.com$|(^|\.)fb\.com$/', $h)) return 'sa page Facebook';
    if (preg_match('/(^|\.)instagram\.com$/', $h)) return 'son compte Instagram';
    if (preg_match('/(^|\.)pagesjaunes\.fr$/', $h)) return 'sa fiche PagesJaunes';
    if (preg_match('/(^|\.)etsy\.com$/', $h)) return 'sa boutique Etsy';
    if (preg_match('/(^|\.)marche-des-createurs\.fr$/', $h)) return 'sa fiche sur l’annuaire Marché des Créateurs';
    if (preg_match('/(^|\.)creatrices-et-createurs\.com$/', $h)) return 'sa fiche sur l’annuaire Créatrices et Créateurs';
    return 'la page ' . preg_replace('/^www\./', '', $h);
}
/* Les métiers de nos pages « Votre métier » (data.json) : slug => nom */
function aled08e_px_metiers() {
    $out = [];
    foreach ((array) (aled08e_data()['metiers'] ?? []) as $m) if (!empty($m['slug'])) $out[(string) $m['slug']] = $m;
    return $out;
}
/* Tous les métiers de la tournée : nos pages « Votre métier » (+10 à la note), puis les autres petits métiers dont les
 * clients cherchent sur internet avant de venir (Alex, 25 novembre 2026 : « il y a tellement d'autres entrepreneurs »).
 * Les codes NAF servent à l'API Recherche d'entreprises. Exclus d'office : santé réglementée, droit, tabac, jeux, armes. */
function aled08e_px_autres_metiers() {
    return [
        'autre-coiffure' => ['nom' => 'Coiffeurs, barbiers', 'naf' => ['96.02A']],
        'autre-esthetique' => ['nom' => 'Esthéticiennes, instituts de beauté, ongleries', 'naf' => ['96.02B']],
        'autre-restaurant' => ['nom' => 'Restaurants, cafés, bars', 'naf' => ['56.10A', '56.30Z']],
        'autre-alimentation' => ['nom' => 'Bouchers, charcutiers, poissonniers, primeurs, épiceries fines, cavistes', 'naf' => ['47.22Z', '47.23Z', '47.21Z', '47.29Z', '47.25Z']],
        'autre-batiment' => ['nom' => 'Plaquistes, carreleurs, serruriers, menuisiers métal, ramoneurs', 'naf' => ['43.31Z', '43.33Z', '43.32B', '43.29A', '81.22Z']],
        'autre-auto-ecole' => ['nom' => 'Auto-écoles', 'naf' => ['85.53Z']],
        'autre-taxi' => ['nom' => 'Taxis, VTC', 'naf' => ['49.32Z']],
        'autre-demenagement' => ['nom' => 'Déménageurs, petits transporteurs', 'naf' => ['49.42Z']],
        'autre-immobilier' => ['nom' => 'Agences immobilières indépendantes', 'naf' => ['68.31Z']],
        'autre-reparation' => ['nom' => 'Réparation (informatique, téléphones, électroménager, cordonniers)', 'naf' => ['95.11Z', '95.12Z', '95.21Z', '95.22Z', '95.23Z']],
        'autre-couture' => ['nom' => 'Couturières, retouches, pressings', 'naf' => ['14.13Z', '96.01B']],
        'autre-loisirs' => ['nom' => 'Loisirs, écoles de musique et de danse, cours particuliers', 'naf' => ['85.52Z', '93.29Z', '85.59B']],
        // les petits qu'on ne voit pas (Alex, 25 novembre 2026) : ils vendent sur les foires et les marchés, ou passent par une plateforme
        'autre-createurs' => ['nom' => 'Créateurs et artisans d’art (bijoux, bois, céramique, bougies, savons, textile)', 'naf' => ['32.12Z', '32.13Z', '32.99Z', '23.41Z', '16.29Z', '90.03A', '13.92Z', '14.19Z', '20.42Z']],
        'autre-marches' => ['nom' => 'Vendeurs des marchés, foires et salons', 'naf' => ['47.89Z', '47.81Z', '47.82Z']],
        'autre-producteurs' => ['nom' => 'Petits producteurs (maraîchers, apiculteurs, fromagers, confiseurs)', 'naf' => ['01.13Z', '01.49Z', '10.51C', '10.82Z', '10.52Z', '10.39B']],
        'autre-services-maison' => ['nom' => 'Services à la maison (jardinage, ménage, petits travaux, montage de meubles)', 'naf' => ['81.30Z', '81.21Z', '43.39Z', '43.34Z', '95.24Z']],
    ];
}
/* Les petits qu'on ne voit pas dans l'annuaire en cherchant par métier : où les repérer. Ces pages servent à REPÉRER un nom ;
 * l'e-mail vient toujours d'une page où l'artisan le publie lui-même, et l'entreprise doit exister (SIREN actif). */
function aled08e_px_sources_petits() {
    return [
        ['ou' => 'Les foires, marchés de Noël, marchés de créateurs et salons d’artisans du département, des 12 derniers mois et des 2 mois à venir', 'exemples' => 'sites des mairies et des offices de tourisme, ardennes.com, fest.fr, jds.fr, festivalenfrance.com, evenements-createurs.fr, la liste des exposants publiée par l’organisateur'],
        ['ou' => 'Les annuaires de créateurs, où chacun remplit sa fiche', 'exemples' => 'marche-des-createurs.fr, creatrices-et-createurs.com, marchedesartisanscreateurs.fr, l’annuaire des artisans de la Chambre de métiers'],
        ['ou' => 'Les plateformes de services entre voisins et de mise en relation', 'exemples' => 'AlloVoisins, StarOfService, les services de Leboncoin : comme un simple visiteur, page par page ; seulement les profils « professionnel » ; jamais de message par la plateforme, jamais un robot (interdit par leurs conditions), et l’e-mail n’y est pas : on le cherche ailleurs'],
        ['ou' => 'Les boutiques en ligne sans site à eux', 'exemples' => 'Etsy, Un grand marché, la page Facebook ou Instagram de l’atelier'],
    ];
}
/* La tournée : nos métiers d'abord, puis les autres, dans chaque département */
function aled08e_px_metiers_tournee() {
    $out = [];
    foreach (aled08e_px_metiers() as $slug => $m) $out[$slug] = ['slug' => $slug, 'nom' => (string) ($m['nom'] ?? $slug), 'qui' => (string) ($m['qui'] ?? ''), 'page' => true];
    foreach (aled08e_px_autres_metiers() as $slug => $m) $out[$slug] = ['slug' => $slug, 'nom' => $m['nom'], 'qui' => $m['nom'], 'page' => false, 'naf' => $m['naf']];
    return $out;
}
/* La note sur 100, calculée ici à partir de ce que le Repéreur a constaté (il ne donne pas de chiffre) */
function aled08e_px_note($criteres, $metier_couvert) {
    $c = (array) $criteres;
    $n = 0;
    if (!empty($c['sans_site'])) $n += 40;
    elseif (!empty($c['site_casse'])) $n += 30;
    if (!empty($c['metier_recherche'])) $n += 20;
    if (!empty($c['activite_recente'])) $n += 20;
    if (!empty($c['independante'])) $n += 10;
    if (!empty($c['creation_recente'])) $n += 15; // créée depuis moins de 18 mois : c'est le moment où l'on a besoin d'un site
    if ($metier_couvert) $n += 10;
    return min(100, $n);
}
/* « de la Boulangerie Martin », « du Garage Dupont », « de l'Atelier Lune », « de Plomberie Lefèvre » */
function aled08e_px_de($article, $nom) {
    $a = str_replace("'", '’', (string) $article);
    if ($a === 'le') return 'du ' . $nom;
    if ($a === 'les') return 'des ' . $nom;
    if ($a === 'la') return 'de la ' . $nom;
    if ($a === 'l’') return 'de l’' . $nom;
    return 'de ' . $nom;
}
/* « pour la Boulangerie Martin », « pour le Garage Dupont » */
function aled08e_px_pour($article, $nom) {
    $a = str_replace("'", '’', (string) $article);
    return 'pour ' . ($a === 'l’' ? 'l’' : ($a !== '' ? $a . ' ' : '')) . $nom;
}
function aled08e_px_texte($v, $max) { return mb_substr(trim(preg_replace('/\s+/u', ' ', wp_strip_all_tags((string) $v))), 0, $max); }

/* ====================================================================== les prospects (type de contenu privé « aled08_prospect ») */
/* Le type de contenu est déclaré dans includes/gestion.php (il servait à l'ancienne recherche de prospects, retirée le
 * 17 novembre 2026). Les prospects de la prospection par e-mail se reconnaissent à leur méta _aled08_px_etat. */
function aled08e_px_meta($id, $k, $def = '') { $v = get_post_meta((int) $id, '_aled08_px_' . $k, true); return ($v === '' || $v === false || $v === null) ? $def : $v; }
function aled08e_px_set($id, $k, $v) { update_post_meta((int) $id, '_aled08_px_' . $k, $v); }
function aled08e_px_journal($id, $texte) {
    $j = (array) aled08e_px_meta($id, 'journal', []);
    $j[] = wp_date('j/m/Y H:i') . ' : ' . mb_substr((string) $texte, 0, 300);
    aled08e_px_set($id, 'journal', array_slice($j, -20));
}
function aled08e_px_cherche($k, $v, $etats = []) {
    $q = ['post_type' => ALED08E_CPT_PROSPECT, 'post_status' => 'private', 'numberposts' => 1, 'fields' => 'ids', 'suppress_filters' => true,
        'meta_query' => [['key' => '_aled08_px_' . $k, 'value' => (string) $v]]];
    if ($etats) $q['meta_query'][] = ['key' => '_aled08_px_etat', 'value' => (array) $etats, 'compare' => 'IN'];
    $l = get_posts($q);
    return $l ? (int) $l[0] : 0;
}
function aled08e_px_par_code($code) { $c = aled08e_clean_code($code); return $c === '' ? 0 : aled08e_px_cherche('code', $c); }
function aled08e_px_get($id) {
    $p = get_post((int) $id);
    if (!$p || $p->post_type !== ALED08E_CPT_PROSPECT || aled08e_px_meta($p->ID, 'etat') === '') return null;
    $id = (int) $p->ID;
    $m = function ($k, $d = '') use ($id) { return aled08e_px_meta($id, $k, $d); };
    $env = (int) $m('envoye_le', 0);
    $rel = (int) $m('relance_le', 0);
    $offre = aled08e_px_offre();
    return [
        'prospect' => $id, 'entreprise' => $p->post_title, 'article' => (string) $m('article'), 'raison_sociale' => (string) $m('raison_sociale'),
        'metier' => (string) $m('metier'), 'metier_page' => (string) $m('metier_page'), 'ville' => (string) $m('ville'), 'departement' => (string) $m('departement'),
        'siren' => (string) $m('siren'), 'entreprise_individuelle' => (bool) $m('ei', 0), 'email' => (string) $m('email'),
        'url_source_email' => (string) $m('url_source'), 'source' => (string) $m('source'), 'site_actuel' => (string) $m('site_actuel'), 'recherche' => (string) $m('recherche'),
        'note' => (int) $m('note', 0), 'criteres' => (array) $m('criteres', []), 'raisons' => (string) $m('raisons'), 'date_creation' => (string) $m('creation'), 'constat' => (array) $m('constat', []), 'domaine_libre' => (string) $m('domaine_libre'), 'vu_sur' => (string) $m('vu_sur'), 'url_vu_sur' => (string) $m('url_vu_sur'),
        'etat' => (string) $m('etat'), 'etat_libelle' => aled08e_px_etats()[(string) $m('etat')] ?? '',
        'ajoute_le' => get_the_date('Y-m-d H:i', $p), 'verification' => (string) $m('verification'),
        'envoye_le' => $env ? wp_date('Y-m-d H:i', $env) : '', 'relance_le' => $rel ? wp_date('Y-m-d H:i', $rel) : '',
        'relance_possible_le' => ($env && !$rel) ? wp_date('Y-m-d H:i', aled08e_px_relance_quand($id)) : '',
        'code' => (string) $m('code'), 'code_valable_jusqu_au' => $env ? wp_date('Y-m-d', aled08e_px_code_fin($id)) : '',
        'sujet' => (string) $m('sujet'), 'contenu_envoye' => (string) $m('contenu'), 'contenu_relance' => (string) $m('contenu_relance'),
        'clics' => (int) $m('nb_clics', 0), 'clics_detail' => (array) $m('clics', []), 'sujet_type' => (string) $m('sujet_type'),
        'apercu' => function_exists('aled08e_px_apercu_ok') && aled08e_px_apercu_ok($id) ? aled08e_px_apercu_lien($id) : '', 'reponse_avis' => (string) $m('reponse_avis'),
        'commande' => (string) $m('commande_ref'), 'commande_payee' => (bool) $m('commande_payee', 0), 'raison_ecarte' => (string) $m('ecarte_raison'),
        'journal' => (array) $m('journal', []),
    ];
}
/* Quand la relance devient possible : 7 jours après le mail, ou 3 jours quand le prospect a cliqué (démo, aperçu, site) */
function aled08e_px_relance_quand($id) {
    $env = (int) aled08e_px_meta($id, 'envoye_le', 0);
    if (!$env) return 0;
    $o = aled08e_px_offre();
    return $env + ((int) aled08e_px_meta($id, 'nb_clics', 0) > 0 ? min($o['relance_clic'], $o['relance']) : $o['relance']) * DAY_IN_SECONDS;
}
/* La fin de l'offre du mail (et de la période où l'on peut relancer) : 30 jours après l'envoi, jusqu'à la fin de ce jour-là */
function aled08e_px_code_fin($id) {
    $env = (int) aled08e_px_meta($id, 'envoye_le', 0);
    if (!$env) return 0;
    $d = (new DateTime('@' . ($env + aled08e_px_offre()['jours'] * DAY_IN_SECONDS)))->setTimezone(wp_timezone());
    $d->setTime(23, 59, 59);
    return $d->getTimestamp();
}
/* Le code personnel est-il valable ? Rend le numéro du prospect, ou 0. Une commande payée avec lui l'a utilisé. */
function aled08e_px_code_ok($code) {
    $id = aled08e_px_par_code($code);
    if (!$id || !aled08e_px_meta($id, 'envoye_le', 0)) return 0;
    if (time() > aled08e_px_code_fin($id)) return 0;
    if (aled08e_px_meta($id, 'commande_payee', 0)) return 0;
    return $id;
}
/* Un code personnel neuf : MAIL10-7KQ2 (sans 0, O, 1, I, L, pour qu'on le recopie sans se tromper) */
function aled08e_px_code_nouveau() {
    $a = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    $n = 0;
    do {
        $c = 'MAIL' . aled08e_px_remise() . '-';
        for ($i = 0; $i < 4; $i++) $c .= $a[random_int(0, strlen($a) - 1)];
    } while ((aled08e_px_par_code($c) || (function_exists('aled08e_code_evenement_ok') && aled08e_code_evenement_ok($c))) && ++$n < 50);
    return $c;
}

/* ---------- l'ajout d'un prospect (le Repéreur) ---------- */
function aled08e_px_ajouter($d) {
    $d = (array) $d;
    $p = [
        'entreprise' => aled08e_px_texte($d['entreprise'] ?? '', 120), 'article' => in_array(str_replace("'", '’', (string) ($d['article'] ?? '')), ['le', 'la', 'l’', 'les'], true) ? str_replace("'", '’', (string) $d['article']) : '',
        'raison_sociale' => aled08e_px_texte($d['raison_sociale'] ?? '', 160), 'metier' => aled08e_px_texte($d['metier'] ?? '', 80),
        'metier_page' => sanitize_key((string) ($d['metier_page'] ?? '')), 'ville' => aled08e_px_texte($d['ville'] ?? '', 80),
        'departement' => strtoupper(aled08e_px_texte($d['departement'] ?? '', 3)), 'siren' => aled08e_px_norm_siren($d['siren'] ?? ''),
        'entreprise_individuelle' => !empty($d['entreprise_individuelle']), 'email' => aled08e_px_norm_email($d['email'] ?? ''),
        'url_source_email' => aled08e_px_url($d['url_source_email'] ?? ''), 'source' => aled08e_px_texte($d['source'] ?? '', 80),
        'site_actuel' => aled08e_px_url($d['site_actuel'] ?? ''), 'recherche' => aled08e_px_texte($d['recherche'] ?? '', 120),
        'raisons' => aled08e_px_texte($d['raisons'] ?? '', 1200), 'criteres' => [],
        'date_creation' => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($d['date_creation'] ?? '')) ? (string) $d['date_creation'] : '',
        'vu_sur' => aled08e_px_texte($d['vu_sur'] ?? '', 160), 'url_vu_sur' => aled08e_px_url($d['url_vu_sur'] ?? ''),
    ];
    foreach (['sans_site', 'site_casse', 'metier_recherche', 'activite_recente', 'independante'] as $k) $p['criteres'][$k] = !empty($d['criteres'][$k]);
    // l'entreprise récente n'est pas une case à cocher : c'est la date de création de l'annuaire de l'État qui le dit
    $cree = $p['date_creation'] !== '' ? strtotime($p['date_creation'] . ' 12:00:00') : 0;
    $p['criteres']['creation_recente'] = $cree && $cree <= time() && $cree > time() - 548 * DAY_IN_SECONDS;
    $refus = function ($r) use ($p) { return ['ok' => false, 'entreprise' => $p['entreprise'], 'email' => $p['email'], 'refus' => $r]; };
    foreach (['entreprise' => 'le nom de l’entreprise', 'metier' => 'le métier', 'ville' => 'la ville', 'raisons' => 'les raisons (ce que vous avez constaté)'] as $k => $lab) if ($p[$k] === '') return $refus('il manque ' . $lab);
    if (!aled08e_px_departement_ok($p['departement'])) return $refus('département inconnu (01 à 95, 2A, 2B, 971 à 976)');
    if (!aled08e_px_siren_ok($p['siren'])) return $refus('SIREN absent ou faux (9 chiffres, tiré de l’annuaire des entreprises)');
    if ($p['url_source_email'] === '') return $refus('il manque l’adresse de la page où l’entreprise publie elle-même son e-mail (url_source_email)');
    if ($p['vu_sur'] !== '' && $p['url_vu_sur'] === '') return $refus('« vu_sur » sans preuve : donnez l’adresse de la page (url_vu_sur), la liste des exposants ou le profil');
    if (preg_match('/(^|\.)allovoisins?\.(com|fr)$/', strtolower((string) wp_parse_url($p['url_source_email'], PHP_URL_HOST)))) return $refus('AlloVoisins cache les coordonnées de ses membres : l’e-mail doit venir d’une page où l’artisan le publie lui-même');
    $r = aled08e_px_email_refus($p['email'], $p);
    if ($r !== '') return $refus($r);
    if (aled08e_px_oppose($p['email'], $p['siren'])) return $refus('cette entreprise ou cette adresse a demandé à ne plus rien recevoir (liste d’opposition)');
    if (($x = aled08e_px_cherche('email', $p['email'])) || ($x = aled08e_px_cherche('siren', $p['siren']))) return $refus('déjà dans la liste (prospect ' . $x . ', ' . (aled08e_px_etats()[aled08e_px_meta($x, 'etat')] ?? '') . ')');
    if (get_user_by('email', $p['email'])) return $refus('cette adresse a déjà un compte chez nous (client ou ancien client)');
    if ($p['criteres']['site_casse'] && $p['site_actuel'] === '') return $refus('site cassé : donnez son adresse (site_actuel)');
    if ($p['criteres']['sans_site'] && $p['site_actuel'] !== '') $p['criteres']['sans_site'] = false; // un site existe : ce n'est pas « sans site »
    $couvert = $p['metier_page'] !== '' && isset(aled08e_px_metiers()[$p['metier_page']]);
    if (!$couvert) $p['metier_page'] = '';
    $note = aled08e_px_note($p['criteres'], $couvert);
    $etat = $note >= ALED08E_PX_NOTE_MIN ? 'nouveau' : 'ecarte';
    $id = wp_insert_post(['post_type' => ALED08E_CPT_PROSPECT, 'post_status' => 'private', 'post_title' => $p['entreprise'], 'comment_status' => 'closed', 'ping_status' => 'closed'], true);
    if (is_wp_error($id) || !$id) return $refus('enregistrement impossible');
    $metas = ['etat' => $etat, 'article' => $p['article'], 'raison_sociale' => $p['raison_sociale'], 'metier' => $p['metier'], 'metier_page' => $p['metier_page'], 'ville' => $p['ville'],
        'departement' => $p['departement'], 'siren' => $p['siren'], 'ei' => $p['entreprise_individuelle'] ? 1 : 0, 'email' => $p['email'], 'url_source' => $p['url_source_email'],
        'source' => $p['source'] !== '' ? $p['source'] : aled08e_px_source_libelle($p['url_source_email']), 'site_actuel' => $p['site_actuel'], 'recherche' => $p['recherche'],
        'note' => $note, 'criteres' => $p['criteres'], 'raisons' => $p['raisons'], 'nb_clics' => 0, 'creation' => $p['date_creation'], 'vu_sur' => $p['vu_sur'], 'url_vu_sur' => $p['url_vu_sur']];
    if ($etat === 'ecarte') $metas['ecarte_raison'] = 'Note ' . $note . ' sur 100 : sous le seuil de ' . ALED08E_PX_NOTE_MIN . '.';
    foreach ($metas as $k => $v) aled08e_px_set($id, $k, $v);
    aled08e_px_journal($id, 'Trouvé par le Repéreur (note ' . $note . ').');
    aled08e_px_stat($etat === 'ecarte' ? 'ecartes' : 'ajoutes');
    return ['ok' => true, 'prospect' => (int) $id, 'entreprise' => $p['entreprise'], 'etat' => $etat, 'note' => $note];
}

/* ====================================================================== les liens signés (clic et désinscription) */
function aled08e_px_cle() {
    $k = (string) get_option('aled08_prospection_cle', '');
    if (strlen($k) < 32) { $k = wp_generate_password(48, false, false); update_option('aled08_prospection_cle', $k, false); }
    return $k;
}
function aled08e_px_signe($id, $quoi) { return substr(hash_hmac('sha256', 'px|' . (int) $id . '|' . $quoi, aled08e_px_cle()), 0, 20); }
function aled08e_px_destinations() { return ['demo' => home_url('/mon-espace/demo/'), 'site' => home_url('/'), 'creer' => home_url('/creer-mon-site/'), 'realisations' => home_url('/realisations/')]; }
function aled08e_px_lien($id, $quoi) {
    if ($quoi === 'stop') return add_query_arg('lmm_stop', (int) $id . '-' . aled08e_px_signe($id, 'stop'), home_url('/'));
    return add_query_arg('lmm_px', (int) $id . '-' . $quoi . '-' . aled08e_px_signe($id, $quoi), home_url('/'));
}
/* Les liens d'un aperçu ou d'un essai (prospect 0) : ils mènent aux vraies pages, sans rien noter */
function aled08e_px_liens($id) {
    // l'aperçu personnalisé : éteint quand « apercuNote » dépasse 100 (data.json « prospection »), y compris dans un essai
    $apercuOn = function_exists('aled08e_px_apercu_ok') && aled08e_px_offre()['apercu_note'] <= 100;
    $apercu = $apercuOn && (!$id || aled08e_px_apercu_ok($id)) ? aled08e_px_apercu_lien($id) : '';
    if (!$id) return aled08e_px_destinations() + ['stop' => home_url('/'), 'apercu' => $apercu];
    return ['demo' => aled08e_px_lien($id, 'demo'), 'site' => aled08e_px_lien($id, 'site'), 'creer' => aled08e_px_lien($id, 'creer'), 'realisations' => aled08e_px_lien($id, 'realisations'), 'stop' => aled08e_px_lien($id, 'stop'), 'apercu' => $apercu];
}

/* ====================================================================== le mail (gabarit validé par Alex) */
/* Les morceaux de texte de l'agent : '' si tout va bien, sinon ce qui ne va pas. Jamais de HTML, de lien, de prix ni d'IA. */
function aled08e_px_interdits($t) {
    if (preg_match('/\b(IA|AI|I\.A\.)\b/u', $t) || preg_match('/intelligence artificielle|chat ?gpt|\bgpt\b|\bclaude\b|openai|chatbot|\brobots?\b/iu', $t)) return 'on ne parle jamais d’IA ni d’outil automatique';
    if (preg_match('#https?://|www\.|<[a-z/!]#i', $t)) return 'pas de lien ni de balise : la route ajoute elle-même les liens';
    if (preg_match('/\d\s*(€|euros?\b)|€/iu', $t)) return 'pas de prix : le prix vient de la configuration du site';
    if (preg_match('/\b(urgent|gratuit|dernière chance|exceptionnel(le)?)\b/iu', $t)) return 'pas de mot qui presse ou qui promet (urgent, gratuit, exceptionnel…)';
    // la bande parle au « nous » (Alex, 25 novembre 2026 : « on est une famille ») : jamais « je »
    if (preg_match('/(^|[\s«(])(je|moi)(\s|$)|(^|[\s«(])j[’\']\p{L}/iu', $t)) return 'on écrit au nom de la bande, au « nous » (« nous avons trouvé »), jamais « je »';
    return '';
}
function aled08e_px_morceaux($d, $pour = 'envoyer') {
    $d = (array) $d;
    $m = ['sujet' => aled08e_px_texte($d['sujet'] ?? '', 200), 'phrase' => aled08e_px_texte($d['phrase'] ?? '', 600), 'points' => []];
    if ($pour === 'relancer') {
        if (mb_strlen($m['phrase']) > 240) return new WP_Error('aled08_px', 'La phrase de relance fait 240 caractères au plus (une phrase courte et gentille, ou rien).', ['status' => 400]);
        if ($m['phrase'] !== '' && ($x = aled08e_px_interdits($m['phrase'])) !== '') return new WP_Error('aled08_px', 'Phrase refusée : ' . $x . '.', ['status' => 400]);
        return $m;
    }
    $l = mb_strlen($m['sujet']);
    if ($l < 10 || $l > 90) return new WP_Error('aled08_px', 'Le sujet fait de 10 à 90 caractères.', ['status' => 400]);
    if (preg_match_all('/\p{Lu}/u', $m['sujet']) > $l / 2) return new WP_Error('aled08_px', 'Le sujet n’est pas écrit en majuscules.', ['status' => 400]);
    if (preg_match('/^(re|tr|fwd?)\s*:/iu', $m['sujet'])) return new WP_Error('aled08_px', 'Le sujet ne fait pas croire à une réponse (pas de « Re : »).', ['status' => 400]);
    $l = mb_strlen($m['phrase']);
    if ($l < 40 || $l > 320) return new WP_Error('aled08_px', 'La phrase vraie fait de 40 à 320 caractères : ce que vous avez vu, avec le nom de l’entreprise.', ['status' => 400]);
    $points = array_values((array) ($d['points'] ?? []));
    if (count($points) !== 3) return new WP_Error('aled08_px', 'Il faut exactement 3 points (titre, texte, icone).', ['status' => 400]);
    foreach ($points as $i => $pt) {
        $pt = is_array($pt) ? $pt : ['texte' => (string) $pt];
        $ti = aled08e_px_texte($pt['titre'] ?? '', 80);
        $tx = aled08e_px_texte($pt['texte'] ?? '', 200);
        $ic = trim(wp_strip_all_tags((string) ($pt['icone'] ?? '')));
        if (mb_strlen($ti) < 3 || mb_strlen($ti) > 60) return new WP_Error('aled08_px', 'Point ' . ($i + 1) . ' : le titre fait de 3 à 60 caractères.', ['status' => 400]);
        if (mb_strlen($tx) < 10 || mb_strlen($tx) > 140) return new WP_Error('aled08_px', 'Point ' . ($i + 1) . ' : le texte fait de 10 à 140 caractères.', ['status' => 400]);
        // une icône : un ou deux émojis, rien d'autre (sinon une coche)
        if ($ic === '' || strlen($ic) > 16 || preg_match('/[\p{L}\p{N}<>&"\'\s]/u', $ic)) $ic = '✅';
        $m['points'][] = ['icone' => $ic, 'titre' => $ti, 'texte' => $tx];
    }
    foreach (array_merge([$m['sujet'], $m['phrase']], array_column($m['points'], 'titre'), array_column($m['points'], 'texte')) as $t) {
        if (($x = aled08e_px_interdits($t)) !== '') return new WP_Error('aled08_px', 'Texte refusé : ' . $x . ' (« ' . mb_substr($t, 0, 60) . ' »).', ['status' => 400]);
    }
    return $m;
}
/* L'identité de l'expéditeur, prise dans data.json (src/config.js) : jamais écrite en dur */
function aled08e_px_identite() {
    $i = (array) (aled08e_data()['identite'] ?? []);
    $nom = (string) ($i['nom'] ?? (aled08e_data()['name'] ?? 'Les Minis Monstres'));
    $statut = (string) ($i['statut'] ?? '');
    $statut = $statut !== '' ? mb_strtolower(mb_substr($statut, 0, 1)) . mb_substr($statut, 1) : '';
    $qui = (string) ($i['proprietaire'] ?? '');
    $de = $qui !== '' ? (preg_match('/^[aeiouyhAEIOUYHÉÈÊÂÎÔÛ]/u', $qui) ? 'd’' : 'de ') . $qui : '';
    $num = !empty($i['siret']) ? 'SIRET ' . $i['siret'] : (!empty($i['siren']) ? 'SIREN ' . $i['siren'] : '');
    $lieu = trim((!empty($i['adresse']) ? $i['adresse'] . ', ' : '') . ($i['codePostal'] ?? '') . ' ' . ($i['ville'] ?? ''));
    $morceaux = array_filter([$nom, trim($statut . ($de !== '' ? ' ' . $de : '')), $num, $lieu]);
    return str_replace("'", '’', implode(', ', $morceaux)) . '.';
}
/* Le mail, en HTML (tableaux, styles en ligne, 600 px, lisible sur téléphone) et en texte.
 * $p : le prospect (aled08e_px_get, ou l'exemple pour un aperçu) ; $m : les morceaux ; $pour : 'envoyer' ou 'relancer'.
 * $code et $fin : le code personnel et sa fin de validité (timestamp). */
function aled08e_px_mail($p, $m, $pour, $code, $fin) {
    $site = home_url('/');
    $hote = preg_replace('/^www\./', '', (string) wp_parse_url($site, PHP_URL_HOST));
    $logo = get_template_directory_uri() . '/assets/img/logo-192.png';
    $l = aled08e_px_liens((int) ($p['prospect'] ?? 0));
    if (!empty($p['apercu_lien'])) $l['apercu'] = (string) $p['apercu_lien']; // l'aperçu d'un essai (entreprise d'exemple)
    $prix = aled08e_px_prix();
    $r = aled08e_px_remise();
    $jours = aled08e_px_offre()['jours'];
    $date = wp_date('j F Y', $fin);
    $nom = (string) $p['entreprise'];
    $deX = aled08e_px_de($p['article'] ?? '', $nom);
    $relance = $pour === 'relancer';
    $sujet = $relance ? 'Re : ' . ($p['sujet'] ?: 'votre site internet') : $m['sujet'];
    $e = function ($t) { return esc_html($t); };
    $P = function ($html, $marge = '0 0 14px') { return '<p style="margin:' . $marge . ';font-size:15.5px;line-height:1.6;color:#2e2a47;">' . $html . '</p>'; };
    // la phrase vraie : le nom de l'entreprise en gras, s'il y est
    $phraseH = $e($m['phrase'] ?? '');
    if ($nom !== '' && $phraseH !== '') { $q = preg_quote(esc_html($nom), '/'); $phraseH = preg_replace('/' . $q . '/u', '<b>' . esc_html($nom) . '</b>', $phraseH, 1); }

    // Des boutons lisibles en mode sombre (Gmail éclaircit les textes foncés posés sur un fond clair) : le bouton principal
    // est violet foncé à texte blanc, le second blanc à texte violet. Un bouton par ligne, en pleine largeur : sur un
    // téléphone, le texte ne se coupe plus sur trois lignes.
    $bouton = function ($url, $txt, $plein) {
        $st = $plein ? 'background:#5b3fc4;background-color:#5b3fc4;color:#ffffff;border:2px solid #5b3fc4;' : 'background:#ffffff;background-color:#ffffff;color:#5b3fc4;border:2px solid #5b3fc4;';
        return '<tr><td style="padding:0 0 10px 0;"><a href="' . esc_url($url) . '" style="display:block;padding:13px 18px;border-radius:999px;text-align:center;' . $st . 'font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;line-height:1.25;text-decoration:none;">'
            . '<span style="color:' . ($plein ? '#ffffff' : '#5b3fc4') . ';">' . esc_html($txt) . '</span></a></td></tr>';
    };
    $avecApercu = !$relance && !empty($l['apercu']);
    $boutons = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;width:100%;max-width:420px;">' . $bouton($l['realisations'] ?? $l['site'], 'Voir les sites déjà en ligne', !$avecApercu) . $bouton($l['creer'] ?? $l['site'], 'Créer mon site', false) . '</table>';
    // les trois arguments : moins cher, un suivi, tout vous appartient
    $atouts = aled08e_px_atouts();
    $atoutsH = ''; $atoutsT = '';
    foreach ($atouts as $a) {
        $atoutsH .= '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;background:#eafaf2;border-radius:12px;"><tr>'
            . '<td width="34" valign="top" style="padding:10px 0 9px 12px;"><span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#7ad9b0;border-radius:11px;font-size:13px;font-weight:bold;color:#12392a;">&#10003;</span></td>'
            . '<td valign="top" style="padding:9px 12px 9px 8px;font-size:15px;line-height:1.5;color:#2e2a47;"><b>' . esc_html($a[0]) . '</b> ' . esc_html($a[1]) . '</td></tr></table>';
        $atoutsT .= '- ' . $a[0] . ' ' . $a[1] . "\n";
    }
    // la position mesurée sur Google (prospection-suite.php) : la preuve, chiffrée, qu'on a fait des recherches
    $constat = (array) ($p['constat'] ?? []);
    $cTxt = !empty($constat['recherche']) && function_exists('aled08e_px_constat_lignes') ? aled08e_px_constat_lignes($constat, $nom) : null;
    $constatH = $cTxt ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:2px 0 18px;"><tr><td style="background:#eef4ff;border-left:0;border-radius:16px;padding:14px 16px;font-size:15px;line-height:1.55;color:#2e2a47;">'
        . '<span style="display:block;font-size:12.5px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#2c67ae;margin-bottom:4px;">Nous avons fait le test</span>'
        . esc_html($cTxt[0]) . '<br><b style="font-size:17px;">' . esc_html($cTxt[1]) . '</b><br>' . esc_html($cTxt[2]) . '<br><b>' . esc_html($cTxt[3]) . '</b></td></tr></table>' : '';
    $constatT = $cTxt ? 'Nous avons fait le test. ' . implode(' ', $cTxt) : '';
    // le nom de domaine libre, à son nom
    $dom = (string) ($p['domaine_libre'] ?? '');
    if ($dom !== '' && (!function_exists('aled08e_px_domaine_fidele') || !aled08e_px_domaine_fidele($dom, (string) ($p['entreprise'] ?? '')))) $dom = '';
    $adresseH = 'Et c’est une adresse à vous' . ($dom !== '' ? ', comme <b>' . esc_html($dom) . '</b>,' : ',') . ' à mettre sur vos cartes de visite, votre vitrine et vos factures : vos clients retrouvent tout au même endroit.';
    $adresseT = 'Et c’est une adresse à vous' . ($dom !== '' ? ', comme ' . $dom . ',' : ',') . ' à mettre sur vos cartes de visite, votre vitrine et vos factures : vos clients retrouvent tout au même endroit.';
    $domH = $dom !== '' ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;"><tr><td style="background:#fff0f6;border-radius:16px;padding:14px 16px;font-size:15px;line-height:1.55;color:#2e2a47;">'
        . '<span style="display:block;font-size:12.5px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#a3305f;margin-bottom:4px;">Bonne nouvelle</span>'
        . 'Nous avons vérifié : l’adresse <b style="font-size:17px;">' . esc_html($dom) . '</b> est libre aujourd’hui. Nous pouvons créer votre site à cette adresse, enregistrée à votre nom, en ligne en 24 à 48 heures.</td></tr></table>' : '';
    // l'étude officielle, et sa source juste en dessous (data.json « prospection.etude »)
    $et = (array) ((aled08e_data()['prospection'] ?? [])['etude'] ?? []);
    $etudeH = ''; $etudeT = '';
    if (!empty($et['siteInternet']) && !empty($et['clientsInternet']) && !empty($et['source'])) {
        $etudeTxt = 'En France, ' . (int) $et['siteInternet'] . ' % des petites entreprises ont déjà un site internet. Et près d’une sur deux (' . (int) $et['clientsInternet'] . ' %) dit qu’au moins 5 % de ses clients viennent d’internet.';
        $etudeH = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;"><tr><td style="background:#f6f3ff;border-radius:16px;padding:14px 16px;font-size:15px;line-height:1.55;color:#2e2a47;">'
            . '<span style="display:block;font-size:12.5px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#5b3fc4;margin-bottom:4px;">Ce que disent les chiffres</span>'
            . 'En France, <b>' . (int) $et['siteInternet'] . ' % des petites entreprises ont déjà un site internet.</b> Et près d’une sur deux (<b>' . (int) $et['clientsInternet'] . ' %</b>) dit qu’au moins 5 % de ses clients viennent d’internet.'
            . '<span style="display:block;margin-top:8px;font-size:12px;line-height:1.45;color:#6b6789;">Source : ' . (!empty($et['lien']) ? '<a href="' . esc_url($et['lien']) . '" style="color:#6a5bd6;">' . esc_html($et['source']) . '</a>' : esc_html($et['source'])) . '.</span></td></tr></table>';
        $etudeT = $etudeTxt . "\nSource : " . $et['source'] . (!empty($et['lien']) ? ' (' . $et['lien'] . ')' : '') . '.';
    }
    $domT = $dom !== '' ? 'Bonne nouvelle : nous avons vérifié, l’adresse ' . $dom . ' est libre aujourd’hui. Nous pouvons créer votre site à cette adresse, enregistrée à votre nom, en ligne en 24 à 48 heures.' : '';
    $rappel = 'Pour rappel : ' . mb_strtolower(mb_substr($atouts[0][0], 0, 1)) . rtrim(mb_substr($atouts[0][0], 1), '.') . ', un vrai suivi, et un site qui vous appartient.';
    $boutonApercu = $avecApercu ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px;width:100%;max-width:420px;">' . $bouton($l['apercu'], 'Voir la maquette de votre site', true) . '</table>' : '';
    $avecCode = (int) $r > 0 && (string) $code !== '';
    $lanc = aled08e_px_lancement();
    $aClique = $relance && (int) aled08e_px_meta((int) ($p['prospect'] ?? 0), 'nb_clics', 0) > 0;
    $cadre = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 18px;"><tr><td align="center" style="background:#fff7d9;border:2px dashed #e5b93c;border-radius:16px;padding:14px 16px;font-size:15px;line-height:1.5;color:#2e2a47;">';
    $gros = function ($t) { return '<span style="display:inline-block;margin:6px 0 4px;padding:6px 14px;background:#ffffff;border-radius:10px;font-size:20px;font-weight:bold;letter-spacing:.02em;color:#2e2a47;">' . $t . '</span>'; };
    if ($avecCode) {
        // un code personnel (seulement si data.json « prospection » a une remise) : jamais de « au lieu de »
        $codeH = $cadre . ($relance ? 'Votre code personnel, toujours valable :' : 'Parce que vous recevez cette offre par e-mail :') . '<br>' . $gros('-' . (int) $r . '&nbsp;% : ' . esc_html($code))
            . '<br><span style="font-size:13px;color:#6b5a1f;">Valable ' . ($relance ? '' : (int) $jours . ' jours, ') . 'jusqu’au ' . esc_html($date) . ', sur la création de votre site : ' . aled08e_euro($prix['reduit']) . ' avec ce code. À taper dans la case « Code promo » au moment de commander.</span></td></tr></table>';
        $codeT = '-' . $r . ' % : ' . $code . "\nValable " . ($relance ? '' : $jours . ' jours, ') . 'jusqu’au ' . $date . ', sur la création de votre site : ' . aled08e_euro_txt($prix['reduit']) . ' avec ce code. À taper dans la case « Code promo » au moment de commander.';
    } elseif ($lanc) {
        // l'offre de lancement, la même que pour tout le monde (Alex, 25 novembre 2026)
        $codeH = $cadre . ($relance ? 'Le prix de lancement est toujours là :' : 'En ce moment, c’est le prix de lancement :') . '<br>' . $gros(aled08e_euro($prix['prix']) . ' la création de votre site')
            . '<br><span style="font-size:13px;color:#6b5a1f;">Pour toute commande jusqu’au ' . esc_html($lanc['jusquau']) . '. Ensuite, la création passe à ' . aled08e_euro($lanc['normal']) . '.</span></td></tr></table>';
        $codeT = ($relance ? 'Le prix de lancement est toujours là : ' : 'En ce moment, c’est le prix de lancement : ') . aled08e_euro_txt($prix['prix']) . ' la création de votre site, pour toute commande jusqu’au ' . $lanc['jusquau'] . '. Ensuite, la création passe à ' . aled08e_euro_txt($lanc['normal']) . '.';
    } else {
        $codeH = $cadre . 'La création de votre site :<br>' . $gros(aled08e_euro($prix['prix'])) . '</td></tr></table>';
        $codeT = 'La création de votre site : ' . aled08e_euro_txt($prix['prix']) . '.';
    }
    $pointsH = '';
    foreach ((array) ($m['points'] ?? []) as $pt) {
        $pointsH .= '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;background:#f6f3ff;border-radius:12px;"><tr>'
            . '<td width="34" valign="top" style="padding:9px 0 9px 12px;"><span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background:#ffffff;border-radius:8px;font-size:13px;">' . esc_html($pt['icone']) . '</span></td>'
            . '<td valign="top" style="padding:9px 12px 9px 8px;font-size:15px;line-height:1.5;color:#2e2a47;"><b>' . esc_html($pt['titre']) . '</b> ' . esc_html($pt['texte']) . '</td></tr></table>';
    }
    $source = '<a href="' . esc_url($p['url_source_email'] ?: $site) . '" style="color:#6a5bd6;">' . esc_html($p['source'] ?: aled08e_px_source_libelle($p['url_source_email'] ?? '')) . '</a>';
    $pied = 'Vous recevez ce message parce que l’adresse ' . esc_html($deX) . ' est publiée sur ' . $source . '. '
        . ($relance ? 'C’est notre dernier message.' : 'C’est le seul message que vous recevrez, sauf une petite relance dans quelques jours.')
        . ' Pour ne plus rien recevoir : <a href="' . esc_url($l['stop']) . '" style="color:#6a5bd6;">se désinscrire en un clic</a>.<br>' . esc_html(aled08e_px_identite());

    if ($relance) {
        $corps = '<h1 style="margin:0 0 14px;font-size:21px;line-height:1.3;color:#2e2a47;">Bonjour,</h1>'
            . $P('Nous nous permettons une petite relance de notre dernier message, au sujet d’un site internet ' . esc_html(aled08e_px_pour($p['article'] ?? '', $nom)) . '.')
            . ($phraseH !== '' ? $P($phraseH) : '')
            . ($cTxt ? $P('En tapant « ' . esc_html($constat['recherche']) . ' » sur Google, ' . esc_html(aled08e_px_constat_court($constat, $nom)) . '.') : '')
            . $P(esc_html($rappel))
            . $codeH
            . $P('Plutôt que mille mots, voyez par vous-même : voici des sites déjà en ligne, créés pour nos clients.')
            . $boutons
            . $P('Une question ? Répondez simplement à ce message : nous vous répondons. Et si ce n’est pas le moment, aucun souci : nous ne vous écrirons plus.', '8px 0 6px');
        $apercu = 'Une petite relance au sujet de votre site internet.';
    } else {
        // Le premier mail, court et chaleureux (Alex, 26 novembre 2026) : ce qu'est un site, ce que ça demande, ce qui est compris
        // dans le prix, l'hébergement proposé, le téléphone pour en parler. Chaque partie tient en quelques lignes.
        $titre = function ($t, $coul = '#5b3fc4') { return '<p style="margin:20px 0 8px;font-size:17px;line-height:1.3;font-weight:bold;color:' . $coul . ';">' . $t . '</p>'; };
        $liste = function ($lignes, $fond = '#f6f3ff', $puce = '&#10003;') {
            $h = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px;background:' . $fond . ';border-radius:14px;"><tr><td style="padding:10px 14px;">';
            foreach ($lignes as $x) $h .= '<p style="margin:5px 0;font-size:15px;line-height:1.45;color:#2e2a47;">' . ($puce !== '' ? '<span style="display:inline-block;width:20px;color:#5b3fc4;font-weight:bold;">' . $puce . '</span>' : '') . $x . '</p>';
            return $h . '</td></tr></table>';
        };
        $ptsH = [];
        foreach ((array) ($m['points'] ?? []) as $pt) $ptsH[] = esc_html($pt['icone']) . ' <b>' . esc_html($pt['titre']) . '</b> : ' . esc_html(rtrim($pt['texte'], '.')) . '.';
        $inclus = aled08e_px_inclus();
        $heb = aled08e_px_hebergement();
        $tel = aled08e_px_telephone();
        $corps = '<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#2e2a47;">Bonjour&nbsp;! &#128075;</h1>'
            . $P($phraseH)
            . $constatH
            . ($avecApercu ? $titre('On a imaginé votre site') . $P('Pour vous aider à vous projeter, voici une maquette de ce que pourrait donner le site ' . esc_html($deX) . ', en vue ordinateur (il s’adapte aussi parfaitement au téléphone). Ce n’est qu’une maquette : votre site sera modifiable à 100 %, selon vos goûts.', '0 0 10px') . $boutonApercu : '')
            . $titre('Un site, c’est quoi&nbsp;?')
            . $P('Votre vitrine sur internet, ouverte jour et nuit : vos services, vos photos, votre numéro, et une adresse à vous' . ($dom !== '' ? ' (comme <b>' . esc_html($dom) . '</b>)' : '') . ' à mettre sur vos cartes, votre véhicule et vos factures.', '0 0 8px')
            . ($ptsH ? $liste($ptsH, '#f6f3ff', '') : '')
            . $titre('Et pour vous, ça demande quoi&nbsp;?')
            . $P('Presque rien&nbsp;! Un petit questionnaire d’une dizaine de minutes : votre métier, vos services, vos photos si vous en avez. <b>On écrit les textes, on s’occupe de tout</b>, et votre site est en ligne en 24 à 48 heures.')
            . $titre('Tout compris dans le prix', '#a3305f')
            . $codeH
            . $liste(array_map('esc_html', $inclus), '#fff0f6')
            . $titre('L’hébergement aussi, si vous voulez', '#176a4c')
            . $P(esc_html($heb))
            . $domH
            . $P('<b>Une petite famille, de vrais prix&nbsp;:</b> ' . esc_html(rtrim(aled08e_px_atouts()[0][0], '.')) . ', un vrai suivi, et tout vous appartient.', '14px 0 14px')
            . $boutons
            . ($tel !== '' ? $P('Envie d’en parler de vive voix&nbsp;? Appelez-nous au <a href="tel:' . esc_attr(preg_replace('/[^0-9+]/', '', $tel)) . '" style="color:#5b3fc4;font-weight:bold;text-decoration:none;white-space:nowrap;">' . esc_html($tel) . '</a>, ou répondez simplement à ce mail&nbsp;: c’est nous qui vous lisons.', '8px 0 6px')
                : $P('Une question&nbsp;? Répondez simplement à ce mail&nbsp;: c’est nous qui vous lisons.', '8px 0 6px'));
        $apercu = mb_substr($m['phrase'], 0, 110);
    }
    $html = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>' . esc_html($sujet) . '</title></head>'
        . '<body style="margin:0;padding:0;background:#f4f1fb;">'
        . '<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' . esc_html($apercu) . '</div>'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1fb;"><tr><td align="center" style="padding:18px 10px 28px;">'
        . '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e6e1f5;border-radius:22px;font-family:Arial,Helvetica,sans-serif;color:#2e2a47;">'
        // le bandeau : le logo et le nom
        . '<tr><td style="padding:18px 22px;background:#e9e2ff;background-image:linear-gradient(135deg,#e9e2ff,#dff6ec);border-radius:21px 21px 0 0;">'
        . '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:12px;vertical-align:middle;"><a href="' . esc_url($l['site']) . '"><img src="' . esc_url($logo) . '" width="46" height="46" alt="" style="display:block;border:0;border-radius:12px;"></a></td>'
        . '<td style="vertical-align:middle;"><span style="display:block;font-size:17px;font-weight:bold;letter-spacing:.02em;color:#2e2a47;">Les Minis Monstres</span><span style="display:block;font-size:12px;color:#5d5a78;">Des sites internet pour être visible, près de chez vous</span></td></tr></table></td></tr>'
        . '<tr><td style="padding:22px 24px 8px;">' . $corps . '</td></tr>'
        . '<tr><td style="padding:4px 24px 20px;font-size:15px;line-height:1.5;color:#2e2a47;">' . ($relance ? 'Bonne journée,' : 'À très vite,') . '<br><b>La bande des Minis Monstres</b><br><a href="' . esc_url($l['site']) . '" style="color:#2e2a47;text-decoration:none;">' . esc_html($hote) . '</a></td></tr>'
        . '<tr><td style="padding:14px 24px 20px;font-size:11.5px;line-height:1.5;color:#7a7795;border-top:1px solid #eee9f8;">' . $pied . '</td></tr>'
        . '</table></td></tr></table></body></html>';

    // la version texte (pour les messageries qui n'affichent pas le HTML, et pour l'historique du prospect)
    $piedT = 'Vous recevez ce message parce que l’adresse ' . $deX . ' est publiée sur ' . ($p['source'] ?: aled08e_px_source_libelle($p['url_source_email'] ?? '')) . ' (' . ($p['url_source_email'] ?? '') . '). '
        . ($relance ? 'C’est notre dernier message.' : 'C’est le seul message que vous recevrez, sauf une petite relance dans quelques jours.')
        . "\nPour ne plus rien recevoir, en un clic : " . $l['stop'] . "\n" . aled08e_px_identite();
    if ($relance) {
        $texte = "Bonjour,\n\nNous nous permettons une petite relance de notre dernier message, au sujet d’un site internet " . aled08e_px_pour($p['article'] ?? '', $nom) . ".\n\n"
            . ($m['phrase'] !== '' ? $m['phrase'] . "\n\n" : '') . ($cTxt ? 'En tapant « ' . $constat['recherche'] . ' » sur Google, ' . aled08e_px_constat_court($constat, $nom) . ".\n\n" : '') . $rappel . "\n\n" . $codeT . "\n\n"
            . "Plutôt que mille mots, voyez par vous-même : voici des sites déjà en ligne, créés pour nos clients.\n" . ($l['realisations'] ?? $l['site']) . "\nCréer mon site : " . ($l['creer'] ?? $l['site']) . "\n\n"
            . "Une question ? Répondez simplement à ce message : nous vous répondons. Et si ce n’est pas le moment, aucun souci : nous ne vous écrirons plus.\n\nBonne journée,\nLa bande des Minis Monstres\n" . $hote . "\n\n--\n" . $piedT;
    } else {
        $pt = '';
        foreach ((array) $m['points'] as $x) $pt .= '- ' . $x['titre'] . ' : ' . rtrim($x['texte'], '.') . ".\n";
        $tel = aled08e_px_telephone();
        $texte = "Bonjour !\n\n" . $m['phrase'] . "\n\n" . ($constatT !== '' ? $constatT . "\n\n" : '')
            . ($avecApercu ? "ON A IMAGINÉ VOTRE SITE\nPour vous aider à vous projeter, voici une maquette de ce que pourrait donner le site " . $deX . ", en vue ordinateur (il s’adapte aussi parfaitement au téléphone). Ce n’est qu’une maquette : votre site sera modifiable à 100 %, selon vos goûts.\n" . $l['apercu'] . "\n\n" : '')
            . "UN SITE, C’EST QUOI ?\nVotre vitrine sur internet, ouverte jour et nuit : vos services, vos photos, votre numéro, et une adresse à vous" . ($dom !== '' ? ' (comme ' . $dom . ')' : '') . " à mettre sur vos cartes, votre véhicule et vos factures.\n" . $pt . "\n"
            . "ET POUR VOUS, ÇA DEMANDE QUOI ?\nPresque rien ! Un petit questionnaire d’une dizaine de minutes : votre métier, vos services, vos photos si vous en avez. On écrit les textes, on s’occupe de tout, et votre site est en ligne en 24 à 48 heures.\n\n"
            . "TOUT COMPRIS DANS LE PRIX\n" . $codeT . "\n- " . implode("\n- ", aled08e_px_inclus()) . "\n\n"
            . "L’HÉBERGEMENT AUSSI, SI VOUS VOULEZ\n" . aled08e_px_hebergement() . "\n\n"
            . ($domT !== '' ? $domT . "\n\n" : '')
            . 'Une petite famille, de vrais prix : ' . rtrim(aled08e_px_atouts()[0][0], '.') . ", un vrai suivi, et tout vous appartient.\n\n"
            . 'Voir les sites déjà en ligne : ' . ($l['realisations'] ?? $l['site']) . "\nCréer mon site : " . ($l['creer'] ?? $l['site']) . "\n\n"
            . ($tel !== '' ? 'Envie d’en parler de vive voix ? Appelez-nous au ' . $tel . ', ou répondez simplement à ce mail : c’est nous qui vous lisons.' : 'Une question ? Répondez simplement à ce mail : c’est nous qui vous lisons.')
            . "\n\nÀ très vite,\nLa bande des Minis Monstres\n" . $hote . "\n\n--\n" . $piedT;
    }
    return ['sujet' => $sujet, 'html' => $html, 'texte' => $texte];
}
/* L'envoi, par le site (wp_mail), depuis l'adresse des Minis Monstres ; les réponses vont chez Alex (Reply-To) */
function aled08e_px_poster($a, $mail, $id, $relance = false) {
    $entetes = array_values(array_filter((array) aled08e_mail_headers('Les Minis Monstres <' . aled08e_px_reponse() . '>'), function ($e) { return stripos($e, 'content-type:') !== 0; }));
    $entetes[] = 'Content-Type: text/html; charset=UTF-8';
    $entetes[] = 'From: "Les Minis Monstres" <' . aled08e_px_expediteur() . '>';
    // une adresse d'envoi à part : les retours d'adresses fausses y reviennent aussi (et pas dans la boîte des clients)
    $retour = is_email((string) get_option('aled08_prospection_expediteur', '')) ? aled08e_px_expediteur() : '';
    if ($id) {
        $entetes[] = 'List-Unsubscribe: <' . aled08e_px_lien($id, 'stop') . '>';
        $entetes[] = 'List-Unsubscribe-Post: List-Unsubscribe=One-Click';
    }
    $hote = (string) wp_parse_url(home_url(), PHP_URL_HOST);
    $msgid = $id ? '<lmm-px-' . (int) $id . '-' . ($relance ? 'r' : 'e') . '-' . time() . '@' . $hote . '>' : '';
    $avant = $id && $relance ? (string) aled08e_px_meta($id, 'msgid') : '';
    $init = function ($m) use ($mail, $msgid, $avant, $retour) {
        $m->AltBody = $mail['texte'];
        if ($retour !== '') $m->Sender = $retour;
        if ($msgid !== '') $m->MessageID = $msgid;
        if ($avant !== '') { $m->addCustomHeader('In-Reply-To', $avant); $m->addCustomHeader('References', $avant); }
    };
    add_action('phpmailer_init', $init, 20);
    $ok = wp_mail($a, $mail['sujet'], $mail['html'], $entetes);
    remove_action('phpmailer_init', $init, 20);
    return $ok ? ($msgid ?: true) : false;
}
/* L'exemple du gabarit d'Alex, pour un aperçu ou un essai sans prospect */
function aled08e_px_exemple() {
    return ['prospect' => 0, 'entreprise' => 'Boulangerie Martin', 'article' => 'la', 'url_source_email' => 'https://www.google.com/maps', 'source' => 'sa fiche Google', 'sujet' => 'Boulangerie Martin : vos clients vous cherchent sur Google',
        'morceaux' => ['sujet' => 'Boulangerie Martin : vos clients vous cherchent sur Google', 'phrase' => 'En cherchant « boulangerie Charleville-Mézières » sur Google, nous avons trouvé la fiche de la Boulangerie Martin… mais pas de site internet.',
            'points' => [['icone' => '🔎', 'titre' => 'Être trouvé', 'texte' => 'quand quelqu’un cherche une boulangerie près de chez lui.'],
                ['icone' => '🕒', 'titre' => 'Vos horaires, vos spécialités et vos photos', 'texte' => 'toujours à jour, même le dimanche.'],
                ['icone' => '🎂', 'titre' => 'Des commandes de gâteaux', 'texte' => 'qui arrivent même quand vous êtes au fournil.']]]];
}

/* ====================================================================== ce que le Facteur fait sur un prospect */
function aled08e_px_faire(WP_REST_Request $req) {
    $d = (array) $req->get_json_params();
    $faire = sanitize_key((string) ($d['faire'] ?? ''));
    $id = (int) ($d['prospect'] ?? 0);
    $texte = aled08e_px_texte($d['texte'] ?? '', 600);
    $err = function ($msg, $st = 409, $plus = []) { return new WP_Error('aled08_px', $msg, ['status' => $st] + $plus); };

    // l'aperçu et l'essai marchent même éteint : Alex voit le mail avant d'allumer
    if ($faire === 'apercu' || $faire === 'essai') {
        $pour = sanitize_key((string) ($d['pour'] ?? 'envoyer')) === 'relancer' ? 'relancer' : 'envoyer';
        if ($id) {
            $p = aled08e_px_get($id);
            if (!$p) return $err('Prospect introuvable.', 404);
            $m = aled08e_px_morceaux($d, $pour);
            if (is_wp_error($m)) return $m;
            $code = $p['code'] ?: 'MAIL' . aled08e_px_remise() . '-XXXX';
            $fin = $p['code'] ? aled08e_px_code_fin($id) : time() + aled08e_px_offre()['jours'] * DAY_IN_SECONDS;
        } else {
            $p = aled08e_px_exemple();
            // une entreprise d'exemple au choix (un coiffeur, un garage…), pour montrer le mail à Alex : jamais un vrai prospect
            $ex = (array) ($d['exemple'] ?? []);
            if (!empty($ex['entreprise'])) {
                $art = str_replace("'", '’', (string) ($ex['article'] ?? ''));
                $p = ['entreprise' => aled08e_px_texte($ex['entreprise'], 120), 'article' => in_array($art, ['le', 'la', 'l’', 'les'], true) ? $art : '',
                    'metier' => aled08e_px_texte($ex['metier'] ?? '', 80), 'ville' => aled08e_px_texte($ex['ville'] ?? '', 80)] + $p;
                // la page où l'essai dit avoir vu l'entreprise (sinon, celle de l'exemple)
                if (($u = aled08e_px_url($ex['url_source'] ?? '')) !== '') { $p['url_source_email'] = $u; $p['source'] = aled08e_px_texte($ex['source'] ?? '', 80) ?: aled08e_px_source_libelle($u); }
                $p['domaine_libre'] = function_exists('aled08e_px_domaine_trouver') ? aled08e_px_domaine_trouver($p['entreprise'], $p['ville'], $p['article']) : '';
                $c = (array) ($ex['constat'] ?? []);
                if (!empty($c['recherche']) && isset($c['position'])) $p['constat'] = ['recherche' => aled08e_px_texte($c['recherche'], 80), 'position' => max(0, min(100, (int) $c['position'])),
                    'regardes' => max(10, min(100, (int) ($c['regardes'] ?? 50))), 'trouve' => aled08e_px_texte($c['trouve'] ?? 'votre page Facebook', 60), 'le' => time()];
            }
            $m = (!empty($d['sujet']) || !empty($d['phrase'])) ? aled08e_px_morceaux($d, $pour) : ($pour === 'relancer' ? ['sujet' => '', 'phrase' => '', 'points' => []] : $p['morceaux']);
            if (is_wp_error($m)) return $m;
            if (!empty($ex['entreprise']) && function_exists('aled08e_px_apercu_essai') && aled08e_px_offre()['apercu_note'] <= 100) $p['apercu_lien'] = aled08e_px_apercu_essai($p, $m);
            $code = 'MAIL' . aled08e_px_remise() . '-7KQ2';
            $fin = time() + aled08e_px_offre()['jours'] * DAY_IN_SECONDS;
        }
        // une maquette par métier (dossier maquettes/), montrée dans l'essai : seulement une image de ce site
        $mq = esc_url_raw((string) ($d['maquette'] ?? ''));
        if ($mq !== '' && wp_parse_url($mq, PHP_URL_HOST) === wp_parse_url(home_url(), PHP_URL_HOST)) $p['apercu_lien'] = $mq;
        $mail = aled08e_px_mail($p, $m, $pour, $code, $fin);
        if ($faire === 'apercu') return new WP_REST_Response(['ok' => true, 'sujet' => $mail['sujet'], 'html' => $mail['html'], 'texte' => $mail['texte']], 200);
        // l'essai part chez Alex seulement, sans liens suivis ni compteur
        $p['prospect'] = 0;
        $mail = aled08e_px_mail($p, $m, $pour, $code, $fin);
        $mail['sujet'] = '[Essai] ' . $mail['sujet'];
        $ok = aled08e_px_poster(aled08e_to(), $mail, 0);
        return $ok ? new WP_REST_Response(['ok' => true, 'envoye_a' => aled08e_to()], 200) : $err('L’e-mail d’essai n’est pas parti (wp_mail).', 502);
    }

    // le Répondeur : retrouver un prospect par l'adresse qui a répondu (marche même prospection éteinte : les réponses arrivent encore)
    if ($faire === 'trouver') {
        $e = aled08e_px_norm_email($d['email'] ?? '');
        $x = is_email($e) ? aled08e_px_cherche('email', $e) : 0;
        $p = $x ? aled08e_px_get($x) : null;
        if (!$p) return $err('Aucun prospect avec cette adresse : ce message ne vient pas de la prospection.', 404);
        unset($p['journal'], $p['clics_detail']);
        return new WP_REST_Response(['ok' => true, 'prospect' => $p], 200);
    }

    $p = $id ? aled08e_px_get($id) : null;
    if (!$p) return $err('Prospect introuvable.', 404);
    $etat = $p['etat'];
    $set = function ($e) use ($id) { aled08e_px_set($id, 'etat', $e); };

    if ($faire === 'retenir') {
        if ($etat !== 'nouveau') return $err('Seul un prospect « nouveau » se retient (il est « ' . $etat . ' »).');
        if ($texte === '') return $err('Dites ce que vous avez revérifié (texte) : l’adresse est bien sur la source, et il n’y a pas de site.', 400);
        if (aled08e_px_oppose($p['email'], $p['siren'])) { $set('desinscrit'); return $err('Ce prospect est sur la liste d’opposition : il est passé « desinscrit ».'); }
        aled08e_px_set($id, 'verification', $texte);
        aled08e_px_journal($id, 'Vérifié par le Facteur : ' . $texte);
        // la position sur Google, mesurée par le site lui-même (jamais un chiffre donné par un agent)
        $mesure = function_exists('aled08e_px_mesurer') ? aled08e_px_mesurer($id) : null;
        // un nom de domaine libre à son nom (sauf s'il a déjà un site, donc déjà une adresse)
        $dom = ($p['site_actuel'] === '' && function_exists('aled08e_px_domaine_trouver')) ? aled08e_px_domaine_trouver($p['entreprise'], $p['ville'], $p['article']) : '';
        aled08e_px_set($id, 'domaine_libre', $dom);
        if ($dom !== '') aled08e_px_journal($id, 'Nom de domaine libre trouvé : ' . $dom . '.');
        $set('a_ecrire');
        return new WP_REST_Response(['ok' => true, 'etat' => 'a_ecrire', 'position_google' => $mesure ? aled08e_px_constat_txt($mesure, (string) $p['entreprise']) : 'non mesurée (pas de clé de mesure, ou service indisponible) : le mail n’en parlera pas',
            'domaine_libre' => $dom !== '' ? $dom : 'aucun trouvé (ou déjà un site) : le mail n’en parlera pas'], 200);
    }
    if ($faire === 'ecarter') {
        if (in_array($etat, ['desinscrit', 'commande'], true)) return $err('Ce prospect est « ' . $etat . ' » : on n’y touche plus.');
        if ($texte === '') return $err('Dites pourquoi il est écarté (texte).', 400);
        aled08e_px_set($id, 'ecarte_raison', $texte);
        aled08e_px_journal($id, 'Écarté : ' . $texte);
        $set('ecarte');
        aled08e_px_stat('ecartes');
        return new WP_REST_Response(['ok' => true, 'etat' => 'ecarte'], 200);
    }
    if ($faire === 'repondu') {
        if (!in_array($etat, ['envoye', 'relance', 'repondu'], true)) return $err('Seul un prospect à qui on a écrit peut avoir répondu (il est « ' . $etat . ' »).');
        // l'avis du Répondeur sur la réponse, et s'il a laissé un brouillon de réponse à Alex
        $avis = sanitize_key((string) ($d['avis'] ?? ''));
        if (!in_array($avis, ['interesse', 'question', 'pas_interesse', 'autre'], true)) $avis = '';
        $avant = (string) aled08e_px_meta($id, 'reponse_avis');
        if ($etat !== 'repondu') { aled08e_px_set($id, 'repondu_le', time()); $set('repondu'); aled08e_px_stat('repondus'); }
        if ($avis !== '') aled08e_px_set($id, 'reponse_avis', $avis);
        if ($avis === 'interesse' && $avant !== 'interesse') aled08e_px_stat('interesses');
        if (!empty($d['brouillon']) && !aled08e_px_meta($id, 'brouillon_le', 0)) { aled08e_px_set($id, 'brouillon_le', time()); aled08e_px_stat('brouillons'); }
        aled08e_px_journal($id, 'A répondu' . ($avis !== '' ? ' (' . $avis . ')' : '') . ($texte !== '' ? ' : ' . $texte : '.') . (!empty($d['brouillon']) ? ' Brouillon de réponse prêt.' : ''));
        delete_transient('aled08e_px_appr');
        return new WP_REST_Response(['ok' => true, 'etat' => 'repondu', 'avis' => $avis], 200);
    }
    if ($faire === 'rebond') {
        // l'adresse n'existe pas (ou plus) : on ne réessaie jamais, et on compte (trop d'adresses fausses abîme la réputation de l'envoi)
        if (!in_array($etat, ['envoye', 'relance'], true)) return $err('Seul un prospect à qui on a écrit peut revenir en erreur (il est « ' . $etat . ' »).');
        aled08e_px_opposer($p['email'], '');
        aled08e_px_set($id, 'ecarte_raison', 'Adresse e-mail fausse ou fermée' . ($texte !== '' ? ' : ' . $texte : '.'));
        aled08e_px_set($id, 'rebond_le', time());
        aled08e_px_journal($id, 'Le mail est revenu : adresse fausse ou fermée.');
        $set('ecarte');
        aled08e_px_stat('rebonds');
        if (function_exists('aled08e_px_surveiller')) aled08e_px_surveiller();
        return new WP_REST_Response(['ok' => true, 'etat' => 'ecarte'], 200);
    }
    if ($faire === 'desinscrire') {
        // une demande d'arrêt reçue autrement (une réponse « STOP », un appel) : prise en compte tout de suite
        aled08e_px_desinscrire($id, $texte !== '' ? $texte : 'Demande reçue par un autre moyen.');
        return new WP_REST_Response(['ok' => true, 'etat' => 'desinscrit'], 200);
    }
    if ($faire !== 'envoyer' && $faire !== 'relancer') return $err('À faire inconnu (retenir, envoyer, relancer, ecarter, repondu, rebond, desinscrire, trouver, apercu, essai).', 400);

    // ----- envoyer, relancer : tous les garde-fous
    if (!aled08e_px_active()) return $err('La prospection est éteinte (option aled08_prospection_active). Rien n’est envoyé.', 403);
    if (!aled08e_px_site_pret()) return $err('Le site ou les ventes ne sont pas ouverts : on n’envoie pas une offre qu’on ne pourrait pas honorer.', 409);
    if (!aled08e_px_heure_ok()) return $err('Les envois se font en semaine, de 8 h à 18 h (heure du site). Revenez à ce moment-là.', 409);
    if (aled08e_px_oppose($p['email'], $p['siren'])) { if ($etat !== 'desinscrit') $set('desinscrit'); return $err('Ce prospect est sur la liste d’opposition : on ne lui écrit jamais.'); }
    if ($faire === 'envoyer') {
        if ($etat !== 'a_ecrire') return $err('On n’écrit qu’à un prospect « a_ecrire » (il est « ' . $etat . ' »)' . ($etat === 'nouveau' ? ' : revérifiez-le d’abord, puis « retenir ».' : '.'));
        if (aled08e_px_meta($id, 'envoye_le', 0)) return $err('On lui a déjà écrit.');
    } else {
        if ($etat !== 'envoye') return $err('Une relance ne part qu’à un prospect « envoye » (il est « ' . $etat . ' ») : une seule relance, puis plus rien.');
        if (aled08e_px_meta($id, 'relance_le', 0)) return $err('Il a déjà été relancé : plus rien.');
        $quand = aled08e_px_relance_quand($id);
        if (time() < $quand) return $err('Trop tôt : la relance est possible à partir du ' . wp_date('j F Y à H:i', $quand) . '.');
        if (time() > aled08e_px_code_fin($id)) return $err('Plus de ' . aled08e_px_offre()['jours'] . ' jours depuis le premier mail : pas de relance.');
    }
    if (aled08e_px_quota_restant() <= 0) return $err('Le quota du jour est atteint (' . aled08e_px_quota_jour() . ' envois). La suite demain.', 429);
    if (($att = aled08e_px_attente_minutes()) > 0) return $err('Déjà ' . ALED08E_PX_HEURE_MAX . ' envois dans l’heure : réessayez dans ' . $att . ' minutes.', 429, ['reessayer_dans_minutes' => $att]);
    $m = aled08e_px_morceaux($d, $faire);
    if (is_wp_error($m)) return $m;

    $premier = $faire === 'envoyer';
    // un code personnel seulement quand l'offre du mail a une remise (data.json « prospection ») ; sinon le prix de lancement, sans code
    $code = $premier ? ($p['code'] ?: (aled08e_px_remise() > 0 ? aled08e_px_code_nouveau() : '')) : $p['code'];
    if ($premier) { if ($code !== '') aled08e_px_set($id, 'code', $code); aled08e_px_set($id, 'envoye_le', time()); }
    // le domaine proposé doit être libre au moment où le mail part : sinon on en cherche un autre
    if ($premier && $p['domaine_libre'] !== '' && function_exists('aled08e_rdap_statut') && (aled08e_rdap_statut($p['domaine_libre']) === 'pris' || !aled08e_px_domaine_fidele($p['domaine_libre'], $p['entreprise']))) {
        $p['domaine_libre'] = function_exists('aled08e_px_domaine_trouver') ? aled08e_px_domaine_trouver($p['entreprise'], $p['ville'], $p['article']) : '';
        aled08e_px_set($id, 'domaine_libre', $p['domaine_libre']);
    }
    $mail = aled08e_px_mail($p, $m, $faire, $code, aled08e_px_code_fin($id));
    $ok = aled08e_px_poster($p['email'], $mail, $id, !$premier);
    if (!$ok) {
        if ($premier) delete_post_meta($id, '_aled08_px_envoye_le'); // rien n'est parti : le code attendra le vrai envoi
        aled08e_px_journal($id, 'Envoi impossible (wp_mail).');
        return $err('L’e-mail n’est pas parti (wp_mail a échoué). Rien n’a changé ; réessayez au prochain passage.', 502);
    }
    aled08e_px_noter_envoi();
    if ($premier) {
        if (is_string($ok)) aled08e_px_set($id, 'msgid', $ok);
        aled08e_px_set($id, 'sujet', $mail['sujet']);
        aled08e_px_set($id, 'contenu', $mail['texte']);
        aled08e_px_set($id, 'morceaux', $m);
        // le type de sujet (question, constat, benefice, local) : pour apprendre lequel marche le mieux
        $st = sanitize_key((string) ($d['sujet_type'] ?? ''));
        if (in_array($st, ['question', 'constat', 'benefice', 'local'], true)) aled08e_px_set($id, 'sujet_type', $st);
        $set('envoye');
        aled08e_px_stat('envois');
        delete_transient('aled08e_px_appr');
        aled08e_px_journal($id, 'Mail envoyé : « ' . $mail['sujet'] . ' »' . ($code !== '' ? ' (code ' . $code . ')' : '') . (function_exists('aled08e_px_apercu_ok') && aled08e_px_apercu_ok($id) ? ', avec l’aperçu de son site' : '') . '.');
    } else {
        aled08e_px_set($id, 'relance_le', time());
        aled08e_px_set($id, 'contenu_relance', $mail['texte']);
        $set('relance');
        aled08e_px_stat('relances');
        aled08e_px_journal($id, 'Relance envoyée.');
    }
    return new WP_REST_Response(['ok' => true, 'etat' => $premier ? 'envoye' : 'relance', 'code' => $code, 'code_valable_jusqu_au' => wp_date('Y-m-d', aled08e_px_code_fin($id)),
        'quota_restant_aujourdhui' => aled08e_px_quota_restant(), 'envois_cette_heure' => aled08e_px_envois_heure()], 200);
}
function aled08e_px_desinscrire($id, $pourquoi) {
    $p = aled08e_px_get($id);
    if (!$p) return false;
    aled08e_px_opposer($p['email'], $p['siren']);
    if ($p['etat'] !== 'desinscrit') {
        aled08e_px_set($id, 'etat', $p['etat'] === 'commande' ? 'commande' : 'desinscrit'); // un client reste client, mais n'est plus jamais prospecté
        aled08e_px_set($id, 'desinscrit_le', time());
        aled08e_px_journal($id, 'Désinscrit : ' . $pourquoi);
        aled08e_px_stat('desinscrits');
        delete_transient('aled08e_px_appr');
        if (function_exists('aled08e_px_surveiller')) aled08e_px_surveiller();
    }
    return true;
}

/* ====================================================================== le résumé, la liste */
function aled08e_px_compteurs() {
    global $wpdb;
    $out = array_fill_keys(array_keys(aled08e_px_etats()), 0);
    $l = $wpdb->get_results($wpdb->prepare("SELECT pm.meta_value AS e, COUNT(*) AS n FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = %s AND p.post_type = %s GROUP BY pm.meta_value", '_aled08_px_etat', ALED08E_CPT_PROSPECT));
    foreach ((array) $l as $r) if (isset($out[$r->e])) $out[$r->e] = (int) $r->n;
    $clics = (int) $wpdb->get_var($wpdb->prepare("SELECT SUM(pm.meta_value) FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = %s AND p.post_type = %s", '_aled08_px_nb_clics', ALED08E_CPT_PROSPECT));
    return ['par_etat' => $out, 'clics' => $clics, 'oppositions' => count((array) (aled08e_px_opposition()['e'] ?? []))];
}
function aled08e_px_resume() {
    $c = aled08e_px_compteurs();
    $premier = (int) get_option('aled08_prospection_premier_envoi', 0);
    return [
        'active' => aled08e_px_active(), 'site_et_ventes_ouverts' => aled08e_px_site_pret(), 'heure_d_envoi' => aled08e_px_heure_ok(),
        'quota_jour' => aled08e_px_quota_jour(), 'envoyes_aujourdhui' => aled08e_px_envoyes_aujourdhui(), 'quota_restant' => aled08e_px_quota_restant(),
        'envois_cette_heure' => aled08e_px_envois_heure(), 'max_par_heure' => ALED08E_PX_HEURE_MAX,
        'quota_depart' => (int) get_option('aled08_prospection_quota_depart', 20), 'quota_max' => (int) get_option('aled08_prospection_quota_max', 150),
        'premier_envoi' => $premier ? wp_date('Y-m-d', $premier) : '',
        'semaine' => aled08e_px_stats_sur(7), 'total' => $c['par_etat'], 'clics_total' => $c['clics'], 'liste_opposition' => $c['oppositions'],
        'offre' => aled08e_px_offre() + aled08e_px_prix() + ['en_clair' => aled08e_px_offre_txt()],
        'adresse_envoi' => aled08e_px_expediteur(), 'adresse_reponses' => aled08e_px_reponse(),
    ];
}
function aled08e_px_liste($args = []) {
    $etats = array_values(array_intersect((array) ($args['etat'] ?? []), array_keys(aled08e_px_etats())));
    $q = ['post_type' => ALED08E_CPT_PROSPECT, 'post_status' => 'private', 'numberposts' => max(1, min(100, (int) ($args['limite'] ?? 50))), 'paged' => max(1, (int) ($args['page'] ?? 1)),
        'orderby' => $args['orderby'] ?? 'date', 'order' => $args['order'] ?? 'DESC', 'fields' => 'ids', 'suppress_filters' => true,
        'meta_query' => [$etats ? ['key' => '_aled08_px_etat', 'value' => $etats, 'compare' => 'IN'] : ['key' => '_aled08_px_etat', 'compare' => 'EXISTS']]];
    if (!empty($args['meta_key'])) { $q['meta_key'] = $args['meta_key']; $q['orderby'] = 'meta_value_num'; }
    if (!empty($args['q'])) $q['s'] = sanitize_text_field((string) $args['q']);
    $out = [];
    foreach (get_posts($q) as $pid) { $p = aled08e_px_get($pid); if ($p) { if (empty($args['detail'])) unset($p['contenu_envoye'], $p['contenu_relance'], $p['journal'], $p['clics_detail']); $out[] = $p; } }
    return $out;
}

/* ====================================================================== les postes du Repéreur et du Facteur (servis par /atelier/poste) */
/* La tournée : chaque couple (département, métier) fait est noté ; le suivant est le premier pas fait depuis 120 jours */
function aled08e_px_tournee() { $t = get_option('aled08_prospection_tournee', []); return is_array($t) ? $t : []; }
function aled08e_px_tournee_noter($dep, $metier) {
    $dep = strtoupper(sanitize_text_field((string) $dep));
    $metier = sanitize_key((string) $metier);
    if (!aled08e_px_departement_ok($dep) || $metier === '' || !isset(aled08e_px_metiers_tournee()[$metier])) return false;
    $t = aled08e_px_tournee();
    $t[$dep . '|' . $metier] = time();
    $vieux = time() - 400 * DAY_IN_SECONDS;
    update_option('aled08_prospection_tournee', array_filter($t, function ($x) use ($vieux) { return (int) $x > $vieux; }), false);
    update_option('aled08_prospection_tour', (int) get_option('aled08_prospection_tour', 0) + 1, false);
    return true;
}
function aled08e_px_zone_suivante() {
    $t = aled08e_px_tournee();
    $metiers = aled08e_px_metiers_tournee();
    if (!$metiers) return null;
    $limite = time() - 120 * DAY_IN_SECONDS;
    $zone = function ($dep, $slug, $pourquoi = '') use ($metiers) {
        $m = $metiers[$slug];
        $x = ['slug' => $slug, 'nom' => (string) $m['nom'], 'qui' => (string) $m['qui'], 'page_metier' => $m['page'] ? $slug : ''];
        if (!empty($m['naf'])) $x['naf'] = $m['naf'];
        return ['departement' => $dep, 'metier' => $x] + ($pourquoi !== '' ? ['pourquoi' => $pourquoi] : []);
    };
    // ce qui marche passe devant : deux zones sur trois vont au métier qui répond le mieux, la troisième suit la tournée
    // normale pour continuer d'essayer les autres (includes/prospection-suite.php)
    $mieux = function_exists('aled08e_px_meilleur_metier') ? aled08e_px_meilleur_metier() : '';
    if ($mieux !== '' && isset($metiers[$mieux]) && (int) get_option('aled08_prospection_tour', 0) % 3 !== 2) {
        foreach (aled08e_px_departements() as $dep) if ((int) ($t[$dep . '|' . $mieux] ?? 0) <= $limite) return $zone($dep, $mieux, 'C’est le métier qui répond le mieux à nos mails en ce moment.');
    }
    foreach (aled08e_px_departements() as $dep) foreach ($metiers as $slug => $m) {
        if ((int) ($t[$dep . '|' . $slug] ?? 0) > $limite) continue;
        return $zone($dep, $slug);
    }
    return null; // toute la France faite, tous métiers : la tournée recommence 120 jours après
}
function aled08e_px_poste($agent) {
    if ($agent === 'repondeur') return function_exists('aled08e_px_poste_repondeur') ? aled08e_px_poste_repondeur() : ['agent' => $agent, 'rien_a_faire' => true];
    $r = aled08e_px_resume();
    $out = ['agent' => $agent, 'prospection' => $r];
    $pourquoi = '';
    if (!$r['active']) $pourquoi = 'La prospection est éteinte : rien à faire.';
    if ($agent === 'repereur') {
        // pas plus de trois jours d'envois d'avance : on ne garde pas des données dont on ne se sert pas
        $stock = (int) $r['total']['nouveau'] + (int) $r['total']['a_ecrire'];
        $max = 3 * max(ALED08E_PX_PALIER, (int) $r['quota_jour']);
        $aTrouver = max(0, min(50, $max - $stock));
        if ($pourquoi === '' && $aTrouver <= 0) $pourquoi = 'Assez de prospects en attente (' . $stock . ') : le Facteur doit d’abord avancer.';
        $out['travail'] = ['a_trouver' => $aTrouver, 'en_attente' => $stock, 'zone_suggeree' => aled08e_px_zone_suivante(),
            'metiers' => array_values(aled08e_px_metiers_tournee()),
            'chercher_aussi' => aled08e_px_sources_petits(),
            'zones_faites_120_jours' => count(array_filter(aled08e_px_tournee(), function ($x) { return (int) $x > time() - 120 * DAY_IN_SECONDS; }))];
    } else {
        $restant = (int) $r['quota_restant'];
        $relancer = [];
        if ($r['active']) foreach (aled08e_px_liste(['etat' => ['envoye'], 'limite' => 100, 'orderby' => 'date', 'order' => 'ASC']) as $p) {
            $q = aled08e_px_relance_quand($p['prospect']);
            if (time() >= $q && time() <= aled08e_px_code_fin($p['prospect'])) $relancer[] = $p + ['sujet_envoye' => $p['sujet'], 'a_clique' => $p['clics'] > 0];
        }
        // ceux qui ont cliqué d'abord : ils ont montré de l'intérêt
        usort($relancer, function ($a, $b) { return (int) $b['a_clique'] <=> (int) $a['a_clique']; });
        $relancer = array_slice($relancer, 0, max(0, $restant));
        $out['travail'] = [
            'a_verifier' => $r['active'] ? aled08e_px_liste(['etat' => ['nouveau'], 'limite' => 30, 'orderby' => 'date', 'order' => 'ASC']) : [],
            'a_ecrire' => $r['active'] ? aled08e_px_liste(['etat' => ['a_ecrire'], 'limite' => max(1, min(50, $restant)), 'meta_key' => '_aled08_px_note', 'order' => 'DESC']) : [],
            'a_relancer' => $relancer,
            'quota' => ['jour' => $r['quota_jour'], 'restant' => $restant, 'cette_heure' => $r['envois_cette_heure'], 'max_par_heure' => ALED08E_PX_HEURE_MAX, 'attendre_minutes' => aled08e_px_attente_minutes()],
        ];
        $peutEnvoyer = $r['site_et_ventes_ouverts'] && $r['heure_d_envoi'] && $restant > 0;
        $w = $out['travail'];
        if ($pourquoi === '' && !$w['a_verifier'] && (!$peutEnvoyer || (!$w['a_ecrire'] && !$w['a_relancer']))) {
            $pourquoi = !$r['site_et_ventes_ouverts'] ? 'Le site ou les ventes ne sont pas ouverts : aucun envoi.' : (!$r['heure_d_envoi'] ? 'Hors des heures d’envoi (semaine, 8 h à 18 h).' : ($restant <= 0 ? 'Quota du jour atteint.' : 'Personne à vérifier, à écrire ni à relancer.'));
        }
        $out['travail']['peut_envoyer'] = $peutEnvoyer;
        $out['travail']['offre'] = aled08e_px_offre_txt();
    }
    if ($r['active'] && function_exists('aled08e_px_ce_qui_marche')) $out['travail']['ce_qui_marche'] = aled08e_px_ce_qui_marche();
    $out['rien_a_faire'] = $pourquoi !== '';
    if ($pourquoi !== '') $out['pourquoi'] = $pourquoi;
    if (!$out['rien_a_faire']) {
        $out['fiche_de_poste'] = aled08e_regles_texte('agent-' . $agent);
        $out['a_lire_ensuite'] = 'Lisez aussi GET /aled08/v1/atelier/regles?fichier=prospection (qui cibler, la note, les sources autorisées, ce qui est interdit).';
        $out['memoire'] = ['decisions_et_lecons' => function_exists('aled08e_memoire_lire') ? aled08e_memoire_lire(['type' => ['decision', 'lecon'], 'limite' => 40]) : []];
    }
    return $out;
}
/* Pour Jarvis : le bilan de la semaine (chaque lundi dans son point) */
function aled08e_px_bilan_jarvis() {
    $r = aled08e_px_resume();
    $s = $r['semaine'];
    $alerte = [];
    $env = (int) $s['envois'] + (int) $s['relances'];
    if ($r['active'] && $env >= 20 && (int) $s['desinscrits'] * 20 > $env) $alerte[] = 'Plus de 5 % de désinscriptions cette semaine : les mails ou les cibles sont à revoir.';
    if ($r['active'] && !$r['site_et_ventes_ouverts']) $alerte[] = 'La prospection est allumée, mais le site ou les ventes sont fermés : rien ne part.';
    $pause = (array) get_option('aled08_prospection_pause', []);
    if (!$r['active'] && !empty($pause['le']) && (int) $pause['le'] > time() - 8 * DAY_IN_SECONDS) $alerte[] = 'La prospection s’est mise en pause toute seule le ' . wp_date('j F', (int) $pause['le']) . ' : ' . (string) ($pause['raison'] ?? '') . ' Alex décide de la rallumer ou non.';
    return ['active' => $r['active'], 'sept_derniers_jours' => ['envoyes' => (int) $s['envois'], 'relances' => (int) $s['relances'], 'clics_demo' => (int) $s['clics_demo'], 'clics_apercu' => (int) $s['clics_apercu'], 'clics_site' => (int) $s['clics_site'],
        'reponses' => (int) $s['repondus'], 'interesses' => (int) $s['interesses'], 'desinscriptions' => (int) $s['desinscrits'], 'adresses_fausses' => (int) $s['rebonds'], 'commandes' => (int) $s['commandes'], 'trouves' => (int) $s['ajoutes']],
        'depuis_le_debut' => $r['total'], 'quota_jour' => $r['quota_jour'], 'a_signaler' => $alerte,
        'ce_qui_marche' => function_exists('aled08e_px_ce_qui_marche') ? aled08e_px_ce_qui_marche() : null];
}

/* ====================================================================== les routes */
add_action('rest_api_init', function () {
    $perm = function () { return current_user_can('manage_options'); };
    register_rest_route('aled08/v1', '/atelier/prospects', [
        ['methods' => 'GET', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
            $etat = array_filter(array_map('sanitize_key', explode(',', (string) $r->get_param('etat'))));
            return new WP_REST_Response(['prospects' => aled08e_px_liste(['etat' => $etat, 'q' => (string) $r->get_param('q'), 'limite' => (int) ($r->get_param('limite') ?: 50), 'page' => (int) ($r->get_param('page') ?: 1), 'detail' => (bool) $r->get_param('detail')]),
                'resume' => aled08e_px_resume(), 'etats' => aled08e_px_etats()], 200);
        }],
        ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => function (WP_REST_Request $r) {
            if (!aled08e_px_collecte()) return new WP_Error('aled08_px', 'La prospection est éteinte : on ne collecte rien.', ['status' => 403]);
            $d = (array) $r->get_json_params();
            $liste = isset($d['prospects']) ? array_values((array) $d['prospects']) : (isset($d['email']) ? [$d] : []);
            $zone = (array) ($d['zone'] ?? []);
            $noteZone = !empty($zone['departement']) && !empty($zone['metier']) ? aled08e_px_tournee_noter($zone['departement'], $zone['metier']) : false;
            if (!$liste && !$noteZone) return new WP_Error('aled08_px', 'Rien à ajouter : envoyez {"prospects": [...]} (50 au plus), et la zone faite dans {"zone": {"departement", "metier"}}.', ['status' => 400]);
            if (count($liste) > 50) return new WP_Error('aled08_px', '50 prospects au plus par envoi.', ['status' => 400]);
            $res = [];
            foreach ($liste as $x) $res[] = aled08e_px_ajouter($x);
            $aj = array_filter($res, function ($x) { return !empty($x['ok']); });
            return new WP_REST_Response(['ok' => true, 'ajoutes' => count(array_filter($aj, function ($x) { return $x['etat'] === 'nouveau'; })), 'ecartes_note' => count(array_filter($aj, function ($x) { return $x['etat'] === 'ecarte'; })),
                'refuses' => count($res) - count($aj), 'detail' => $res, 'zone_notee' => $noteZone, 'zone_suivante' => aled08e_px_zone_suivante()], 200);
        }],
    ]);
    register_rest_route('aled08/v1', '/atelier/prospect', ['methods' => 'POST', 'permission_callback' => $perm, 'callback' => 'aled08e_px_faire']);
});

/* ====================================================================== les pages publiques : un clic, une désinscription */
function aled08e_px_lire_jeton($v, $avec_quoi) {
    $v = preg_replace('/[^a-z0-9-]/', '', strtolower((string) $v));
    $x = explode('-', $v);
    if ($avec_quoi && count($x) === 3) return ['id' => (int) $x[0], 'quoi' => $x[1], 'sig' => $x[2]];
    if (!$avec_quoi && count($x) === 2) return ['id' => (int) $x[0], 'quoi' => 'stop', 'sig' => $x[1]];
    return null;
}
add_action('init', function () {
    // un clic dans le mail : noté sur le prospect, puis la page demandée. Pas de pixel, rien d'autre.
    if (isset($_GET['lmm_px'])) {
        $j = aled08e_px_lire_jeton(wp_unslash($_GET['lmm_px']), true);
        $dest = aled08e_px_destinations();
        $vers = $j && isset($dest[$j['quoi']]) ? $dest[$j['quoi']] : home_url('/');
        if ($j && isset($dest[$j['quoi']]) && hash_equals(aled08e_px_signe($j['id'], $j['quoi']), $j['sig']) && aled08e_px_get($j['id'])) {
            $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
            $robot = ($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET' || $ua === '' || preg_match('/bot|crawl|spider|preview|scan|safelinks|proofpoint|mimecast|barracuda|curl|wget|python|headless/i', $ua);
            if (!$robot) {
                $l = (array) aled08e_px_meta($j['id'], 'clics', []);
                $l[] = ['vers' => $j['quoi'], 'le' => wp_date('Y-m-d H:i')];
                aled08e_px_set($j['id'], 'clics', array_slice($l, -20));
                aled08e_px_set($j['id'], 'nb_clics', (int) aled08e_px_meta($j['id'], 'nb_clics', 0) + 1);
                aled08e_px_stat($j['quoi'] === 'demo' ? 'clics_demo' : 'clics_site');
                delete_transient('aled08e_px_appr');
            }
        }
        nocache_headers();
        wp_safe_redirect($vers, 302);
        exit;
    }
    // la désinscription en un clic : prise en compte tout de suite, sans connexion (et en POST pour le bouton des messageries)
    if (isset($_GET['lmm_stop'])) {
        $j = aled08e_px_lire_jeton(wp_unslash($_GET['lmm_stop']), false);
        $ok = $j && hash_equals(aled08e_px_signe($j['id'], 'stop'), $j['sig']) && aled08e_px_desinscrire($j['id'], 'Lien de désinscription du mail.');
        nocache_headers();
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') { status_header($ok ? 200 : 400); header('Content-Type: text/plain; charset=UTF-8'); echo $ok ? 'Désinscription enregistrée.' : 'Lien inconnu.'; exit; }
        status_header($ok ? 200 : 400);
        header('Content-Type: text/html; charset=UTF-8');
        header('X-Robots-Tag: noindex, nofollow');
        $titre = $ok ? 'C’est noté, vous ne recevrez plus rien' : 'Ce lien ne fonctionne pas';
        $texte = $ok ? 'Votre adresse est retirée de nos envois : vous ne recevrez plus aucun message de prospection des Minis Monstres. Merci de nous l’avoir dit, et belle continuation !'
            : 'Le lien semble incomplet. Pour ne plus rien recevoir, répondez simplement au message avec le mot « STOP » : nous retirerons votre adresse tout de suite.';
        echo '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>' . esc_html($titre) . ' · Les Minis Monstres</title></head>'
            . '<body style="margin:0;background:#f4f1fb;font-family:Arial,Helvetica,sans-serif;color:#2e2a47;"><main style="max-width:560px;margin:0 auto;padding:40px 16px;">'
            . '<div style="background:#ffffff;border:1px solid #e6e1f5;border-radius:22px;padding:28px 24px;">'
            . '<p style="margin:0 0 18px;font-size:17px;font-weight:bold;"><img src="' . esc_url(get_template_directory_uri() . '/assets/img/logo-192.png') . '" width="40" height="40" alt="" style="vertical-align:middle;border-radius:10px;margin-right:10px;">Les Minis Monstres</p>'
            . '<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">' . esc_html($titre) . '</h1>'
            . '<p style="margin:0 0 18px;font-size:16px;line-height:1.6;">' . esc_html($texte) . '</p>'
            . '<p style="margin:0;font-size:14px;"><a href="' . esc_url(home_url('/')) . '" style="color:#6a5bd6;">Aller sur le site</a></p></div>'
            . '<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#7a7795;text-align:center;">' . esc_html(aled08e_px_identite()) . '</p></main></body></html>';
        exit;
    }
}, 2);

/* ====================================================================== une commande avec le code (ou l'adresse) d'un prospect */
add_action('aled08e_commande_recue', function ($cid, $cfg, $coord) {
    $id = 0;
    if (!empty($cfg['code_evenement']) && ($cfg['remise_sur'] ?? '') === 'creation') $id = aled08e_px_par_code($cfg['code_evenement']);
    if (!$id && !empty($coord['email'])) $id = aled08e_px_cherche('email', aled08e_px_norm_email($coord['email']), ['envoye', 'relance', 'repondu', 'desinscrit']);
    if (!$id || aled08e_px_meta($id, 'commande', 0)) return;
    $ref = (string) get_post_meta((int) $cid, '_aled08_ref', true);
    aled08e_px_set($id, 'commande', (int) $cid);
    aled08e_px_set($id, 'commande_ref', $ref);
    aled08e_px_set($id, 'commande_le', time());
    aled08e_px_set($id, 'etat', 'commande');
    aled08e_px_journal($id, 'A commandé : ' . $ref . (!empty($cfg['remise_sur']) ? ' (avec son code)' : ' (sans le code, même adresse e-mail)') . '.');
    aled08e_px_stat('commandes');
    if (function_exists('aled08e_cmd_journal')) aled08e_cmd_journal((int) $cid, 'Client venu de la prospection par e-mail (' . get_the_title($id) . ').');
}, 10, 3);
add_action('aled08e_statut_change', function ($cid, $statut, $old) {
    if ($statut !== 'payee') return;
    $id = aled08e_px_cherche('commande', (int) $cid);
    if ($id) { aled08e_px_set($id, 'commande_payee', 1); aled08e_px_journal($id, 'Commande payée.'); }
}, 10, 3);

/* ====================================================================== le ménage (chaque jour) */
/* Un prospect écarté s'efface après 180 jours ; un prospect à qui l'on n'a jamais écrit aussi (collecté pour plus tard,
 * on ne garde pas sans fin) ; un prospect sans suite, trois ans après le dernier contact (durée conseillée par la CNIL).
 * Les désinscriptions restent dans la liste d'opposition (empreintes) : on ne réécrit jamais. */
add_action('aled08_quotidien', function () {
    $effacer = function ($etats, $jours, $cle = '') {
        $q = ['post_type' => ALED08E_CPT_PROSPECT, 'post_status' => 'private', 'numberposts' => 200, 'fields' => 'ids', 'suppress_filters' => true,
            'meta_query' => [['key' => '_aled08_px_etat', 'value' => $etats, 'compare' => 'IN']]];
        if ($cle === '') $q['date_query'] = [['before' => $jours . ' days ago']];
        else $q['meta_query'][] = ['key' => '_aled08_px_' . $cle, 'value' => time() - $jours * DAY_IN_SECONDS, 'compare' => '<', 'type' => 'NUMERIC'];
        foreach (get_posts($q) as $id) wp_delete_post((int) $id, true);
    };
    $effacer(['ecarte'], 180);
    $effacer(['nouveau', 'a_ecrire'], 180);
    $effacer(['envoye', 'relance', 'repondu', 'desinscrit'], 3 * 365, 'envoye_le');
}, 80);

/* ====================================================================== l'espace de gestion d'Alex (includes/gestion.php) */
function aled08e_px_gestion_action($quoi, $P) {
    if ($quoi === 'prospection_on' || $quoi === 'prospection_off') {
        update_option('aled08_prospection_active', $quoi === 'prospection_on' ? '1' : '0', false);
        return $quoi === 'prospection_on' ? 'px_on' : 'px_off';
    }
    $id = (int) ($P['prospect'] ?? 0);
    $p = $id ? aled08e_px_get($id) : null;
    if (!$p) return 'erreur';
    if ($quoi === 'prospection_repondu' && in_array($p['etat'], ['envoye', 'relance'], true)) {
        aled08e_px_set($id, 'repondu_le', time()); aled08e_px_set($id, 'etat', 'repondu'); aled08e_px_journal($id, 'A répondu (noté par Alex).'); aled08e_px_stat('repondus');
        return 'px_ok';
    }
    if ($quoi === 'prospection_stop') { aled08e_px_desinscrire($id, 'Demande d’arrêt notée par Alex.'); return 'px_ok'; }
    return 'erreur';
}
function aled08e_px_bloc_gestion($act, $nonce) {
    $r = aled08e_px_resume();
    $s = $r['semaine'];
    $t = $r['total'];
    $derniers = aled08e_px_liste(['etat' => ['envoye', 'relance', 'repondu', 'desinscrit', 'commande'], 'limite' => 20, 'meta_key' => '_aled08_px_envoye_le', 'order' => 'DESC']);
    $h = '<p class="app-sub" id="prospection">' . aled08e_icon('send') . ' Prospection par e-mail</p>';
    $h .= '<p class="' . ($r['active'] ? 'esp-empty' : 'esp-warn') . '">' . ($r['active']
        ? '<b>Allumée.</b> Quota du jour : ' . (int) $r['envoyes_aujourdhui'] . ' envoyés sur ' . (int) $r['quota_jour'] . ' (plafond ' . (int) $r['quota_max'] . ', ' . ALED08E_PX_HEURE_MAX . ' par heure au plus, en semaine de 8 h à 18 h).'
            . (!$r['site_et_ventes_ouverts'] ? ' <b>Rien ne part tant que le site et les ventes ne sont pas ouverts.</b>' : '')
        : '<b>Éteinte.</b> Aucun prospect n’est cherché, aucun mail ne part. Le Repéreur et le Facteur s’arrêtent tout de suite.') . '</p>';
    $h .= '<div class="app-cards ges-cards">'
        . '<div class="app-card c-sky"><span class="app-card-ico">' . aled08e_icon('send') . '</span><span><small>Écrits (7 jours)</small><strong>' . ((int) $s['envois'] + (int) $s['relances']) . '</strong></span></div>'
        . '<div class="app-card c-lilac"><span class="app-card-ico">' . aled08e_icon('eye') . '</span><span><small>Clics dans les mails (7 jours)</small><strong>' . ((int) $s['clics_demo'] + (int) $s['clics_apercu'] + (int) $s['clics_site']) . '</strong></span></div>'
        . '<div class="app-card c-mint"><span class="app-card-ico">' . aled08e_icon('message-circle') . '</span><span><small>Réponses · commandes</small><strong>' . (int) $t['repondu'] . ' · ' . (int) $t['commande'] . '</strong></span></div>'
        . '<div class="app-card c-pink"><span class="app-card-ico">' . aled08e_icon('x') . '</span><span><small>Désinscrits</small><strong>' . (int) $t['desinscrit'] . '</strong></span></div></div>';
    $h .= '<p class="app-note">En attente : ' . (int) $t['nouveau'] . ' à vérifier, ' . (int) $t['a_ecrire'] . ' à écrire. Depuis le début : ' . ((int) $t['envoye'] + (int) $t['relance'] + (int) $t['repondu'] + (int) $t['desinscrit'] + (int) $t['commande']) . ' écrits, ' . (int) $r['clics_total'] . ' clics, ' . (int) $t['ecarte'] . ' écartés. '
        . 'Offre du mail : ' . esc_html($r['offre']['en_clair']) . '. Les réponses arrivent à ' . esc_html($r['adresse_reponses']) . ' : le Répondeur les lit, désinscrit ceux qui disent stop et vous prépare les réponses. Vous pouvez aussi les noter ici.</p>';
    if ($derniers) {
        $h .= '<ul class="ges-list">';
        foreach ($derniers as $p) {
            $h .= '<li class="ges-item ges-mini"><div class="ges-head"><strong>' . esc_html($p['entreprise']) . '</strong><em class="st ' . (in_array($p['etat'], ['repondu', 'commande'], true) ? 'st-done' : ($p['etat'] === 'desinscrit' ? 'esp-st-off' : 'st-doing')) . '">' . esc_html($p['etat_libelle']) . '</em></div>'
                . '<p class="ges-meta">' . esc_html($p['metier'] . ' · ' . $p['ville'] . ' (' . $p['departement'] . ') · écrit le ' . wp_date('j/m', (int) aled08e_px_meta($p['prospect'], 'envoye_le', 0)) . ($p['relance_le'] ? ', relancé le ' . wp_date('j/m', (int) aled08e_px_meta($p['prospect'], 'relance_le', 0)) : '') . ' · ' . $p['clics'] . ' clic' . ($p['clics'] > 1 ? 's' : '') . ' · ' . $p['code'] . ($p['commande'] ? ' · ' . $p['commande'] : '')) . '</p>';
            if (in_array($p['etat'], ['envoye', 'relance'], true)) {
                $h .= '<form method="post" action="' . $act . '" style="display:inline">' . $nonce . '<input type="hidden" name="prospect" value="' . (int) $p['prospect'] . '"><button class="btn btn-light btn-sm" type="submit" name="aled08e_gestion" value="prospection_repondu">' . aled08e_icon('message-circle') . '<span>A répondu</span></button> '
                    . '<button class="btn btn-light btn-sm" type="submit" name="aled08e_gestion" value="prospection_stop">' . aled08e_icon('x') . '<span>Ne plus lui écrire</span></button></form>';
            }
            $h .= '</li>';
        }
        $h .= '</ul>';
    }
    $h .= '<form method="post" action="' . $act . '">' . $nonce . '<input type="hidden" name="aled08e_gestion" value="' . ($r['active'] ? 'prospection_off' : 'prospection_on') . '">'
        . '<button class="btn ' . ($r['active'] ? 'btn-light' : 'btn-primary') . ' btn-sm" type="submit">' . aled08e_icon($r['active'] ? 'x' : 'rocket') . '<span>' . ($r['active'] ? 'Couper la prospection' : 'Allumer la prospection') . '</span></button></form>';
    return $h;
}

/* ====================================================================== les Réglages (includes/admin.php) */
function aled08e_px_reglages_html() {
    echo '<h2>Prospection par e-mail</h2><p>Le Repéreur trouve des entreprises sans site, le Facteur leur écrit (' . esc_html(aled08e_px_offre_txt()) . '), le Répondeur lit les réponses. Rien ne part tant que la case n’est pas cochée, ni tant que le site et les ventes ne sont pas ouverts. Les règles : <code>regles/prospection.md</code>.</p>'
        . '<table class="form-table" role="presentation"><tr><th>Prospection activée</th><td><input type="hidden" name="prospection_present" value="1"><label><input type="checkbox" name="prospection_active" value="1"' . checked(aled08e_px_active(), true, false) . '> Le Repéreur cherche et le Facteur écrit</label>'
        . '<p class="description">Décoché (par défaut) : aucun prospect n’est cherché, aucun mail ne part, et les deux agents s’arrêtent tout de suite. Les codes déjà envoyés restent valables jusqu’à leur date.</p></td></tr>'
        . '<tr><th><label for="aled08e-px-dep">Envois par jour au départ</label></th><td><input type="number" min="0" max="500" id="aled08e-px-dep" name="prospection_quota_depart" value="' . (int) get_option('aled08_prospection_quota_depart', 20) . '" class="small-text"> '
        . '<label for="aled08e-px-max">plafond</label> <input type="number" min="0" max="1000" id="aled08e-px-max" name="prospection_quota_max" value="' . (int) get_option('aled08_prospection_quota_max', 150) . '" class="small-text">'
        . '<p class="description">Le quota monte de ' . ALED08E_PX_PALIER . ' chaque semaine depuis le premier envoi, jusqu’au plafond. Les relances comptent. ' . ALED08E_PX_HEURE_MAX . ' envois par heure au plus, en semaine de 8 h à 18 h.</p></td></tr>'
        . '<tr><th><label for="aled08e-px-exp">Adresse d’envoi</label></th><td><input type="email" id="aled08e-px-exp" name="prospection_expediteur" value="' . esc_attr((string) get_option('aled08_prospection_expediteur', '')) . '" class="regular-text" placeholder="' . esc_attr(aled08e_mail_from()) . '">'
        . '<p class="description">Vide : les mails partent de l’adresse du site (' . esc_html(aled08e_mail_from()) . '), la même que celle des clients. Conseillé : une adresse à part, créée chez l’hébergeur (par exemple alex@bonjour.votre-domaine.fr), pour que les mails des clients ne souffrent jamais d’un signalement.</p></td></tr>'
        . '<tr><th><label for="aled08e-px-rep">Adresse des réponses</label></th><td><input type="email" id="aled08e-px-rep" name="prospection_reponse" value="' . esc_attr((string) get_option('aled08_prospection_reponse', '')) . '" class="regular-text" placeholder="' . esc_attr(aled08e_to()) . '">'
        . '<p class="description">Vide : les réponses arrivent à ' . esc_html(aled08e_to()) . '. Le Répondeur lit cette boîte dans Gmail : l’adresse doit donc arriver dans votre Gmail (directement, ou par un transfert automatique).</p></td></tr>'
        . '<tr><th><label for="aled08e-px-serper">Clé de mesure Google (Serper)</label></th><td><input type="password" id="aled08e-px-serper" name="prospection_serper" value="" class="regular-text" autocomplete="off" placeholder="' . (get_option('aled08_prospection_serper', '') !== '' ? 'Clé enregistrée (laisser vide pour la garder)' : 'Collez votre clé ici') . '">'
        . (get_option('aled08_prospection_serper', '') !== '' ? ' <label><input type="checkbox" name="prospection_serper_effacer" value="1"> Effacer la clé</label>' : '')
        . '<p class="description">Avec cette clé (compte sur serper.dev), le site mesure la position de chaque entreprise sur Google avant le premier mail, et le mail le dit : « En tapant coiffeur Signy-l’Abbaye sur Google, votre page Facebook arrive en 36e position ». Sans clé, le mail n’en parle pas.</p></td></tr></table>';
}
function aled08e_px_reglages_save($P) {
    if (empty($P['prospection_present'])) return;
    update_option('aled08_prospection_active', !empty($P['prospection_active']) ? '1' : '0', false);
    if (isset($P['prospection_quota_depart'])) update_option('aled08_prospection_quota_depart', max(0, min(500, (int) $P['prospection_quota_depart'])), false);
    if (isset($P['prospection_quota_max'])) update_option('aled08_prospection_quota_max', max(0, min(1000, (int) $P['prospection_quota_max'])), false);
    if (!empty($P['prospection_serper_effacer'])) delete_option('aled08_prospection_serper');
    elseif (isset($P['prospection_serper']) && trim((string) $P['prospection_serper']) !== '') update_option('aled08_prospection_serper', preg_replace('/[^A-Za-z0-9_-]/', '', wp_unslash((string) $P['prospection_serper'])), false);
    foreach (['prospection_expediteur' => 'aled08_prospection_expediteur', 'prospection_reponse' => 'aled08_prospection_reponse'] as $champ => $opt) {
        if (!isset($P[$champ])) continue;
        $e = sanitize_email(wp_unslash((string) $P[$champ]));
        update_option($opt, is_email($e) ? $e : '', false);
    }
}
