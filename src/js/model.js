import { Rx } from 'cyclejs';

export default {
    // available autocompletions for current text value
    // autocompletions are sorted based on ranking, which is
    // calculated based on strict string matching and position of current field value in autocompletion
    // autocompetion "Car" will be higher than "Carusel" when text is "ca"
    // autocompletion "the best of all" will be higher than "he is the best" when text is "best"
    // autocompletions are case-insensitive
    autocompletions$: (textFieldValue$, datalistAttr$) =>
        Rx.Observable.combineLatest(
            textFieldValue$,
            datalistAttr$,
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
        ).distinctUntilChanged((autocompletions) => JSON.stringify(autocompletions)),

    // autocompletions shouldn't be visible when text field is not focused, list is empty
    // and right after when autocompletion was choosen
    areAutocompletionsVisible$: (autocompletions$, showAutocompletions$, hideAutocompletions$) =>
        Rx.Observable.merge(
            autocompletions$
                .filter((autocompletions) => autocompletions.length === 0)
                .map(() => false),
            showAutocompletions$
                .withLatestFrom(
                    autocompletions$,
                    (show, autocompletions) => autocompletions.length !== 0
                ),
            hideAutocompletions$
                .map(() => false)
        )
        .startWith(false)
        .distinctUntilChanged(),

    // index of autocompletion selected on the list
    highlightedAutocompletionIndex$: (autocompletions$, valueChange$, hideAutocompletions$, selectedAutocompletionInput$) =>
        Rx.Observable.combineLatest(
            Rx.Observable.merge(
                Rx.Observable.merge( // reset position on text and when autocompletions list hides
                    valueChange$,
                    hideAutocompletions$
                )
                .map(() => ({ direct: 0 }))
                .delay(1), // reset after fetching value from autocompletions
                selectedAutocompletionInput$
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
        }).distinctUntilChanged(),

    // autocompletion that was highlighted and applied
    selectedAutocompletion$: (selectedAutocompletionChange$, highlightedAutocompletionIndex$, autocompletions$) =>
        selectedAutocompletionChange$
            .withLatestFrom(
                highlightedAutocompletionIndex$,
                (( enter, position ) => position)
            )
            .withLatestFrom(
                autocompletions$,
                ((position, autocompletions) => autocompletions[position])
            )
            .filter((value) => 'undefined' !== typeof value)
            .distinctUntilChanged(),

    // value is invalid when no autocompletions available
    isValueInvalid$: (autocompletions$, finish$) =>
        Rx.Observable.merge(
            autocompletions$
                .map((autocompletions) =>
                    autocompletions.length === 0
                ),
            finish$
                .map(() => false)
        )
        .startWith(false)
        .distinctUntilChanged(),

    // text entered to field or propagated from component attribute
    notValidatedTextFieldValue$: (valueChange$) => valueChange$
        .distinctUntilChanged(),

    // current text in field, can be entered directly or by choosing autocompletion
    // when text field looses focus and value is not valid, previous valid value
    textFieldValue$: (value$, notValidatedTextFieldValue$, finish$, selectedAutocompletion$) =>
        Rx.Observable.merge(
            notValidatedTextFieldValue$,
            selectedAutocompletion$,
            finish$
                .withLatestFrom(
                    value$,
                    (finish, value) => value
                )
        )
        .startWith('')
        .distinctUntilChanged(),

    // value that will be exported to attribute and emitted with change event of the component
    // it has to match exactly with some autocompletion
    value$: (autocompletions$, selectedAutocompletion$, finish$, notValidatedTextFieldValue$) =>
        Rx.Observable.merge(
            selectedAutocompletion$,
            Rx.Observable.combineLatest(
                notValidatedTextFieldValue$.take(1),
                autocompletions$.take(1),
                (value, autocompletions) => value === autocompletions[0] ? value : null
            ),
            finish$
                .withLatestFrom(
                    notValidatedTextFieldValue$,
                    autocompletions$,
                    (finish, value, autocompletions) => value === autocompletions[0] ? value : null
                )
                .filter((value) => value !== null)
        ).distinctUntilChanged()
};

