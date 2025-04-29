<?php

namespace App\Traits;

use Spatie\SchemaOrg\BreadcrumbList;
use Spatie\SchemaOrg\Organization;
use Spatie\SchemaOrg\Schema;

trait HasSchema {
    protected function buildBreadcrumbSchema(): void {
        $breadcrumb = $this->site()->breadcrumb();
        /** @var BreadcrumbList $schema */
        $schema = $this->schema('BreadcrumbList');
        $position = 1;
        $breadcrumbList = [];
        foreach ($breadcrumb as $item) {
            $breadcrumbList[] = Schema::listItem()->position($position)->name($item->title()->value())->item($item->url());
            $position++;
        }
        $schema->itemListElement($breadcrumbList);
    }

    protected function buildOrganization(): Organization {
        return Schema::organization()
            ->name($this->site()->title()->value())
            ->url($this->site()->url())
            ->logo(asset('images/logo.png')->url());
    }
}
