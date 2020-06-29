<?php

use Kirby\Cms\Html;
use Kirby\Toolkit\Str;

return [
    'debug' => true,
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
                'stylesheet' => [url('assets/tap-tailwind/dist/tap-tailwind.css'), url('assets/tap-tailwind/dist/aos.css')],
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
    # Project icons derived from Font Awesome
    'tap.icons' => [
        'angle-left' => ['viewBox' => '0 0 256 512', 'content' => '<path d="M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z"/>'],
        'angle-right' => ['viewBox' => '0 0 256 512', 'content' => '<path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"/>'],
        'arrow-down' => ['viewBox' => '0 0 448 512', 'content' => '<path d="M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z"/>'],
        'arrow-right' => ['viewBox' => '0 0 448 512', 'content' => '<path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"/>'],
        'calendar' => ['viewBox' => '0 0 448 512', 'content' => '<path d="M400 64h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V160h352v298c0 3.3-2.7 6-6 6z"/>'],
        'clock' => ['viewBox' => '0 0 512 512', 'content' => '<path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z"/>'],
        'facebook' => ['viewBox' => '0 0 320 512', 'content' => '<path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>'],
        'globe' => ['viewBox' => '0 0 496 512', 'content' => '<path d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z"/>'],
        'linkedin' => ['viewBox' => '0 0 448 512', 'content' => '<path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>'],
        'map-marker' => ['viewBox' => '0 0 384 512', 'content' => '<path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/>'],
        'ticket' => ['viewBox' => '0 0 576 512', 'content' => '<path d="M128 160h320v192H128V160zm400 96c0 26.51 21.49 48 48 48v96c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48v-96c26.51 0 48-21.49 48-48s-21.49-48-48-48v-96c0-26.51 21.49-48 48-48h480c26.51 0 48 21.49 48 48v96c-26.51 0-48 21.49-48 48zm-48-104c0-13.255-10.745-24-24-24H120c-13.255 0-24 10.745-24 24v208c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24V152z"/>'],
        'twitter' => ['viewBox' => '0 0 512 512', 'content' => '<path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>'],
        'xing' => ['viewBox' => '0 0 384 512', 'content' => '<path d="M162.7 210c-1.8 3.3-25.2 44.4-70.1 123.5-4.9 8.3-10.8 12.5-17.7 12.5H9.8c-7.7 0-12.1-7.5-8.5-14.4l69-121.3c.2 0 .2-.1 0-.3l-43.9-75.6c-4.3-7.8.3-14.1 8.5-14.1H100c7.3 0 13.3 4.1 18 12.2l44.7 77.5zM382.6 46.1l-144 253v.3L330.2 466c3.9 7.1.2 14.1-8.5 14.1h-65.2c-7.6 0-13.6-4-18-12.2l-92.4-168.5c3.3-5.8 51.5-90.8 144.8-255.2 4.6-8.1 10.4-12.2 17.5-12.2h65.7c8 0 12.3 6.7 8.5 14.1z"/>']
    ],
];
