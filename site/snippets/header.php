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
  <?= $page->metaTags() ?>
</head>
<body class="bg-gray-200">
