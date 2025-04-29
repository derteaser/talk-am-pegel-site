<?php

namespace App\View\Components;

use Illuminate\Support\Facades\View;
use Illuminate\View\Component;
use Kirby\Cms\Collection;
use Kirby\Cms\Pages;
use PersonPage;

class PersonAvatarGroup extends Component {
    /**
     * @var Collection<PersonPage>|Pages
     */
    public Collection|Pages $persons;

    public function __construct(Pages $persons) {
        $this->persons = $persons;
    }

    /**
     * @inheritDoc
     */
    public function render() {
        return View::make('components.person-avatar-group');
    }
}
