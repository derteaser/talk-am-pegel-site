<?php

use Kirby\Cms\App;
use Kirby\Cms\Page;

/** @var string $titleTag */
/** @var Page $page */
/** @var App $kirby */

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

</head>
<body class="bg-gray-200 dark:bg-gray-900<?= $kirby->option('debug') ? ' debug-screens' : ''?>">
