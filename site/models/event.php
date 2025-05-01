<?php

use App\Interfaces\MainImageHolder;
use App\Traits\HasMainImage;
use Illuminate\Support\Carbon;
use Kirby\Cms\Page;

class EventPage extends Page implements MainImageHolder {
    use HasMainImage;

    public function startDateTime(): Carbon {
        $date = new Carbon();

        $date->setDate($this->date()->toDate('Y'), $this->date()->toDate('M'), $this->date()->toDate('d'));
        $date->setTime($this->startTime()->toDate('H'), $this->startTime()->toDate('m'));

        return $date;
    }

    public function past(): bool {
        return $this->startDateTime()->isPast();
    }
}
