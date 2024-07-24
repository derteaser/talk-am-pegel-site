<?php

/** @var HomePage $page */
/** @var EventPage $latestEvent */
?>

<?php snippet('layout', slots: true); ?>

<?php snippet('latest-event', ['event' => $latestEvent]); ?>
