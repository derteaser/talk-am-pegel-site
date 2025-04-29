<?php

use Kirby\Cms\App;

return function (App $kirby) {
    $latestEvent = $kirby->collection('events')->first();

    return compact('latestEvent');
};
