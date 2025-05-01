<?php

namespace App\View\Components;

use Illuminate\Support\Facades\View;
use Illuminate\View\Component;
use PersonPage;

class Person extends Component {
    public PersonPage $person;
    public bool $animate = false;
    public int $animationDelay = 0;

    public function __construct(PersonPage $person, bool $animate = false, int $animationDelay = 0) {
        $this->person = $person;
        $this->animate = $animate;
        $this->animationDelay = $animationDelay;
    }

    /**
     * @inheritDoc
     */
    public function render() {
        return View::make('components.person');
    }
}
