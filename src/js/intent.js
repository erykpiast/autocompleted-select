import Cycle from 'cyclejs';
// import R from 'ramda';
import { Rx } from 'cyclejs';

const UP = 38;
const DOWN = 40;
const ENTER = 13;


export default function createAutocompletedTextIntent() {
    return Cycle.createIntent(function (autocompletedTextUser, inputAttributes) {
        var up$ = autocompletedTextUser.event$('#field', 'keydown').filter(({ keyCode }) => (keyCode === UP));
        var down$ = autocompletedTextUser.event$('#field', 'keydown').filter(({ keyCode }) => (keyCode === DOWN));
        var enter$ = autocompletedTextUser.event$('#field', 'keydown').filter(({ keyCode }) => (keyCode === ENTER));

        var notEnter$ = autocompletedTextUser.event$('#field', 'keydown').filter(({ keyCode }) => (keyCode !== ENTER));

        return {
            valueChange$: Rx.Observable.merge(
                autocompletedTextUser.event$('#field', 'input')
                    .map(({ target }) => target.value),
                inputAttributes.get('value$')
            ).distinctUntilChanged(),
            selectedAutocompletionInput$: Rx.Observable.merge(
                autocompletedTextUser.event$('.autocompletion', 'mouseenter')
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
                autocompletedTextUser.event$('.autocompletion', 'mousedown')
            ).map(() => true),
            showAutocompletions$: Rx.Observable.merge(
                notEnter$,
                autocompletedTextUser.event$('#field', 'focus')
            ).map(() => true),
            hideAutocompletions$: Rx.Observable.merge(
                enter$,
                autocompletedTextUser.event$('#field', 'blur')
            ).map(() => true),
            finish$: autocompletedTextUser.event$('#field', 'blur')
                .map(() => true)
        };
    });
}
