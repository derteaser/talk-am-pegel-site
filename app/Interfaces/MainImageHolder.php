<?php

namespace App\Interfaces;

use Kirby\Cms\File;

interface MainImageHolder {
  public function mainImage(): ?File;
}
