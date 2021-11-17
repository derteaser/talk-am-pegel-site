<?php

use Kirby\Cms\Page;

/**
 * @mixin bp_event
 */
class EventPage extends Page {

    protected function panelImageSource(string $query = null) {
        return $this->main_image()->toFile();
    }
}