<?php

use Kirby\Cms\Page;

class EventPage extends Page {

    protected function panelImageSource(string $query = null) {
        return $this->main_image()->toFile();
    }
}