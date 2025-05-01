<footer class="footer footer-center bg-base-300/60 p-12 mt-12">
    <nav class="grid grid-flow-col gap-4 text-base-content">
        <?php foreach ($site->footer_navigation()->toPages() as $nav): ?>
        <a href="<?= $nav->url() ?>" class="link link-hover"><?= $nav->title() ?></a>
        <?php endforeach; ?>
    </nav>
    <nav>
        <div class="flex gap-4">
            <a href="https://facebook.com/<?= $site->facebook() ?>" class="link link-animated"
                aria-label="Facebook (Link öffnet in neuem Fenster)" rel="noopener noreferrer">
                <?php snippet('icons/facebook-circle-fill', ['class' => 'fill-current size-6']); ?>
            </a>
        </div>
    </nav>
    <aside>
        <p>&copy;<?= date('Y') ?> <?= $site->title() ?></p>
    </aside>
</footer>
