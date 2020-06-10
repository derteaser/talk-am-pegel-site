<?php if ($prev === null || $prev->type() !== 'ul'): ?>
<ul class="list-disc list-inside my-4">
<?php endif ?>
<li><?= $content ?></li>
<?php if ($next === null || $next->type() !== 'ul'): ?>
</ul>
<?php endif ?>
