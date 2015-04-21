/* global suite, test */

import chai from 'chai';
import { assert } from 'chai';

// has to be imported before Rx
import inject from './mock';

import { Rx } from 'cyclejs';
import each from 'foreach';

import model from '../model';

chai.use(require('chai-equal-collection')(Rx.internals.isEqual));


suite('model', () => {

    suite('API', () => {

        test('Should be an object with functions as properties', () => {

            assert.isObject(model);

            each(model, (prop) => assert.isFunction(prop));
        });

    });


    suite('I/O', () => {

        suite('autocompletions$', () => {

            test('should change value every time value changes',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let autocompletions$ = callWithObservables(model.autocompletions$, {
                    valueChange$: createObservable(
                        onNext(100, 'abc'),
                        onNext(200, 'def'),
                        onNext(250, 'ghi')
                    ),
                    datalistAttr$: [ [ 'abc1' ], [ 'abc2' ], [ 'def' ], [ 'xyz' ] ]
                });

                let results = getValues(autocompletions$);

                assert.equal(results.length, 3);

            }));


            test('should change value every time datalist changes',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let autocompletions$ = callWithObservables(model.autocompletions$, {
                    valueChange$: 'abc',
                    datalistAttr$: createObservable(
                        onNext(100, [ [ 'abc1' ], [ 'abc2' ], [ 'def' ], [ 'xyz' ] ]),
                        onNext(200, [ [ 'abc2' ], [ 'def' ] ]),
                        onNext(250, [ [ 'abc1' ], [ 'xyz' ] ])
                    )
                });

                let results = getValues(autocompletions$);

                assert.equal(results.length, 3);

            }));


            test('should show only autocompletions matching with current value',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let autocompletions$ = callWithObservables(model.autocompletions$, {
                    valueChange$: createObservable(
                        onNext(100, 'abc'),
                        onNext(200, 'def'),
                        onNext(250, 'ghi')
                    ),
                    datalistAttr$: [ [ 'abc1' ], [ 'abc2' ], [ 'definition' ], [ 'undefined' ], [ 'xyz' ] ]
                });

                let results = getValues(autocompletions$);

                assert.equalCollection(
                    results,
                    [
                        [ 'abc1', 'abc2' ],
                        [ 'definition', 'undefined' ],
                        [ ]
                    ]
                );

            }));

        });
        
        
        suite('areAutocompletionsVisible$', () => {
            
            test('should be hidden by default',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let areAutocompletionsVisible$ = callWithObservables(model.areAutocompletionsVisible$, { });

                let results = getValues(areAutocompletionsVisible$);

                assert.equalCollection(
                    results,
                    [ false ]
                );

            }));

            test('should hide autocompletions when there is nothing to show',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let areAutocompletionsVisible$ = callWithObservables(model.areAutocompletionsVisible$, {
                    autocompletions$: createObservable(
                        onNext(100, [ 'definition', 'undefined' ]),
                        onNext(200, [ ]),
                        onNext(250, [ 'abc' ])
                    )
                });

                let results = getValues(areAutocompletionsVisible$);

                assert.equalCollection(
                    results,
                    [ false, true, false, true ]
                );

            }));


            test('should hide autocompletions when show request is performed and hide when hide request is performed',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let areAutocompletionsVisible$ = callWithObservables(model.areAutocompletionsVisible$, {
                    showAutocompletions$: createObservable(
                        onNext(100, [ 'something' ]),
                        onNext(200, [ 'anything' ])
                    ),
                    hideAutocompletions$: createObservable(
                        onNext(150, [ 'something' ]),
                        onNext(250, [ 'anything' ])
                    )
                });

                let results = getValues(areAutocompletionsVisible$);

                assert.equalCollection(
                    results,
                    [ false, true, false, true, false ]
                );

            }));


            test('should emit value only if it is different than previous one',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let areAutocompletionsVisible$ = callWithObservables(model.areAutocompletionsVisible$, {
                    autocompletions$: createObservable(
                        onNext(101, [ 'definition', 'undefined' ]),
                        onNext(199, [ ]),
                        onNext(250, [ 'abc' ]),
                        onNext(251, [ ]),
                    ),
                    showAutocompletions$: createObservable(
                        onNext(100, [ 'something' ]),
                        onNext(200, [ 'anything' ])
                    ),
                    hideAutocompletions$: createObservable(
                        onNext(150, [ 'something' ]),
                        onNext(250, [ 'anything' ])
                    )
                });

                let results = getValues(areAutocompletionsVisible$);

                assert.equalCollection(
                    results,
                    [ false, true, false, true, false ]
                );

            }));

        });
        
        
        // suite('highlightedAutocompletionIndex$', () => {

        //     test('should reset index to 0 every time value changes',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let highlightedAutocompletionIndex$ = callWithObservables(model.highlightedAutocompletionIndex$, {
        //             valueChange$: createObservable(
        //                 onNext(100, 'something'),
        //                 onNext(200, 'anything')
        //             ),
        //             autocompletions$: [ 'abc1', 'abc2', 'adef', 'axyz' ]
        //         });

        //         let results = getValues(highlightedAutocompletionIndex$);

        //         assert.equal(results.length, 3);

        //     }));


        //     test('should change value every time datalist changes',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let autocompletions$ = callWithObservables(model.autocompletions$, {
        //             valueChange$: 'abc',
        //             datalistAttr$: createObservable(
        //                 onNext(100, [ [ 'abc1' ], [ 'abc2' ], [ 'def' ], [ 'xyz' ] ]),
        //                 onNext(200, [ [ 'abc2' ], [ 'def' ] ]),
        //                 onNext(250, [ [ 'abc1' ], [ 'xyz' ] ])
        //             )
        //         });

        //         let results = getValues(autocompletions$);

        //         assert.equal(results.length, 3);

        //     }));


        //     test('should show only autocompletions matching with current value',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let autocompletions$ = callWithObservables(model.autocompletions$, {
        //             valueChange$: createObservable(
        //                 onNext(100, 'abc'),
        //                 onNext(200, 'def'),
        //                 onNext(250, 'ghi')
        //             ),
        //             datalistAttr$: [ [ 'abc1' ], [ 'abc2' ], [ 'definition' ], [ 'undefined' ], [ 'xyz' ] ]
        //         });

        //         let results = getValues(autocompletions$);

        //         assert.equalCollection(
        //             results,
        //             [
        //                 [ 'abc1', 'abc2' ],
        //                 [ 'definition', 'undefined' ],
        //                 [ ]
        //             ]
        //         );

        //     }));

        // });


        // suite('selectedAutocompletionInput$', () => {

        //     test('should change index directly every time mouse is over autocompletion',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let selectedAutocompletionInput$ = callWithObservables(model.selectedAutocompletionInput$, {
        //             mouseenterOnAutocompletion$: createObservable(
        //                 onNext(100, { target: { index: 10 } }),
        //                 onNext(200, { target: { index: 11 } }),
        //                 onNext(250, { target: { index: 12 } })
        //             )
        //         });

        //         let results = getValues(selectedAutocompletionInput$);

        //         assert.equalCollection(
        //             results,
        //             [ { direct: 10 }, { direct: 11 }, { direct: 12 } ]
        //         );

        //     }));


        //     test('should modify index every time up or down arrow key is pressed',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let selectedAutocompletionInput$ = callWithObservables(model.selectedAutocompletionInput$, {
        //             up$: createObservable(
        //                 onNext(100, 'something'),
        //                 onNext(200, 'anything'),
        //                 onNext(250, 'what else')
        //             ),
        //             down$: createObservable(
        //                 onNext(120, 'something'),
        //                 onNext(180, 'anything'),
        //                 onNext(280, 'what else')
        //             )
        //         });

        //         let results = getValues(selectedAutocompletionInput$);

        //         assert.equalCollection(
        //             results,
        //             [ { modifier: -1 }, { modifier: 1 }, { modifier: 1 }, { modifier: -1 }, { modifier: -1 }, { modifier: 1 } ]
        //         );

        //     }));

        // });


        // suite('selectedAutocompletionChange$', () => {

        //     test('should trigger change every time mouse button is pressed over autocompletion',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let selectedAutocompletionChange$ = callWithObservables(model.selectedAutocompletionChange$, {
        //             mousedownOnAutocompletion$: createObservable(
        //                 onNext(100, 'something'),
        //                 onNext(200, 'anything')
        //             )
        //         });

        //         let results = getValues(selectedAutocompletionChange$);

        //         assert.equalCollection(
        //             results,
        //             [ true, true ]
        //         );

        //     }));


        //     test('should trigger change every time enter key is pressed',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let selectedAutocompletionChange$ = callWithObservables(model.selectedAutocompletionChange$, {
        //             enter$: createObservable(
        //                 onNext(100, 'something'),
        //                 onNext(200, 'anything')
        //             )
        //         });

        //         let results = getValues(selectedAutocompletionChange$);

        //         assert.equalCollection(
        //             results,
        //             [ true, true ]
        //         );

        //     }));

        // });


        // suite('showAutocompletions$', () => {

        //     test('should show autocompletion every time any key except enter is pressed',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let showAutocompletions$ = callWithObservables(model.showAutocompletions$, {
        //             notEnter$: createObservable(
        //                 onNext(100, 'something'),
        //                 onNext(200, 'anything')
        //             )
        //         });

        //         let results = getValues(showAutocompletions$);

        //         assert.equalCollection(
        //             results,
        //             [ true, true ]
        //         );

        //     }));


        //     test('should hide autocompletions every time field is focused',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let showAutocompletions$ = callWithObservables(model.showAutocompletions$, {
        //             focusOnField$: createObservable(
        //                 onNext(100, 'something'),
        //                 onNext(200, 'anything')
        //             )
        //         });

        //         let results = getValues(showAutocompletions$);

        //         assert.equalCollection(
        //             results,
        //             [ true, true ]
        //         );

        //     }));

        // });


        // suite('hideAutocompletions$', () => {

        //     test('should hide autocompletions every time enter key is pressed',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let hideAutocompletions$ = callWithObservables(model.hideAutocompletions$, {
        //             enter$: createObservable(
        //                 onNext(100, 'something'),
        //                 onNext(200, 'anything')
        //             )
        //         });

        //         let results = getValues(hideAutocompletions$);

        //         assert.equalCollection(
        //             results,
        //             [ true, true ]
        //         );

        //     }));


        //     test('should hide autocompletions every time field is blured',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let hideAutocompletions$ = callWithObservables(model.hideAutocompletions$, {
        //             blurOnField$: createObservable(
        //                 onNext(100, 'something'),
        //                 onNext(200, 'anything')
        //             )
        //         });

        //         let results = getValues(hideAutocompletions$);

        //         assert.equalCollection(
        //             results,
        //             [ true, true ]
        //         );

        //     }));

        // });


        // suite('finish$', () => {

        //     test('should trigger editing finish every time field is blured',
        //     inject((createObservable, onNext, callWithObservables, getValues) => {
        //         let finish$ = callWithObservables(model.finish$, {
        //             blurOnField$: createObservable(
        //                 onNext(100, 'something'),
        //                 onNext(200, 'anything')
        //             )
        //         });

        //         let results = getValues(finish$);

        //         assert.equalCollection(
        //             results,
        //             [ true, true ]
        //         );

        //     }));

        // });

    });

});