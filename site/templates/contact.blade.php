@php
    use Kirby\Cms\Html;
    use Kirby\Cms\Page;
    use Kirby\Cms\Site;

    /** @var Page $page */
    /** @var Site $site */

@endphp

<x-layout>
    <section class="container mx-auto mt-16 px-6 lg:px-24 xl:px-32 text-center">
        <h2 class="text-xl mb-4 leading-relaxed">{{ $site->title() }}</h2>
        <p>{{ $site->address1() }}</p>
        <p>{{ $site->address2() }}</p>
        <p>{{ $site->postal_code() }} {{ $site->city() }}</p>
        <p class="mt-3"><?= Html::tel($site->phone(), null, ['class' => 'link link-primary']) ?></p>
        <p><?= Html::email($site->email(), null, ['class' => 'link link-primary']) ?></p>

        <div class="flex justify-center mt-6">
            @foreach ($page->contact_persons()->toPages() as $person)
                <x-person :person="$person" />
            @endforeach
        </div>
    </section>
</x-layout>
