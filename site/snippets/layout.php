<?php

use Kirby\Cms\App;
use Kirby\Cms\Page;
use Kirby\Template\Slot;

/** @var string $titleTag */
/** @var Page $page */
/** @var App $kirby */
/** @var Slot $slot */
/** @var Kirby\Cms\Site|Page $site */
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#3b5883">
  <link rel="icon" href="/favicon.ico" sizes="48x48" type="image/x-icon">
  <link rel="icon" href="<?= url('/favicon.svg') ?>" type="image/svg+xml">
  <link rel="apple-touch-icon" href="<?= url('/apple-touch-icon.png') ?>">
  <link rel="manifest" href="<?= url('/site.webmanifest') ?>">
  <?= $page->metaTags() ?>
  <?= vite(['resources/js/fonts.js', 'resources/css/site.css']) ?>
  <?php snippet('fathom-analytics-embed'); ?>
</head>
<body>
<?php snippet('hero-header'); ?>

<?= $slot ?>

<footer class="footer footer-center bg-base-300/60 p-12 mt-12">
  <nav class="grid grid-flow-col gap-4 text-base-content">
    <?php foreach ($site->footer_navigation()->toPages() as $nav): ?>
      <a href="<?= $nav->url() ?>" class="link link-hover"><?= $nav->title() ?></a>
    <?php endforeach; ?>
  </nav>
  <nav>
    <div class="flex gap-4">
      <a href="https://facebook.com/<?= $site->facebook() ?>" class="link link-animated" aria-label="Facebook (Link öffnet in neuem Fenster)" rel="noopener noreferrer">
        <?php snippet('icons/facebook-circle-fill', ['class' => 'fill-current size-6']); ?>
      </a>
    </div>
  </nav>
  <aside>
    <p>&copy;<?= date('Y') ?> <?= $site->title() ?></p>
  </aside>
</footer>

<?= vite(['resources/js/site.js']) ?>
</body>
</html>
