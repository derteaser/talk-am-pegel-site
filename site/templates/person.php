<?php
/** @var PersonPage $page */
?>

<?php layout() ?>
<section class="container mx-auto mt-16 px-6 lg:px-24 xl:px-32">
  <?php snippet('person', ['person' => $page]) ?>
</section>