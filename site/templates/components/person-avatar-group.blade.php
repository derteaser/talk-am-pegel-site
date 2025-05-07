<ul class="avatar-group pull-up -space-x-4">
    @foreach ($persons as $person)
        <li class="tooltip">
            @if ($person->mainImage())
                <div class="tooltip-toggle avatar">
                    <div class="w-13">
                        <img alt="" src="{{ $person->main_image()->toFile()->thumb('person')->url() }}">
                    </div>
                </div>
            @else
                <div class="tooltip-toggle avatar avatar-placeholder">
                    <div class="w-13 bg-neutral text-neutral-content">
                        <span class="uppercase" aria-hidden="true">{{ $person->initials() }}</span>
                    </div>
                </div>
            @endif
            <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                <span class="tooltip-body">{{ $person->title() }}</span>
            </span>
        </li>
    @endforeach
</ul>
