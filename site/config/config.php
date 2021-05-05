<?php

use Kirby\Cms\Html;
use Kirby\Toolkit\Str;

return [
    'debug' => false,
    'slugs' => 'de',
    'locale' => 'de_DE.utf-8',
    'date'  => [
        'handler' => 'strftime'
    ],
    'thumbs' => [
        'presets' => [
            'person' => ['width' => 500, 'height' => 500, 'crop' => true]
        ]
    ],
    'bnomei.robots-txt.sitemap' => 'sitemap.xml',
    'omz13.xmlsitemap.includeUnlistedWhenTemplateIs' => ['events', 'event', 'contact', 'default'],
    'pedroborges.meta-tags.default' => function ($page, $site) {
        $image = $page->main_image()->toFile();
        if (!$image) {
            $image = $site->main_image()->toFile();
        }

        $description = null;
        if ($text = $page->text() && $blocks = $page->text()->toBlocks()) {
            if ($block = $blocks->filterBy('type', 'paragraph')->first()) {
                $description = Html::decode(Str::excerpt($block->content(), 155));
            }
        }

        return [
            'title' => $page->title() . " | " . $site->title(),
            'meta' => [
                'description' => $description,
                'robots' => 'index,follow,noodp'
            ],
            'link' => [
                'canonical' => $page->url(),
            ],
            'og' => [
                'title' => $page->title(),
                'type' => 'website',
                'site_name' => $site->title(),
                'url' => $page->url(),
                'description' => $description,
                'locale' => 'de_DE',
                'namespace:image' => function() use ($image) {
                    $thumb = $image->crop(1200, 630);
                    return [
                        'image' => $thumb->url(),
                        'height' => $thumb->height(),
                        'width' => $thumb->width(),
                        'type' => $thumb->mime()
                    ];
                }
            ],
            'twitter' => [
                'card' => 'summary_large_image',
                'site' => $site->twitter(),
                'title' => $page->title(),
                'image' => $image->url()
            ]
        ];
    },
    'pedroborges.meta-tags.templates' => function ($page, $site) {
        $image = $page->main_image()->toFile();
        if (!$image) {
            $image = $site->main_image()->toFile();
        }

        return [
            'default' => [
                'json-ld' => [
                    'WebPage' => [
                        'name' => $page->title()->value(),
                        'url' => $page->url(),
                        'inLanguage' => 'de_DE',
                        'image' => $image->url(),
                    ]
                ]
            ],
            'home' => [
                'title' => $site->title(),
                'meta' => [
                    'description' => $page->herotitle(),
                ],
                'og' => [
                    'title' => $site->title(),
                    'description' => $page->herotitle(),
                ],
                'json-ld' => [
                    'WebSite' => [
                        'name' => $site->title()->value(),
                        'url' => $site->url(),
                        'inLanguage' => 'de_DE',
                        'image' => $image->url(),
                        'sameAs' => ['https://www.facebook.com/' . $site->facebook()->value(), 'https://twitter.com' . $site->twitter()->value()],
                    ]
                ]
            ],
            'contact' => [
                'json-ld' => [
                    'ContactPage' => [
                        'name' => $page->title()->value(),
                        'url' => $page->url(),
                        'inLanguage' => 'de_DE',
                        'image' => $image->url(),
                    ]
                ]
            ],
            'event' => [
                'json-ld' => [
                    'Event' => [
                        'name' => $page->title()->value(),
                        'description' => strip_tags($page->text()->toBlocks()->filterBy('type', 'paragraph')->html()),
                        'eventStatus' => [
                            '@type' => 'EventScheduled'
                        ],
                        'eventAttendanceMode' => $page->is_virtual()->toBool() ? [
                            '@type' => 'OnlineEventAttendanceMode'
                        ] : [
                            '@type' => 'OfflineEventAttendanceMode'
                        ],
                        'location' => $page->is_virtual()->toBool() ? [
                            '@type' => 'VirtualLocation',
                            'name' => $page->location_name()->value(),
                            'url' => $page->location_url()->value()
                        ] : [
                            '@type' => 'Place',
                            'name' => $page->location_name()->value(),
                            'address' => [
                                '@type' => 'PostalAddress',
                                'addressCountry' => 'de',
                                'addressLocality' => $page->location_geo()->yaml()['city'] ?? '',
                                'postalCode' => $page->location_geo()->yaml()['postcode'] ?? '',
                                'streetAddress' => ($page->location_geo()->yaml()['address'] ?? '') . ' ' . ($page->location_geo()->yaml()['number'] ?? ''),
                            ],
                            'geo' => [
                                '@type' => 'GeoCoordinates',
                                'latitude' => $page->location_geo()->yaml()['lat'] ?? '',
                                'longitude' => $page->location_geo()->yaml()['lon'] ?? '',
                            ]
                        ],
                        'url' => $page->url(),
                        'sameAs' => $page->eventbrite_url()->value(),
                        'image' => $image->url(),
                        'isAccessibleForFree' => true,
                        'inLanguage' => 'de_DE',
                        'startDate' => $page->date()->toDate('%FT%H:%M:00%z'),
                        'organizer' => [
                            '@type' => 'Person',
                            'name' => 'Dr. Jörg Geerlings MdL',
                            'url' => 'https://www.geerlings.de'
                        ]
                    ]
                ]
            ],
            'events' => [
                'meta' => [
                    'robots' => 'noindex,follow,noodp'
                ]
            ],
            'person' => [
                'meta' => [
                    'robots' => 'noindex,nofollow,noodp'
                ]
            ]
        ];
    },
];
