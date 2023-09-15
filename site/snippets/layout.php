<?php

use Kirby\Cms\App;
use Kirby\Cms\Page;
use Kirby\Template\Slot;

/** @var string $titleTag */
/** @var Page $page */
/** @var App $kirby */
/**@var Slot $slot  */

//$template = $page->template();
//$entry = "templates/$template/index.js";
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#3b5883">
    <link rel="icon" href="<?= url('/favicon.svg') ?>">
    <link rel="mask-icon" href="<?= url('/mask-icon.svg') ?>" color="#3b5883">
    <link rel="apple-touch-icon" href="<?= url('/apple-touch-icon.png') ?>">
    <link rel="manifest" href="<?= url('/site.webmanifest') ?>">
    <?= $page->metaTags() ?>
    <?= vite()->css('index.css') ?>
    <?php snippet('fathom-analytics-embed'); ?>
</head>
<body class="bg-gray-200 dark:bg-gray-900<?= $kirby->option('debug') ? ' debug-screens' : '' ?>">
<?php snippet('hero-header'); ?>
<?= $slot ?>
<footer class="my-20 text-gray-500 body-font">
    <div class="border-t border-gray-400 dark:border-gray-700"></div>
    <div class="container mx-auto py-4 px-5 flex flex-wrap flex-col sm:flex-row">
        <p class="text-gray-500 text-sm text-center sm:text-left">&copy;<?= date('Y') ?> <?= $site->title() ?></p>
        <nav class="sm:ml-auto sm:mt-0 mt-2 sm:w-auto w-full sm:text-left text-center text-sm">
            <?php foreach ($site->footer_navigation()->toPages() as $nav): ?>
                <a href="<?= $nav->url() ?>"
                   class="text-gray-600 hover:text-gray-800 dark:hover:text-gray-200 ml-4"><?= $nav->title() ?></a>
            <?php endforeach; ?>
        </nav>
        <span class="inline-flex lg:ml-auto lg:mt-0 mt-6 w-full justify-center md:justify-start md:w-auto">
            <a class="text-gray-500 hover:text-gray-600 dark:hover:text-gray-200"
               href="https://facebook.com/<?= $site->facebook() ?>" target="_blank" rel="noopener noreferrer">
              <?php snippet('icon', [
                'name' => 'facebook',
                'cssClasses' => 'fill-current w-5 h-5',
              ]); ?><span class="sr-only">Facebook</span>
            </a>
            <a class="ml-3 text-gray-500 hover:text-gray-600 dark:hover:text-gray-200"
               href="https://twitter.com/<?= $site->twitter() ?>" target="_blank" rel="noopener noreferrer">
              <?php snippet('icon', [
                'name' => 'x',
                'cssClasses' => 'fill-current w-5 h-5',
              ]); ?><span class="sr-only">Twitter</span>
            </a>
        </span>
    </div>
</footer>

<?= vite()->js('index.js') ?>
</body>
</html>