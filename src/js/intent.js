import { Rx } from 'cyclejs';

const UP = 38;
const DOWN = 40;
const ENTER = 13;


export default {
    focusOnField$: (interaction$) => interaction$.choose('#field', 'focus'),
    blurOnField$: (interaction$) => interaction$.choose('#field', 'blur'),
    inputOnField$: (interaction$) => interaction$.choose('#field', 'input'),
    mouseenterOnAutocompletion$: (interaction$) => interaction$.choose('.autocompletion', 'mouseenter'),
    mousedownOnAutocompletion$: (interaction$) => interaction$.choose('.autocompletion', 'mousedown'),
    keydownOnField$: (interaction$) => interaction$.choose('#field', 'keydown'),
    up$: (keydownOnField$) => keydownOnField$.filter(({ keyCode }) => (keyCode === UP)),
    down$: (keydownOnField$) => keydownOnField$.filter(({ keyCode }) => (keyCode === DOWN)),
    enter$: (keydownOnField$) => keydownOnField$.filter(({ keyCode }) => (keyCode === ENTER)),
    notEnter$: (keydownOnField$) => keydownOnField$.filter(({ keyCode }) => (keyCode !== ENTER)),
    valueChange$: (inputOnField$, valueAttr$) =>
        Rx.Observable.merge(
            inputOnField$
                .map(({ target }) => target.value),
            valueAttr$
        ),
    selectedAutocompletionInput$: (mouseenterOnAutocompletion$, up$, down$) =>
        Rx.Observable.merge(
            mouseenterOnAutocompletion$
                .map(({ target }) => ({
                    direct: target.index
                })),
            Rx.Observable.merge(
                up$.map(() => -1),
                down$.map(() => 1)
            ).map((modifier) => ({ modifier }))
        ),
    selectedAutocompletionChange$: (mousedownOnAutocompletion$, enter$) =>
        Rx.Observable.merge(
            enter$,
            mousedownOnAutocompletion$
        ).map(() => true),
    showAutocompletions$: (focusOnField$, notEnter$) =>
        Rx.Observable.merge(
            notEnter$,
            focusOnField$
        ).map(() => true),
    hideAutocompletions$: (blurOnField$, enter$) =>
        Rx.Observable.merge(
            enter$,
            blurOnField$
        ).map(() => true),
    finish$: (blurOnField$) =>
        blurOnField$.map(() => true)
};
