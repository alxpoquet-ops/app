<?php
/**
 * Le parrainage (25 novembre 2026, demande d'Alex : « montrer la puissance du parrainage »).
 *
 * Chaque compte a un code (aled08e_code, par exemple CAMILL-7KQ) et un lien /creer-mon-site/?code=CODE. Un nouveau client tape
 * ce code dans « Code promo ou parrainage » en commandant son site. Quand son site est en ligne :
 *  - le filleul reçoit 6 mois de forfait Mini offerts (s'il a pris le forfait Mini) ;
 *  - le parrain reçoit 6 mois de forfait Mini offerts, pour CHAQUE filleul, sans limite.
 * Les mois offerts (aled08e_mois_offerts_ajouter) :
 *  - abonnement Stripe en cours : ses factures sont suspendues (pause_collection, factures annulées) jusqu'à la nouvelle date,
 *    rallongée de 6 mois à chaque filleul ;
 *  - forfait déjà offert (lot du jeu-concours) : la date de fin recule de 6 mois ;
 *  - forfait pas encore démarré : les mois sont gardés (méta aled08_mois_offerts) et deviennent une période d'essai au démarrage
 *    du forfait (includes/stripe.php, trial_end).
 * La durée vient de config.fidelite.parrainageMois (data.json : parrainageMois).
 */
defined('ABSPATH') || exit;

function aled08e_parrainage_mois() { return max(1, (int) (aled08e_data()['parrainageMois'] ?? 6)); }

/* Ajoute des mois de forfait Mini offerts à un compte. Renvoie une phrase pour le journal. */
function aled08e_mois_offerts_ajouter($uid, $mois, $raison = '') {
    $uid = (int) $uid; $mois = (int) $mois;
    if (!$uid || $mois <= 0) return '';
    $sub = aled08e_meta($uid, 'stripe_subscription');
    // 1. un abonnement Stripe en cours : on suspend ses factures, et on rallonge à chaque nouveau filleul
    if ($sub !== '' && in_array(aled08e_meta($uid, 'abonnement'), ['active', 'trialing', 'past_due'], true) && function_exists('aled08e_stripe_ready') && aled08e_stripe_ready()) {
        $s = aled08e_stripe_request('GET', '/v1/subscriptions/' . rawurlencode($sub), [], '', true);
        if (!is_wp_error($s) && !empty($s['id'])) {
            $depuis = max(time(), (int) ($s['pause_collection']['resumes_at'] ?? 0), (int) ($s['trial_end'] ?? 0));
            $fin = strtotime('+' . $mois . ' months', $depuis);
            $r = aled08e_stripe_request('POST', '/v1/subscriptions/' . rawurlencode($sub), ['pause_collection' => ['behavior' => 'void', 'resumes_at' => $fin]], 'parrainage-' . $uid . '-' . $fin, true);
            if (!is_wp_error($r)) {
                update_user_meta($uid, 'aled08_mois_offerts_jusquau', $fin);
                return aled08e_mois_txt($mois) . ' offerts : les factures du forfait reprennent le ' . aled08e_date_fr($fin, false) . '.';
            }
        }
    }
    // 2. le forfait est déjà offert (lot du jeu-concours) : la fin recule
    $offFin = (int) aled08e_meta($uid, 'offert_fin');
    if (aled08e_meta($uid, 'offert') === '1' && $offFin) {
        $fin = strtotime('+' . $mois . ' months', max(time(), $offFin));
        update_user_meta($uid, 'aled08_offert_fin', $fin);
        delete_user_meta($uid, 'aled08_offert_rappel');
        return aled08e_mois_txt($mois) . ' offerts : forfait offert jusqu’au ' . aled08e_date_fr($fin, false) . '.';
    }
    // 3. le forfait n'a pas commencé : les mois attendent son démarrage
    update_user_meta($uid, 'aled08_mois_offerts', (int) aled08e_meta($uid, 'mois_offerts') + $mois);
    return aled08e_mois_txt($mois) . ' offerts, gardés pour le démarrage du forfait (' . (int) aled08e_meta($uid, 'mois_offerts') . ' mois en tout).';
}

/* Le site du filleul est en ligne : 6 mois pour lui (s'il a le forfait Mini) et 6 mois pour son parrain, une seule fois par commande */
function aled08e_parrainage_recompenser($cmd) {
    if (empty($cmd['parrain']) || empty($cmd['user']) || get_post_meta($cmd['id'], '_aled08_parrain_prevenu', true)) return;
    $p = aled08e_user_by_code($cmd['parrain']);
    if (!$p || (int) $p->ID === (int) $cmd['user']) return;
    update_post_meta($cmd['id'], '_aled08_parrain_prevenu', 1);
    $mois = aled08e_parrainage_mois();
    if (aled08e_meta($cmd['user'], 'parrain') === '') update_user_meta($cmd['user'], 'aled08_parrain', aled08e_clean_code($cmd['parrain']));
    $txtP = aled08e_mois_offerts_ajouter($p->ID, $mois, 'parrain');
    $txtF = ($cmd['forfait'] ?? '') === 'base' ? aled08e_mois_offerts_ajouter($cmd['user'], $mois, 'filleul') : '';
    aled08e_cmd_journal($cmd['id'], 'Parrainage par ' . $p->display_name . ' : parrain, ' . $txtP . ($txtF !== '' ? ' Filleul, ' . $txtF : ' Le filleul n’a pas le forfait Mini : rien pour lui.'));
    $nbF = count(aled08e_filleuls($p->ID));
    $h = aled08e_mail_headers('Les Minis Monstres <' . aled08e_to() . '>');
    wp_mail($p->user_email, 'Parrainage : ' . aled08e_mois_txt($mois) . ' de forfait Mini offerts !', 'Bonjour ' . aled08e_prenom($p) . ",\n\n"
        . 'Bonne nouvelle : le site de ' . $cmd['prenom'] . ($cmd['entreprise'] ? ' (' . $cmd['entreprise'] . ')' : '') . ', que vous avez parrainé, est en ligne. Merci pour votre confiance !' . "\n\n"
        . 'Vous recevez ' . aled08e_mois_txt($mois) . ' de forfait Mini offerts. ' . $txtP . "\n"
        . 'Vous avez déjà parrainé ' . $nbF . ' site' . ($nbF > 1 ? 's' : '') . '. Chaque nouveau filleul vous rapporte encore ' . aled08e_mois_txt($mois) . ".\n\n"
        . "Votre code et votre lien de parrainage sont dans votre espace client :\n" . aled08e_url() . "\n\nÀ bientôt,\nAlex et les Minis Monstres\n", $h);
    if ($txtF !== '') wp_mail($cmd['email'], 'Votre parrainage : ' . aled08e_mois_txt($mois) . ' de forfait Mini offerts', 'Bonjour ' . $cmd['prenom'] . ",\n\n"
        . 'Votre site est en ligne, et vous êtes venu grâce à ' . aled08e_prenom($p) . ' : vous recevez ' . aled08e_mois_txt($mois) . ' de forfait Mini offerts. ' . $txtF . "\n\n"
        . 'À votre tour : votre code de parrainage est dans votre espace client. Chaque proche qui crée son site avec lui vous rapporte ' . aled08e_mois_txt($mois) . " de forfait offerts, et à lui aussi.\n" . aled08e_url() . "\n\nÀ bientôt,\nAlex et les Minis Monstres\n", $h);
    wp_mail(aled08e_to(), 'Parrainage récompensé : ' . $p->display_name . ' → ' . aled08e_cmd_nom($cmd), 'Parrain : ' . $p->display_name . ' <' . $p->user_email . ">\n" . $txtP . "\n\nFilleul : " . aled08e_cmd_nom($cmd) . ' (' . $cmd['ref'] . ")\n" . ($txtF !== '' ? $txtF : 'Pas de forfait Mini : rien pour lui.') . "\n", aled08e_mail_headers());
    if (function_exists('aled08e_memoire_ajouter')) aled08e_memoire_ajouter('journal', 'Parrainage : ' . $p->display_name . ' a parrainé ' . aled08e_cmd_nom($cmd), $txtP . ' ' . $txtF, (int) $p->ID, 'claude');
}

/* Les mois offerts encore à venir, en clair, pour l'espace client */
function aled08e_mois_offerts_txt($uid) {
    $attente = (int) aled08e_meta($uid, 'mois_offerts');
    $jusq = (int) aled08e_meta($uid, 'mois_offerts_jusquau');
    if ($jusq > time()) return 'Votre forfait Mini est offert jusqu’au ' . aled08e_date_fr($jusq, false) . '.';
    if ($attente > 0) return 'Vous avez ' . aled08e_mois_txt($attente) . ' de forfait Mini offerts, qui commenceront au démarrage de votre forfait.';
    return '';
}

/* Le bloc « Parrainage » de l'espace client : le code, le lien, le partage, les chiffres */
function aled08e_parrainage_html($uid, $compact = false) {
    $mois = aled08e_parrainage_mois();
    $code = aled08e_code($uid);
    $lien = add_query_arg('code', $code, home_url('/creer-mon-site/'));
    $f = aled08e_forfait('base');
    $valeur = (float) ($f['month'] ?? 10) * $mois;
    $fil = aled08e_filleuls($uid);
    $msg = 'Je te recommande les Minis Monstres pour ton site internet. Avec mon code ' . $code . ', on a chacun ' . $mois . ' mois de forfait offerts : ' . $lien;
    $wa = 'https://wa.me/?text=' . rawurlencode($msg);
    $sms = 'sms:?&body=' . rawurlencode($msg);
    $mail = 'mailto:?subject=' . rawurlencode('Un site internet avec les Minis Monstres') . '&body=' . rawurlencode($msg);
    $id = 'parrain-lien-' . ($compact ? 'a' : 'b');
    $h = '<div class="pr-bloc' . ($compact ? ' is-compact' : '') . '">';
    $h .= '<div class="pr-tete"><span class="pr-art" aria-hidden="true">' . aled08e_monster('ruban') . '</span><div><p class="pr-sur">Parrainage</p>'
        . '<h3 class="pr-titre">' . esc_html($mois) . ' mois offerts pour vous, ' . esc_html($mois) . ' mois pour votre filleul</h3>'
        . '<p class="pr-txt">Un proche crée son site avec votre code : dès que son site est en ligne, vous recevez chacun ' . esc_html($mois) . ' mois de forfait Mini offerts (' . esc_html(aled08e_euro_txt($valeur)) . '). Sans limite : 2 filleuls, c’est un an offert.</p></div></div>';
    $h .= '<div class="pr-code"><span>Votre code</span><b>' . esc_html($code) . '</b></div>';
    $h .= '<div class="pr-lien"><input class="copy-in" id="' . esc_attr($id) . '" type="text" readonly value="' . esc_attr($lien) . '" aria-label="Votre lien de parrainage">'
        . '<div class="pr-btns"><button type="button" class="btn btn-primary btn-sm" data-copy="' . esc_attr($id) . '" data-copy-msg="Lien de parrainage copié">' . aled08e_icon('link') . '<span>Copier le lien</span></button>'
        . '<a class="btn btn-light btn-sm" href="' . esc_url($wa) . '" target="_blank" rel="noopener">' . aled08e_icon('message-circle') . '<span>WhatsApp</span></a>'
        . '<a class="btn btn-light btn-sm" href="' . esc_url($sms, ['sms']) . '">' . aled08e_icon('smartphone') . '<span>SMS</span></a>'
        . '<a class="btn btn-light btn-sm" href="' . esc_url($mail, ['mailto']) . '">' . aled08e_icon('mail') . '<span>E-mail</span></a></div></div>';
    if (!$compact) {
        $n = count($fil);
        $h .= '<div class="pr-stats"><div><b>' . (int) $n . '</b><small>filleul' . ($n > 1 ? 's' : '') . ' en ligne</small></div><div><b>' . (int) ($n * $mois) . '</b><small>mois offerts gagnés</small></div><div><b>' . esc_html(aled08e_euro_txt($n * $valeur)) . '</b><small>économisés</small></div></div>';
        $t = aled08e_mois_offerts_txt($uid);
        if ($t !== '') $h .= '<p class="esp-ok">' . esc_html($t) . '</p>';
        if ($fil) { $h .= '<ul class="reqs">'; foreach ($fil as $fl) $h .= '<li><span><strong>' . esc_html(aled08e_prenom($fl)) . '</strong><small>site en ligne</small></span><em class="st st-done">' . esc_html($mois) . ' mois offerts</em></li>'; $h .= '</ul>'; }
        $h .= '<p class="pr-note">Tout est expliqué sur la <a href="' . esc_url(home_url('/parrainage/')) . '">page Parrainage</a> et dans les conditions générales (article 17).</p>';
    }
    return $h . '</div>';
}

/* Une date en français, à l'heure de Paris, quelle que soit la langue réglée dans WordPress (« 5 mars 2027 à 18 h 16 ») */
function aled08e_date_fr($ts, $heure = true) {
    $mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    try { $d = new DateTime('@' . (int) $ts); $d->setTimezone(new DateTimeZone('Europe/Paris')); } catch (Exception $e) { return ''; }
    $j = (int) $d->format('j');
    $t = ($j === 1 ? '1er' : $j) . ' ' . $mois[(int) $d->format('n') - 1] . ' ' . $d->format('Y');
    return $heure ? $t . ' à ' . (int) $d->format('G') . ' h ' . $d->format('i') : $t;
}
