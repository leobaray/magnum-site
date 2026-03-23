<?php
/**
 * Magnum Torque - Theme Functions
 */

if (!defined('ABSPATH')) exit;

define('MAGNUM_VERSION', '1.0.0');
define('MAGNUM_DIR', get_template_directory());
define('MAGNUM_URI', get_template_directory_uri());

/**
 * Theme Setup
 */
function magnum_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));

    register_nav_menus(array(
        'primary' => __('Menu Principal', 'magnum-torque'),
    ));
}
add_action('after_setup_theme', 'magnum_setup');

/**
 * Enqueue Scripts & Styles
 */
function magnum_scripts() {
    // Google Fonts
    wp_enqueue_style('magnum-google-fonts',
        'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Open+Sans:wght@400;500;600&display=swap',
        array(), null
    );

    // Theme stylesheet
    wp_enqueue_style('magnum-style', get_stylesheet_uri(), array('magnum-google-fonts'), MAGNUM_VERSION);

    // Dynamic CSS for logo watermark
    $watermark_css = '.hero .logo-watermark{background-image:url(' . esc_url(MAGNUM_URI . '/assets/logo_magnum_final.webp') . ')}';
    wp_add_inline_style('magnum-style', $watermark_css);

    // Theme JS
    wp_enqueue_script('magnum-main', MAGNUM_URI . '/js/main.js', array(), MAGNUM_VERSION, true);
}
add_action('wp_enqueue_scripts', 'magnum_scripts');

/**
 * Google Fonts - preconnect
 */
function magnum_preconnect() {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}
add_action('wp_head', 'magnum_preconnect', 1);

/**
 * Custom Post Type: Depoimentos
 */
function magnum_register_cpts() {
    register_post_type('depoimento', array(
        'labels' => array(
            'name'               => 'Depoimentos',
            'singular_name'      => 'Depoimento',
            'add_new'            => 'Adicionar Novo',
            'add_new_item'       => 'Adicionar Novo Depoimento',
            'edit_item'          => 'Editar Depoimento',
            'all_items'          => 'Todos os Depoimentos',
            'search_items'       => 'Buscar Depoimentos',
            'not_found'          => 'Nenhum depoimento encontrado',
        ),
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-format-quote',
        'supports'     => array('title', 'editor'),
    ));

    register_post_type('parceiro', array(
        'labels' => array(
            'name'               => 'Parceiros',
            'singular_name'      => 'Parceiro',
            'add_new'            => 'Adicionar Novo',
            'add_new_item'       => 'Adicionar Novo Parceiro',
            'edit_item'          => 'Editar Parceiro',
            'all_items'          => 'Todos os Parceiros',
            'search_items'       => 'Buscar Parceiros',
            'not_found'          => 'Nenhum parceiro encontrado',
        ),
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-groups',
        'supports'     => array('title', 'thumbnail'),
    ));

    register_post_type('servico', array(
        'labels' => array(
            'name'               => 'Serviços',
            'singular_name'      => 'Serviço',
            'add_new'            => 'Adicionar Novo',
            'add_new_item'       => 'Adicionar Novo Serviço',
            'edit_item'          => 'Editar Serviço',
            'all_items'          => 'Todos os Serviços',
            'search_items'       => 'Buscar Serviços',
            'not_found'          => 'Nenhum serviço encontrado',
        ),
        'public'       => false,
        'show_ui'      => true,
        'show_in_menu' => true,
        'menu_icon'    => 'dashicons-admin-tools',
        'supports'     => array('title', 'editor', 'thumbnail'),
    ));
}
add_action('init', 'magnum_register_cpts');

/**
 * Meta boxes for custom fields
 */
function magnum_add_meta_boxes() {
    // Depoimento: iniciais do avatar
    add_meta_box('depoimento_meta', 'Dados do Depoimento', 'magnum_depoimento_meta_cb', 'depoimento', 'normal');
    // Parceiro: URL do site
    add_meta_box('parceiro_meta', 'Dados do Parceiro', 'magnum_parceiro_meta_cb', 'parceiro', 'normal');
    // Serviço: benefícios e ícone SVG
    add_meta_box('servico_meta', 'Dados do Serviço', 'magnum_servico_meta_cb', 'servico', 'normal');
}
add_action('add_meta_boxes', 'magnum_add_meta_boxes');

function magnum_depoimento_meta_cb($post) {
    wp_nonce_field('magnum_depoimento_nonce', 'magnum_depoimento_nonce_field');
    $initials = get_post_meta($post->ID, '_depoimento_initials', true);
    ?>
    <p>
        <label for="depoimento_initials"><strong>Iniciais do Avatar:</strong></label><br>
        <input type="text" id="depoimento_initials" name="depoimento_initials" value="<?php echo esc_attr($initials); ?>" maxlength="3" style="width:100px">
        <span class="description">Ex: EF, CS, AD</span>
    </p>
    <?php
}

function magnum_parceiro_meta_cb($post) {
    wp_nonce_field('magnum_parceiro_nonce', 'magnum_parceiro_nonce_field');
    $url = get_post_meta($post->ID, '_parceiro_url', true);
    $img_style = get_post_meta($post->ID, '_parceiro_img_style', true);
    ?>
    <p>
        <label for="parceiro_url"><strong>URL do Site:</strong></label><br>
        <input type="url" id="parceiro_url" name="parceiro_url" value="<?php echo esc_attr($url); ?>" style="width:100%">
    </p>
    <p>
        <label for="parceiro_img_style"><strong>Estilo da Imagem (CSS inline):</strong></label><br>
        <input type="text" id="parceiro_img_style" name="parceiro_img_style" value="<?php echo esc_attr($img_style); ?>" style="width:100%" placeholder="max-height:55px;max-width:140px">
    </p>
    <?php
}

function magnum_servico_meta_cb($post) {
    wp_nonce_field('magnum_servico_nonce', 'magnum_servico_nonce_field');
    $benefits = get_post_meta($post->ID, '_servico_benefits', true);
    $icon_svg = get_post_meta($post->ID, '_servico_icon_svg', true);
    ?>
    <p>
        <label for="servico_icon_svg"><strong>SVG do Ícone:</strong></label><br>
        <textarea id="servico_icon_svg" name="servico_icon_svg" rows="3" style="width:100%"><?php echo esc_textarea($icon_svg); ?></textarea>
        <span class="description">Cole o código SVG do ícone do serviço</span>
    </p>
    <p>
        <label for="servico_benefits"><strong>Benefícios (um por linha):</strong></label><br>
        <textarea id="servico_benefits" name="servico_benefits" rows="5" style="width:100%"><?php echo esc_textarea($benefits); ?></textarea>
    </p>
    <?php
}

/**
 * Save meta boxes
 */
function magnum_save_depoimento_meta($post_id) {
    if (!isset($_POST['magnum_depoimento_nonce_field']) || !wp_verify_nonce($_POST['magnum_depoimento_nonce_field'], 'magnum_depoimento_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['depoimento_initials'])) {
        update_post_meta($post_id, '_depoimento_initials', sanitize_text_field($_POST['depoimento_initials']));
    }
}
add_action('save_post_depoimento', 'magnum_save_depoimento_meta');

function magnum_save_parceiro_meta($post_id) {
    if (!isset($_POST['magnum_parceiro_nonce_field']) || !wp_verify_nonce($_POST['magnum_parceiro_nonce_field'], 'magnum_parceiro_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['parceiro_url'])) {
        update_post_meta($post_id, '_parceiro_url', esc_url_raw($_POST['parceiro_url']));
    }
    if (isset($_POST['parceiro_img_style'])) {
        update_post_meta($post_id, '_parceiro_img_style', sanitize_text_field($_POST['parceiro_img_style']));
    }
}
add_action('save_post_parceiro', 'magnum_save_parceiro_meta');

function magnum_save_servico_meta($post_id) {
    if (!isset($_POST['magnum_servico_nonce_field']) || !wp_verify_nonce($_POST['magnum_servico_nonce_field'], 'magnum_servico_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;

    if (isset($_POST['servico_benefits'])) {
        update_post_meta($post_id, '_servico_benefits', sanitize_textarea_field($_POST['servico_benefits']));
    }
    if (isset($_POST['servico_icon_svg'])) {
        update_post_meta($post_id, '_servico_icon_svg', wp_kses_post($_POST['servico_icon_svg']));
    }
}
add_action('save_post_servico', 'magnum_save_servico_meta');
