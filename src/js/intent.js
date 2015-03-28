import Cycle from 'cyclejs';
// import R from 'ramda';
import { Rx } from 'cyclejs';

const UP = 38;
const DOWN = 40;
const ENTER = 13;


export default function createAutocompletedTextIntent() {
    return Cycle.createIntent(function (autocompletedTextView, inputAttributes) {
        var up$ = autocompletedTextView.get('keydown$').filter(({ keyCode }) => (keyCode === UP));
        var down$ = autocompletedTextView.get('keydown$').filter(({ keyCode }) => (keyCode === DOWN));
        var enter$ = autocompletedTextView.get('keydown$').filter(({ keyCode }) => (keyCode === ENTER));

        var notEnter$ = autocompletedTextView.get('keydown$').filter(({ keyCode }) => (keyCode !== ENTER));

        return {
            valueChange$: Rx.Observable.merge(
                autocompletedTextView.get('change$')
                    .map(({ target }) => target.value),
                inputAttributes.get('value$')
            ).distinctUntilChanged(),
            selectedAutocompletionInput$: Rx.Observable.merge(
                autocompletedTextView.get('hover$')
                    .map(({ target }) => ({
                        direct: target.index
                    })),
                Rx.Observable.merge(
                    up$.map(() => -1),
                    down$.map(() => 1)
                ).map((modifier) => ({ modifier }))
            ).startWith(0),
            selectedAutocompletionChange$: Rx.Observable.merge(
                enter$,
                autocompletedTextView.get('click$')
            ).map(() => true),
            showAutocompletions$: Rx.Observable.merge(
                notEnter$,
                autocompletedTextView.get('focus$')
            ).map(() => true),
            hideAutocompletions$: Rx.Observable.merge(
                enter$,
                autocompletedTextView.get('blur$')
            ).map(() => true),
            finish$: autocompletedTextView.get('blur$')
                .map(() => true)
        };
    });
}
