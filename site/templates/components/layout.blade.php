@props([
    'additionalStylesheets' => [],
    'additionalScripts' => [],
])
@php
    /** @var Kirby\Cms\Page $page */
@endphp
<!DOCTYPE html>
<html lang="de">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#3b5883">
    <link rel="icon" href="{{ asset('favicon.ico')->url() }}" sizes="48x48" type="image/x-icon">
    <link rel="icon" href="{{ asset('icon.svg')->url() }}" type="image/svg+xml">
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png')->url() }}">
    <link rel="manifest" href="{{ asset('site.webmanifest')->url() }}">
    {!! $page->metaTags() !!}
    {!! vite(A::append(['resources/js/fonts.js', 'resources/css/site.css'], $additionalStylesheets)) !!}
</head>

<body>
    <x-layout.header />
    {{ $slot }}
    <x-layout.footer />
    {!! vite(A::append($additionalScripts, ['resources/js/site.js'])) !!}
    @snippet('fathom-analytics-embed')
</body>

</html>
