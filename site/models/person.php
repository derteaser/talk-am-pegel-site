<?php

use Kirby\Cms\Collection;
use Kirby\Cms\Page;

/**
 * @mixin bp_person
 */
class PersonPage extends Page {

    public function events(): Collection {
        $page = $this;

        return $this->kirby()->collection('events')->filter(function(EventPage $event) use($page) {
            return $event->attendants()->toPages()->has($page);
        });
    }
}