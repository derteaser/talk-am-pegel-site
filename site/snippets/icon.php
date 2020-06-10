<?php
/** @var string $name */
/** @var string $cssClasses */

/** @var array $icons */
$icons = option('tap.icons');
$icon = $icons[$name];
?>
<svg class="<?= $cssClasses ?>" viewBox="<?= $icon['viewBox'] ?>">
  <?= $icon['content'] ?>
</svg>
