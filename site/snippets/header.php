<?php
use Kirby\Cms\Page;

/** @var string $titleTag */
/** @var Page $page */
?>
<!DOCTYPE html>
<html lang="de_DE">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#3b5883">
  <link rel="icon" href="<?= url('/favicon.svg') ?>">
  <link rel="mask-icon" href="<?= url('/mask-icon.svg') ?>" color="#3b5883">
  <link rel="apple-touch-icon" href="<?= url('/apple-touch-icon.png') ?>">
  <link rel="manifest" href="<?= url('/manifest.json') ?>">
  <?= $page->metaTags() ?>
</head>
<body class="bg-gray-200">
