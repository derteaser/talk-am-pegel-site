<?php
/** @var PersonPage $page */
?>

<x-layout>
    <section class="mx-auto mt-16 px-6 lg:px-24 xl:px-32 flex flex-col md:flex-row md:space-x-12 md:justify-center">
        <?php snippet('person', ['person' => $page]); ?>

        <ul class="space-y-6 pt-6">
            @foreach ($page->events() as $event)
                <li>
                    <p class="font-medium text-sm text-base-content/60"><?= $event->date()->toDate('%e. %B %Y') ?></p>
                    <a href="<?= $event->url() ?>" class="link link-accent inline-flex items-center">
                        <?= $event->title() ?>
                        <x-icons.arrow-right-line class="fill-current w-4 h-4 ml-2" />
                    </a>
                </li>
            @endforeach
        </ul>
    </section>
</x-layout>
