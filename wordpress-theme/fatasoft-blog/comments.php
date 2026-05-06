<?php
/**
 * Template : commentaires
 * @package fatasoft-blog
 */

if (post_password_required()) {
    echo '<p class="text-muted">' . __('Entrez votre mot de passe pour voir les commentaires.', 'fatasoft-blog') . '</p>';
    return;
}
?>

<section id="comments" class="comments-area">

  <?php if (have_comments()): ?>

    <h2 class="comments-title">
      <?php
        printf(
          _n(
            '%s commentaire sur « %s »',
            '%s commentaires sur « %s »',
            get_comments_number(),
            'fatasoft-blog'
          ),
          number_format_i18n(get_comments_number()),
          '<em>' . get_the_title() . '</em>'
        );
      ?>
    </h2>

    <ol class="comment-list">
      <?php
        wp_list_comments([
          'style'       => 'ol',
          'short_ping'  => true,
          'avatar_size' => 40,
          'callback'    => 'fatasoft_comment_template',
        ]);
      ?>
    </ol>

    <!-- Pagination des commentaires -->
    <?php if (get_comment_pages_count() > 1 && get_option('page_comments')): ?>
      <nav class="comment-navigation pagination-wrap" aria-label="<?php esc_attr_e('Navigation des commentaires', 'fatasoft-blog'); ?>">
        <div><?php previous_comments_link(__('Commentaires précédents', 'fatasoft-blog')); ?></div>
        <div><?php next_comments_link(__('Commentaires suivants', 'fatasoft-blog')); ?></div>
      </nav>
    <?php endif; ?>

  <?php endif; ?>

  <!-- Formulaire de commentaire -->
  <?php if (comments_open()): ?>
    <?php
      comment_form([
        'title_reply'          => __('Laisser un commentaire', 'fatasoft-blog'),
        'title_reply_to'       => __('Répondre à %s', 'fatasoft-blog'),
        'cancel_reply_link'    => __('Annuler', 'fatasoft-blog'),
        'label_submit'         => __('Publier le commentaire', 'fatasoft-blog'),
        'comment_field'        => '<div class="comment-form-comment"><label for="comment">' . __('Commentaire <span aria-hidden="true">*</span>', 'fatasoft-blog') . '</label><textarea id="comment" name="comment" cols="45" rows="6" maxlength="65525" required></textarea></div>',
        'fields' => [
          'author' => '<div class="comment-form-author"><label for="author">' . __('Nom <span aria-hidden="true">*</span>', 'fatasoft-blog') . '</label><input id="author" name="author" type="text" required maxlength="245" autocomplete="name"></div>',
          'email'  => '<div class="comment-form-email"><label for="email">' . __('Email <span aria-hidden="true">*</span>', 'fatasoft-blog') . '</label><input id="email" name="email" type="email" required maxlength="100" autocomplete="email"></div>',
          'url'    => '<div class="comment-form-url"><label for="url">' . __('Site web', 'fatasoft-blog') . '</label><input id="url" name="url" type="url" maxlength="200" autocomplete="url"></div>',
        ],
        'class_container' => 'comment-respond',
        'class_form'      => 'comment-form',
        'submit_button'   => '<input name="%1$s" type="submit" id="%2$s" class="%3$s btn btn-primary" value="%4$s">',
      ]);
    ?>
  <?php else: ?>
    <p class="text-muted" style="margin-top:2rem;text-align:center;">
      <?php _e('Les commentaires sont fermés sur cet article.', 'fatasoft-blog'); ?>
    </p>
  <?php endif; ?>

</section>

<?php
/**
 * Callback template pour chaque commentaire.
 */
function fatasoft_comment_template(WP_Comment $comment, array $args, int $depth): void {
    $GLOBALS['comment'] = $comment;
    ?>
    <li id="comment-<?php comment_ID(); ?>" <?php comment_class('comment', $comment); ?>>
      <div class="comment-body">
        <div class="comment-meta">
          <div class="comment-author">
            <?php echo get_avatar($comment, 40, '', get_comment_author(), ['class' => 'avatar']); ?>
          </div>
          <div>
            <div class="comment-author-name">
              <?php comment_author_link($comment); ?>
              <?php if ($comment->user_id && $comment->user_id === get_the_author_meta('ID')): ?>
                <span class="badge badge-primary" style="margin-left:.5rem;"><?php _e('Auteur', 'fatasoft-blog'); ?></span>
              <?php endif; ?>
            </div>
            <div class="comment-metadata">
              <time datetime="<?php comment_date('c', $comment); ?>">
                <?php comment_date('', $comment); ?> <?php _e('à', 'fatasoft-blog'); ?> <?php comment_time('', $comment); ?>
              </time>
            </div>
          </div>
        </div>

        <?php if ($comment->comment_approved === '0'): ?>
          <p class="text-dim" style="font-size:.85rem;margin-bottom:.75rem;">
            <em><?php _e('Votre commentaire est en attente de modération.', 'fatasoft-blog'); ?></em>
          </p>
        <?php endif; ?>

        <div class="comment-content">
          <?php comment_text($comment); ?>
        </div>

        <?php
          comment_reply_link(array_merge($args, [
            'add_below'  => 'comment',
            'depth'      => $depth,
            'max_depth'  => $args['max_depth'],
            'before'     => '',
            'after'      => '',
            'reply_text' => '<span class="comment-reply-link">' . __('Répondre', 'fatasoft-blog') . '</span>',
          ]));
        ?>
      </div>
    <?php
    // Note : li fermé par wp_list_comments
}
