<?php

namespace App\Traits;

use Kirby\Cms\File;
use Kirby\Cms\FileVersion;
use Kirby\Content\Field;

/**
 * @method Field main_image()
 */
trait HasMainImage {
    public function mainImage(): ?File {
        return $this->main_image()->toFile();
    }

    public function metaCroppedMainImage(): File|FileVersion|null {
        return $this->mainImage()?->crop(1200, 600);
    }

    public function image(?string $filename = null): File|null {
        if ($filename === null && $this->mainImage()) {
            return $this->mainImage();
        }

        return parent::image($filename);
    }
}
