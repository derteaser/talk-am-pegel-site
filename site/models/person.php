<?php

use Kirby\Cms\Field;
use Kirby\Cms\Page;
use Kirby\Toolkit\Collection;

/**
 * @method Field sub_heading()
 * @method Field website()
 * @method Field linkedin()
 * @method Field xing()
 * @method Field main_image()
 */
class PersonPage extends Page {
    public function events(): Collection {
        $page = $this;

        return $this->kirby()->collection('events')->filter(function(EventPage $event) use($page) {
            return $event->attendants()->toPages()->has($page);
        });
    }
}
