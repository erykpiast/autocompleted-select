import Cycle from 'cyclejs';
import { Rx } from 'cyclejs';

export default function createAutocompletedTextModel() {
    var autocompletedTextModel = Cycle.createModel(function (autocompletedTextIntent, inputAttributes) {
        // available autocompletions for current text value
        // autocompletions are sorted based on ranking, which is
        // calculated based on strict string matching and position of current field value in autocompletion
        // autocompetion "Car" will be higher than "Carusel" when text is "ca"
        // autocompletion "the best of all" will be higher than "he is the best" when text is "best"
        // autocompletions are case-insensitive
        var autocompletions$ = Rx.Observable.combineLatest(
            autocompletedTextIntent.get('valueChange$'),
            inputAttributes.get('datalist$'),
            (value, datalist) =>
                value.length ? 
                datalist // choose keywords matching to value and sort them by ranking
                    .map((keywords) => ({
                        value: keywords[0], // show only the first keyword
                        // but match all of them and choose one with the highest ranking
                        score: Math.max.apply(Math, keywords.map(function(keyword, index) {
                            var index = keyword.toLowerCase().indexOf(value.toLowerCase());

                            if(index === -1) {
                                return -Infinity;
                            }

                            return (100 - index * Math.abs(keyword.length - value.length));
                        }))
                    }))
                    .filter(({ score }) => (score >= 0))
                    .sort((a, b) => b.score - a.score)
                    .map(({ value }) => value) :
                datalist // or show all and sort alphabetically if value is empty
                    .map((keywords) => keywords[0])
                    .sort()
        );

        // autocompletions shouldn't be visible when text field is not focused, list is empty
        // and right after when autocompletion was choosen
        var areAutocompletionsVisible$ = Rx.Observable.merge(
            autocompletions$
                .filter((autocompletions) => autocompletions.length === 0)
                .map(() => false),
            autocompletedTextIntent.get('showAutocompletions$')
                .map(() => true),
            autocompletedTextIntent.get('hideAutocompletions$')
                .map(() => false)
        )
        .distinctUntilChanged()
        .startWith(false);

        // index of autocompletion selected on the list
        var highlightedAutocompletionIndex$ = Rx.Observable.combineLatest(
            Rx.Observable.merge(
                Rx.Observable.merge( // reset position on text and when autocompletions list hides
                    autocompletedTextIntent.get('valueChange$'),
                    autocompletedTextIntent.get('hideAutocompletions$')
                )
                .map(() => ({ direct: 0 }))
                .delay(1), // reset after fetching value from autocompletions
                autocompletedTextIntent.get('selectedAutocompletionInput$')
            ),
            autocompletions$,
            (positionModifier, autocompletions) => ({ positionModifier, autocompletions })
        ).scan(0, (position, { positionModifier, autocompletions }) => {
            if(positionModifier.hasOwnProperty('modifier')) {
                position = position + positionModifier.modifier;
            } else if(positionModifier.hasOwnProperty('direct')) {
                position = positionModifier.direct;
            } else {
                return;
            }

            if(position < 0) {
                position = 0;
            } else if(position > (autocompletions.length - 1)) {
                position = autocompletions.length - 1;
            }

            return position;
        }).distinctUntilChanged();

        // autocompletion that was highlighted and applied
        var selectedAutocompletion$ = autocompletedTextIntent.get('selectedAutocompletionChange$')
        .withLatestFrom(
            highlightedAutocompletionIndex$,
            (( enter, position ) => position)
        )
        .withLatestFrom(
            autocompletions$,
            ((position, autocompletions) => autocompletions[position])
        )
        .filter((value) => 'undefined' !== typeof value)
        .distinctUntilChanged();

        // value is invalid when no autocompletions available
        var isValueInvalid$ = Rx.Observable.merge(
            autocompletions$
                .map((autocompletions) =>
                    autocompletions.length === 0
                ),
            autocompletedTextIntent.get('finish$')
                .map(() => false)
        )
        .distinctUntilChanged()
        .startWith(false);

        // text entered to field or propagated from component attribute
        var notValidatedTextFieldValue$ = autocompletedTextIntent.get('valueChange$');

        // current text in field, can be entered directly or by choosing autocompletion
        // when text field looses focus and value is not valid, previous valid value
        var textFieldValue$ = Rx.Observable.merge(
            notValidatedTextFieldValue$,
            selectedAutocompletion$,
            autocompletedTextIntent.get('finish$')
                .withLatestFrom(
                    Rx.Observable.defer(() => value$),
                    (finish, value) => value
                )
        )
        .distinctUntilChanged();

        // value that will be exported to attribute and emitted with change event of the component
        // it has to match exactly with some autocompletion
        var value$ = Rx.Observable.merge(
            selectedAutocompletion$,
            autocompletedTextIntent.get('finish$')
                .withLatestFrom(
                    notValidatedTextFieldValue$,
                    autocompletions$,
                    (finish, value, autocompletions) => value === autocompletions[0] ? value : null
                )
                .filter((value) => value !== null)
        ).distinctUntilChanged();

        return { value$, textFieldValue$, autocompletions$, highlightedAutocompletionIndex$, areAutocompletionsVisible$, isValueInvalid$ };
    });

    return autocompletedTextModel;
}

