<div class="avatar-group pull-up -space-x-4">
    @foreach ($persons as $person)
        <div class="tooltip">
            <div class="tooltip-toggle avatar">
                <div class="w-13">
                    <img alt="{{ $person->title() }}" src="{{ $person->main_image()->toFile()->thumb('person')->url() }}">
                </div>
            </div>
            <span class="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible" role="tooltip">
                <span class="tooltip-body">{{ $person->title() }}</span>
            </span>
        </div>
    @endforeach
</div>
