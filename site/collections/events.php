<?php

use Kirby\Cms\Site;

return function (Site $site) {
    return $site->find('talks')->children()->listed()->flip();
};
