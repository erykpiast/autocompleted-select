/* global suite, test */

import chai from 'chai';
import { assert } from 'chai';

// has to be imported before Rx
import inject from './mock';

import { Rx } from 'cyclejs';
import each from 'foreach';

import intent from '../intent';

chai.use(require('chai-equal-collection')(Rx.internals.isEqual));


suite('intent', () => {

    suite('API', () => {

        test('Should be an object with functions as properties', () => {

            assert.isObject(intent);

            each(intent, (prop) => assert.isFunction(prop));
        });

    });


    suite('events mapping', () => {

        suite('focusOnField$', () => {

            test('should listen on focus event on field',
            inject((createObservable, onNext, mockInteractions, getValues) => {
                let focusOnField$ = intent.focusOnField$(mockInteractions({
                    '#field@focus': createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                }));

                let results = getValues(focusOnField$);

                assert.equalCollection(
                    results,
                    [ 'something', 'anything' ]
                );

            }));

        });


        suite('blurOnField$', () => {

            test('should listen on focus event on field',
            inject((createObservable, onNext, mockInteractions, getValues) => {
                let blurOnField$ = intent.blurOnField$(mockInteractions({
                    '#field@blur': createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                }));

                let results = getValues(blurOnField$);

                assert.equalCollection(
                    results,
                    [ 'something', 'anything' ]
                );

            }));

        });


        suite('inputOnField$', () => {

            test('should listen on focus event on field',
            inject((createObservable, onNext, mockInteractions, getValues) => {
                let inputOnField$ = intent.inputOnField$(mockInteractions({
                    '#field@input': createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                }));

                let results = getValues(inputOnField$);

                assert.equalCollection(
                    results,
                    [ 'something', 'anything' ]
                );

            }));

        });


        suite('mouseenterOnAutocompletion$', () => {

            test('should listen on focus event on field',
            inject((createObservable, onNext, mockInteractions, getValues) => {
                let mouseenterOnAutocompletion$ = intent.mouseenterOnAutocompletion$(mockInteractions({
                    '.autocompletion@mouseenter': createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                }));

                let results = getValues(mouseenterOnAutocompletion$);

                assert.equalCollection(
                    results,
                    [ 'something', 'anything' ]
                );

            }));

        });


        suite('mousedownOnAutocompletion$', () => {

            test('should listen on focus event on field',
            inject((createObservable, onNext, mockInteractions, getValues) => {
                let mousedownOnAutocompletion$ = intent.mousedownOnAutocompletion$(mockInteractions({
                    '.autocompletion@mousedown': createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                }));

                let results = getValues(mousedownOnAutocompletion$);

                assert.equalCollection(
                    results,
                    [ 'something', 'anything' ]
                );

            }));

        });


        suite('keydownOnField$', () => {

            test('should listen on focus event on field',
            inject((createObservable, onNext, mockInteractions, getValues) => {
                let keydownOnField$ = intent.keydownOnField$(mockInteractions({
                    '#field@keydown': createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                }));

                let results = getValues(keydownOnField$);

                assert.equalCollection(
                    results,
                    [ 'something', 'anything' ]
                );

            }));

        });

    });


    suite('I/O', () => {

        suite('valueChange$', () => {

            test('should change value every time value attribute changes',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let valueChange$ = callWithObservables(intent.valueChange$, {
                    valueAttr$: createObservable(
                        onNext(100, 'abc'),
                        onNext(200, 'def'),
                        onNext(250, 'ghi')
                    )
                });

                let results = getValues(valueChange$);

                assert.equalCollection(
                    results,
                    [ 'abc', 'def', 'ghi' ]
                );

            }));


            test('should change value every time input event on field is emitted',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let valueChange$ = callWithObservables(intent.valueChange$, {
                    inputOnField$: createObservable(
                        onNext(100, { target: { value: 'abc' } }),
                        onNext(200, { target: { value: 'def' } }),
                        onNext(250, { target: { value: 'ghi' } })
                    )
                });

                let results = getValues(valueChange$);

                assert.equalCollection(
                    results,
                    [ 'abc', 'def', 'ghi' ]
                );

            }));

        });


        suite('selectedAutocompletionInput$', () => {

            test('should change index directly every time mouse is over autocompletion',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let selectedAutocompletionInput$ = callWithObservables(intent.selectedAutocompletionInput$, {
                    mouseenterOnAutocompletion$: createObservable(
                        onNext(100, { target: { index: 10 } }),
                        onNext(200, { target: { index: 11 } }),
                        onNext(250, { target: { index: 12 } })
                    )
                });

                let results = getValues(selectedAutocompletionInput$);

                assert.equalCollection(
                    results,
                    [ { direct: 10 }, { direct: 11 }, { direct: 12 } ]
                );

            }));


            test('should modify index every time up or down arrow key is pressed',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let selectedAutocompletionInput$ = callWithObservables(intent.selectedAutocompletionInput$, {
                    up$: createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything'),
                        onNext(250, 'what else')
                    ),
                    down$: createObservable(
                        onNext(120, 'something'),
                        onNext(180, 'anything'),
                        onNext(280, 'what else')
                    )
                });

                let results = getValues(selectedAutocompletionInput$);

                assert.equalCollection(
                    results,
                    [ { modifier: -1 }, { modifier: 1 }, { modifier: 1 }, { modifier: -1 }, { modifier: -1 }, { modifier: 1 } ]
                );

            }));

        });


        suite('selectedAutocompletionChange$', () => {

            test('should trigger change every time mouse button is pressed over autocompletion',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let selectedAutocompletionChange$ = callWithObservables(intent.selectedAutocompletionChange$, {
                    mousedownOnAutocompletion$: createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                });

                let results = getValues(selectedAutocompletionChange$);

                assert.equalCollection(
                    results,
                    [ true, true ]
                );

            }));


            test('should trigger change every time enter key is pressed',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let selectedAutocompletionChange$ = callWithObservables(intent.selectedAutocompletionChange$, {
                    enter$: createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                });

                let results = getValues(selectedAutocompletionChange$);

                assert.equalCollection(
                    results,
                    [ true, true ]
                );

            }));

        });


        suite('showAutocompletions$', () => {

            test('should show autocompletion every time any key except enter is pressed',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let showAutocompletions$ = callWithObservables(intent.showAutocompletions$, {
                    notEnter$: createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                });

                let results = getValues(showAutocompletions$);

                assert.equalCollection(
                    results,
                    [ true, true ]
                );

            }));


            test('should hide autocompletions every time field is focused',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let showAutocompletions$ = callWithObservables(intent.showAutocompletions$, {
                    focusOnField$: createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                });

                let results = getValues(showAutocompletions$);

                assert.equalCollection(
                    results,
                    [ true, true ]
                );

            }));

        });


        suite('hideAutocompletions$', () => {

            test('should hide autocompletions every time enter key is pressed',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let hideAutocompletions$ = callWithObservables(intent.hideAutocompletions$, {
                    enter$: createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                });

                let results = getValues(hideAutocompletions$);

                assert.equalCollection(
                    results,
                    [ true, true ]
                );

            }));


            test('should hide autocompletions every time field is blured',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let hideAutocompletions$ = callWithObservables(intent.hideAutocompletions$, {
                    blurOnField$: createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                });

                let results = getValues(hideAutocompletions$);

                assert.equalCollection(
                    results,
                    [ true, true ]
                );

            }));

        });


        suite('finish$', () => {

            test('should trigger editing finish every time field is blured',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let finish$ = callWithObservables(intent.finish$, {
                    blurOnField$: createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything')
                    )
                });

                let results = getValues(finish$);

                assert.equalCollection(
                    results,
                    [ true, true ]
                );

            }));

        });

    });

});