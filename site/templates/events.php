<?php

use Kirby\Cms\App;
use Kirby\Cms\Page;
use Kirby\Toolkit\Str;

/** @var Page $page */
/** @var App $kirby */
?>

<?php snippet('layout', slots: true); ?>

<section class="container mx-auto my-16">
<ul class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical timeline-centered">
  <?php $odd = false; ?>
  <?php foreach ($kirby->collection('events') as $event): ?>
  <!-- timeline item -->
  <li>
    <div class="timeline-middle">
      <span class="bg-primary/20 flex size-4.5 items-center justify-center rounded-full">
        <span class="badge badge-primary size-3 rounded-full p-0"></span>
      </span>
    </div>
    <div class="<?= $odd ? 'timeline-start' : 'timeline-end' ?> me-4 ms-1 mt-3 max-md:pt-2">
      <time class="text-base-content/50 text-sm font-normal"><?= $event->date()->toDate('%e. %B %Y') ?></time>
    </div>
    <div class="<?= $odd ? 'timeline-end' : 'timeline-start' ?> ms-4 mb-8">
      <div class="card">
        <?php $image = $event->main_image()->toFile(); ?>
        <figure>
          <picture>
            <source srcset="<?= $image->thumb(['format' => 'avif'])->url() ?>" type="image/avif">
            <source srcset="<?= $image->thumb(['format' => 'webp'])->url() ?>" type="image/webp">
            <img class="object-cover object-center aspect-video w-full" alt="<?= $event->title() ?>" src="<?= $image
  ->thumb(['format' => 'jpg'])
  ->url() ?>">
          </picture>
        </figure>
        <div class="card-body gap-4">
          <h2 class="card-title text-lg">
            <div class="text-base-content/50 text-sm">
              <?= $event->textline() ?>
              <span class="sr-only">:</span>
            </div>
            <?= $event->title() ?>
          </h2>

          <div class="avatar-group pull-up -space-x-4">
            <?php foreach ($event->attendants()->toPages() as $person): ?>
            <div class="tooltip">
              <div class="tooltip-toggle avatar">
                <div class="w-13">
                  <img alt="<?= $person->title() ?>" src="<?= $person
  ->main_image()
  ->toFile()
  ->thumb('person')
  ->url() ?>">
                </div>
              </div>
              <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                <span class="tooltip-body"><?= $person->title() ?></span>
              </span>
            </div>
            <?php endforeach; ?>
          </div>

          <div class="card-actions">
            <a href="<?= $event->url() ?>" class="btn btn-sm btn-soft btn-accent">
              Mehr erfahren
              <?php snippet('icons/arrow-right-line', ['class' => 'max-sm:hidden size-5']); ?>
            </a>
          </div>
        </div>
      </div>
    </div>
    <hr />
  </li>
  <!-- /timeline item -->
    <?php $odd = !$odd; ?>
  <?php endforeach; ?>
</ul>
</section>