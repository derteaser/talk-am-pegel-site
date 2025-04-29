<?php

namespace App\View\Components;

use Illuminate\Support\Facades\View;
use Illuminate\View\Component;
use PersonPage;

class Person extends Component {
    public PersonPage $person;

    public function __construct(PersonPage $person) {
        $this->person = $person;
    }

    /**
     * @inheritDoc
     */
    public function render() {
        return View::make('components.person');
    }
}
