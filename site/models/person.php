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

    public function initials(): string {
        // Get the first letter of each word in the name
        return implode(
            '',
            array_map(function ($word) {
                return mb_substr($word, 0, 1);
            }, explode(' ', $this->title())),
        );
    }
}
