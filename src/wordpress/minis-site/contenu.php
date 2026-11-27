<?php
/**
 * Les pages posées à l'installation. Des blocs WordPress tout simples : n'importe quel thème les affiche,
 * et tout ce qui est [entre crochets] est à remplacer par les mots du client.
 */
defined('ABSPATH') || exit;

/* ---------- de petits assembleurs de blocs ---------- */
function minis_site_b_titre($txt, $niv = 2, $ancre = '') {
    $a = ['level' => (int) $niv] + ($ancre ? ['anchor' => $ancre] : []);
    if ($niv === 2 && !$ancre) $a = [];
    return '<!-- wp:heading' . ($a ? ' ' . wp_json_encode($a) : '') . ' -->' . "\n" . '<h' . (int) $niv . ' class="wp-block-heading"' . ($ancre ? ' id="' . esc_attr($ancre) . '"' : '') . '>' . esc_html($txt) . '</h' . (int) $niv . '>' . "\n" . '<!-- /wp:heading -->' . "\n\n";
}
function minis_site_b_p($txt) { return '<!-- wp:paragraph -->' . "\n" . '<p>' . esc_html($txt) . '</p>' . "\n" . '<!-- /wp:paragraph -->' . "\n\n"; }
function minis_site_b_liste($items) {
    $h = '<!-- wp:list -->' . "\n" . '<ul class="wp-block-list">';
    foreach ($items as $i) $h .= '<!-- wp:list-item -->' . "\n" . '<li>' . esc_html($i) . '</li>' . "\n" . '<!-- /wp:list-item -->';
    return $h . '</ul>' . "\n" . '<!-- /wp:list -->' . "\n\n";
}
function minis_site_b_bouton($txt, $url) {
    return '<!-- wp:buttons -->' . "\n" . '<div class="wp-block-buttons"><!-- wp:button -->' . "\n" . '<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="' . esc_url($url) . '">' . esc_html($txt) . '</a></div>' . "\n" . '<!-- /wp:button --></div>' . "\n" . '<!-- /wp:buttons -->' . "\n\n";
}
function minis_site_b_colonnes($cols) {
    $h = '<!-- wp:columns -->' . "\n" . '<div class="wp-block-columns">';
    foreach ($cols as $c) $h .= '<!-- wp:column -->' . "\n" . '<div class="wp-block-column">' . trim(minis_site_b_titre($c[0], 3)) . "\n\n" . trim(minis_site_b_p($c[1])) . '</div>' . "\n" . '<!-- /wp:column -->' . "\n\n";
    return rtrim($h) . '</div>' . "\n" . '<!-- /wp:columns -->' . "\n\n";
}
function minis_site_b_formulaire() {
    $id = function_exists('minis_site_formulaire_id') ? minis_site_formulaire_id() : 0;
    if (!$id) return minis_site_b_p('[Le formulaire de contact se pose ici.]');
    return '<!-- wp:shortcode -->' . "\n" . '[contact-form-7 id="' . (int) $id . '" title="Formulaire de contact"]' . "\n" . '<!-- /wp:shortcode -->' . "\n\n";
}
function minis_site_b_coordonnees() {
    return minis_site_b_liste(['Téléphone : [06 00 00 00 00]', 'E-mail : [contact@votre-activite.fr]', 'Adresse : [numéro, rue, code postal, ville]', 'Horaires : [du lundi au vendredi, de 9 h à 18 h]']);
}
function minis_site_b_services() {
    return minis_site_b_colonnes([
        ['[Premier service]', '[Deux phrases simples : ce que vous faites, et pour qui.]'],
        ['[Deuxième service]', '[Deux phrases simples : ce que vous faites, et pour qui.]'],
        ['[Troisième service]', '[Deux phrases simples : ce que vous faites, et pour qui.]'],
    ]);
}

/* ---------- les pages, selon le type de site ---------- */
function minis_site_pages() {
    $nom = get_bloginfo('name') ?: '[Nom de l’activité]';
    $P = [];

    if (minis_site_type() === 'essentiel') {
        // une seule page : tout se lit en descendant
        $P['accueil'] = ['titre' => 'Accueil', 'slug' => 'accueil', 'contenu' =>
            minis_site_b_titre('[Votre métier], à [votre ville]', 1)
            . minis_site_b_p('[Une phrase qui dit ce que vous faites et pour qui. Courte, claire, chaleureuse.]')
            . minis_site_b_bouton('Me contacter', '#contact')
            . minis_site_b_titre('Qui sommes-nous ?', 2, 'presentation')
            . minis_site_b_p('[Présentez-vous en quelques lignes : votre histoire, votre savoir-faire, ce qui vous tient à cœur.]')
            . minis_site_b_titre('Nos services', 2, 'services')
            . minis_site_b_services()
            . minis_site_b_titre('Nous contacter', 2, 'contact')
            . minis_site_b_p('Une question, une envie ? Écrivez-nous ici : votre message nous arrive directement.')
            . minis_site_b_coordonnees()
            . minis_site_b_formulaire()];
    } else {
        $boutique = minis_site_type() === 'boutique';
        $contact = home_url('/contact/');
        $shop = function_exists('wc_get_page_id') && wc_get_page_id('shop') > 0 ? get_permalink(wc_get_page_id('shop')) : home_url('/boutique/');
        $P['accueil'] = ['titre' => 'Accueil', 'slug' => 'accueil', 'contenu' =>
            minis_site_b_titre('[Votre métier], à [votre ville]', 1)
            . minis_site_b_p('[Une phrase qui dit ce que vous faites et pour qui. Courte, claire, chaleureuse.]')
            . minis_site_b_bouton($boutique ? 'Voir la boutique' : 'Demander un devis', $boutique ? $shop : $contact)
            . minis_site_b_titre($boutique ? 'Ce que vous trouverez ici' : 'Nos services')
            . minis_site_b_services()
            . minis_site_b_titre('Pourquoi nous choisir ?')
            . minis_site_b_liste(['[Une première bonne raison : proche de chez vous, fait main, rapide…]', '[Une deuxième bonne raison.]', '[Une troisième bonne raison.]'])
            . minis_site_b_titre('Parlons de votre projet')
            . minis_site_b_p('[Une phrase d’invitation simple.]')
            . minis_site_b_bouton('Nous contacter', $contact)];
        $P['services'] = ['titre' => $boutique ? 'Nos créations' : 'Nos services', 'slug' => $boutique ? 'nos-creations' : 'services', 'contenu' =>
            minis_site_b_p('[Une phrase d’introduction : ce que vous proposez, dans quel secteur.]')
            . minis_site_b_titre('[Premier service]')
            . minis_site_b_p('[Décrivez ce service : pour qui, comment ça se passe, ce qui est compris.]')
            . minis_site_b_titre('[Deuxième service]')
            . minis_site_b_p('[Décrivez ce service : pour qui, comment ça se passe, ce qui est compris.]')
            . minis_site_b_titre('[Troisième service]')
            . minis_site_b_p('[Décrivez ce service : pour qui, comment ça se passe, ce qui est compris.]')
            . minis_site_b_bouton('Demander un devis', $contact)];
        $P['realisations'] = ['titre' => 'Réalisations', 'slug' => 'realisations', 'contenu' =>
            minis_site_b_p('[Quelques exemples de votre travail, en photos. Une photo vaut mieux qu’un long texte.]')
            . minis_site_b_colonnes([['[Réalisation 1]', '[Où, quand, et ce qui a été fait.]'], ['[Réalisation 2]', '[Où, quand, et ce qui a été fait.]'], ['[Réalisation 3]', '[Où, quand, et ce qui a été fait.]']])];
        $P['a-propos'] = ['titre' => 'À propos', 'slug' => 'a-propos', 'contenu' =>
            minis_site_b_p('[Votre histoire en quelques lignes : qui vous êtes, depuis quand, pourquoi ce métier.]')
            . minis_site_b_titre('Nos valeurs')
            . minis_site_b_liste(['[Une valeur qui compte pour vous.]', '[Une autre.]', '[Une dernière.]'])
            . minis_site_b_titre('Où nous trouver')
            . minis_site_b_p('[Votre secteur : les villes et villages où vous intervenez.]')];
        $P['faq'] = ['titre' => 'Questions fréquentes', 'slug' => 'questions-frequentes', 'contenu' =>
            minis_site_b_p('Les questions qu’on nous pose le plus souvent. La vôtre n’y est pas ? Écrivez-nous.')
            . minis_site_b_titre('[Une question que vos clients posent souvent ?]', 3) . minis_site_b_p('[La réponse, en deux ou trois phrases simples.]')
            . minis_site_b_titre('[Une deuxième question ?]', 3) . minis_site_b_p('[La réponse, en deux ou trois phrases simples.]')
            . minis_site_b_titre('[Une troisième question ?]', 3) . minis_site_b_p('[La réponse, en deux ou trois phrases simples.]')
            . minis_site_b_titre('[Une quatrième question ?]', 3) . minis_site_b_p('[La réponse, en deux ou trois phrases simples.]')];
        $P['contact'] = ['titre' => 'Contact', 'slug' => 'contact', 'contenu' =>
            minis_site_b_p('Une question, une envie ? Écrivez-nous ici : votre message nous arrive directement.')
            . minis_site_b_coordonnees()
            . minis_site_b_formulaire()];
        if ($boutique) {
            $P['cgv'] = ['titre' => 'Conditions générales de vente', 'slug' => 'conditions-generales-de-vente', 'contenu' =>
                minis_site_b_p('[À compléter avec le client avant la première vente. Les points à couvrir sont listés ci-dessous.]')
                . minis_site_b_titre('Le vendeur') . minis_site_b_p('[Nom ou raison sociale, adresse, SIRET, e-mail, téléphone.]')
                . minis_site_b_titre('Les prix') . minis_site_b_p('[Prix en euros. Préciser si la TVA s’applique ou non (par exemple : « TVA non applicable, article 293 B du CGI »).]')
                . minis_site_b_titre('La commande et le paiement') . minis_site_b_p('[Comment on commande, les moyens de paiement acceptés, à quel moment la commande est validée.]')
                . minis_site_b_titre('La livraison') . minis_site_b_p('[Zones livrées, délais, frais, retrait sur place.]')
                . minis_site_b_titre('Le droit de rétractation') . minis_site_b_p('[14 jours pour changer d’avis, sauf exceptions prévues par la loi (créations sur mesure, denrées périssables…). Comment renvoyer un article et se faire rembourser.]')
                . minis_site_b_titre('Les garanties et les réclamations') . minis_site_b_p('[Garantie légale de conformité, garantie des vices cachés, et comment vous joindre en cas de souci.]')
                . minis_site_b_titre('La médiation') . minis_site_b_p('[Le nom et l’adresse du médiateur de la consommation choisi.]')];
        }
    }

    $P['mentions'] = ['titre' => 'Mentions légales', 'slug' => 'mentions-legales', 'contenu' =>
        minis_site_b_titre('L’éditeur du site')
        . minis_site_b_p('[Nom et prénom, ou raison sociale] · [statut : micro-entreprise, SARL…] · SIRET [numéro]')
        . minis_site_b_p('[Adresse complète] · [téléphone] · [e-mail]')
        . minis_site_b_p('Responsable de la publication : [nom et prénom].')
        . minis_site_b_titre('L’hébergeur')
        . minis_site_b_p('[Nom de l’hébergeur, adresse, téléphone.]')
        . minis_site_b_titre('La création du site')
        . minis_site_b_p('Site créé et entretenu par Les Minis Monstres, les-minis-monstres.fr.')
        . minis_site_b_titre('Les textes et les images')
        . minis_site_b_p('Les textes, les photos et le logo de ce site appartiennent à ' . $nom . '. Merci de demander avant de les réutiliser.')];
    $P['confidentialite'] = ['titre' => 'Politique de confidentialité', 'slug' => 'politique-de-confidentialite', 'contenu' =>
        minis_site_b_p('Ici, vos données servent à vous répondre, et à rien d’autre.')
        . minis_site_b_titre('Ce que nous recevons')
        . minis_site_b_p('Quand vous utilisez le formulaire de contact' . (minis_site_type() === 'boutique' ? ' ou que vous passez commande' : '') . ', nous recevons ce que vous écrivez : votre nom, votre e-mail, votre téléphone si vous le donnez, et votre message' . (minis_site_type() === 'boutique' ? ', ainsi que votre adresse pour la livraison' : '') . '.')
        . minis_site_b_titre('Ce que nous en faisons')
        . minis_site_b_p('Nous nous en servons pour vous répondre' . (minis_site_type() === 'boutique' ? ' et pour préparer votre commande' : '') . '. Nous ne les vendons pas et nous ne les donnons à personne.')
        . minis_site_b_titre('Combien de temps')
        . minis_site_b_p('[Durée de conservation, par exemple : trois ans après notre dernier échange.]')
        . minis_site_b_titre('Vos droits')
        . minis_site_b_p('Vous pouvez demander à voir, corriger ou effacer vos données en écrivant à [e-mail]. Vous pouvez aussi vous adresser à la CNIL (cnil.fr).')
        . minis_site_b_titre('Les cookies')
        . minis_site_b_p('[Lister ici les cookies utilisés par le site, ou indiquer qu’il n’utilise que des cookies nécessaires à son fonctionnement.]')];
    return $P;
}

/* ---------- le menu principal ---------- */
function minis_site_menu() {
    $L = [];
    $page = function ($cle, $titre = '') use (&$L) {
        $id = minis_site_page_id($cle);
        if ($id) $L[] = ['titre' => $titre ?: get_the_title($id), 'page' => $id, 'url' => get_permalink($id)];
    };
    if (minis_site_type() === 'essentiel') {
        $base = home_url('/');
        foreach (['presentation' => 'Présentation', 'services' => 'Services', 'contact' => 'Contact'] as $a => $t) $L[] = ['titre' => $t, 'url' => $base . '#' . $a];
        return $L;
    }
    $page('accueil');
    if (minis_site_type() === 'boutique' && function_exists('wc_get_page_id') && wc_get_page_id('shop') > 0) $L[] = ['titre' => 'Boutique', 'page' => wc_get_page_id('shop'), 'url' => get_permalink(wc_get_page_id('shop'))];
    $page('services'); $page('realisations'); $page('a-propos'); $page('faq', 'Questions'); $page('contact');
    return $L;
}
