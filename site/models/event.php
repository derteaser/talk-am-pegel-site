<?php

use App\Interfaces\MainImageHolder;
use App\Traits\HasMainImage;
use Illuminate\Support\Carbon;
use Kirby\Cms\Page;

class EventPage extends Page implements MainImageHolder {
    use HasMainImage;

    public function excerpt(): string {
        return $this->text()?->toBlocks()->filterBy('type', 'text')->excerpt(180) ?? $this->title()->value();
    }

    public function startDateTime(): Carbon {
        return Carbon::createFromTimestamp($this->date()->toDate());
    }

    public function past(): bool {
        return $this->startDateTime()->isPast();
    }
}
