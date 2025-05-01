<?php

use App\Interfaces\MainImageHolder;
use App\Traits\HasMainImage;
use Kirby\Cms\Page;
use Kirby\Toolkit\Collection;

class PersonPage extends Page implements MainImageHolder {
    use HasMainImage;
    public function events(): Collection {
        $page = $this;

        return $this->kirby()
            ->collection('events')
            ->filter(function (EventPage $event) use ($page) {
                return $event->attendants()->toPages()->has($page);
            });
    }
}
