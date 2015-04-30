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
                    textFieldValue$: createObservable(
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
                    textFieldValue$: 'abc',
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
                    textFieldValue$: createObservable(
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
                        onNext(100, [ 'abc' ]),
                        onNext(200, [ ])
                    ),
                    showAutocompletions$: createObservable(
                        onNext(101, 'something')
                    )
                });

                let results = getValues(areAutocompletionsVisible$);

                assert.equalCollection(
                    results,
                    [ false, true, false ]
                );

            }));


            test('should hide autocompletions when show request is performed and hide when hide request is performed',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let areAutocompletionsVisible$ = callWithObservables(model.areAutocompletionsVisible$, {
                    showAutocompletions$: createObservable(
                        onNext(101, [ 'something' ]),
                        onNext(201, [ 'anything' ])
                    ),
                    hideAutocompletions$: createObservable(
                        onNext(150, [ 'something' ]),
                        onNext(250, [ 'anything' ])
                    ),
                    autocompletions$: createObservable(
                        onNext(100, [ 'abc' ]),
                        onNext(200, [ 'def' ])
                    )
                });

                let results = getValues(areAutocompletionsVisible$);

                assert.equalCollection(
                    results,
                    [ false, true, false, true, false ]
                );

            }));
            
            
            test('should not show autocompletions when show request is performed but there is no autocompletion',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let areAutocompletionsVisible$ = callWithObservables(model.areAutocompletionsVisible$, {
                    showAutocompletions$: createObservable(
                        onNext(101, [ 'something' ]),
                        onNext(201, [ 'anything' ])
                    ),
                    autocompletions$: createObservable(
                        onNext(100, [ ]),
                        onNext(150, [ 'abc' ]),
                        onNext(200, [ ])
                    )
                });

                let results = getValues(areAutocompletionsVisible$);

                assert.equalCollection(
                    results,
                    [ false ]
                );

            }));


            test('should emit value only if it is different than previous one',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let areAutocompletionsVisible$ = callWithObservables(model.areAutocompletionsVisible$, {
                    autocompletions$: createObservable(
                        onNext(99, [ 'def' ]),
                        onNext(101, [ 'definition', 'undefined' ]),
                        onNext(199, [ ]),
                        onNext(200, [ 'xyz' ]),
                        onNext(250, [ 'abc' ]),
                        onNext(251, [ ])
                    ),
                    showAutocompletions$: createObservable(
                        onNext(100, [ 'something' ]),
                        onNext(201, [ 'anything' ])
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


        suite('highlightedAutocompletionIndex$', () => {

            test('should change index value when it changes directly',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let highlightedAutocompletionIndex$ = callWithObservables(model.highlightedAutocompletionIndex$, {
                    selectedAutocompletionInput$: createObservable(
                        onNext(100, { direct: 2 }),
                        onNext(200, { direct: 1 }),
                        onNext(300, { direct: 3 }),
                        onNext(400, { direct: 0 }),
                        onNext(500, { direct: 2 })
                    ),
                    autocompletions$: [ 'abc1', 'abc2', 'adef', 'axyz' ]
                });

                let results = getValues(highlightedAutocompletionIndex$);

                assert.equalCollection(
                    results,
                    [ 2, 1, 3, 0, 2 ]
                );

            }));


            test('should change index value when it changes by modifier',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let highlightedAutocompletionIndex$ = callWithObservables(model.highlightedAutocompletionIndex$, {
                    selectedAutocompletionInput$: createObservable(
                        onNext(100, { modifier: 1 }),
                        onNext(200, { modifier: 1 }),
                        onNext(300, { modifier: -1 }),
                        onNext(400, { modifier: -1 }),
                        onNext(500, { modifier: 1 })
                    ),
                    autocompletions$: [ 'abc1', 'abc2', 'adef', 'axyz' ]
                });

                let results = getValues(highlightedAutocompletionIndex$);

                assert.equalCollection(
                    results,
                    [ 1, 2, 1, 0, 1 ]
                );

            }));

        });


        suite('selectedAutocompletion$', () => {

            test('should change selected autocompletion on change intent',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let selectedAutocompletion$ = callWithObservables(model.selectedAutocompletion$, {
                    selectedAutocompletionChange$: createObservable(
                        onNext(101, 'something'),
                        onNext(201, 'anything')
                    ),
                    highlightedAutocompletionIndex$: createObservable(
                        onNext(100, 1),
                        onNext(200, 2)
                    ),
                    autocompletions$: [ 'abc', 'abc1', 'abc2' ]
                });

                let results = getValues(selectedAutocompletion$);

                assert.equalCollection(
                    results,
                    [ 'abc1', 'abc2' ]
                );

            }));


            test('should change selected autocompletion only if it is different than previous one',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let selectedAutocompletion$ = callWithObservables(model.selectedAutocompletion$, {
                    selectedAutocompletionChange$: createObservable(
                        onNext(101, 'something'),
                        onNext(201, 'anything')
                    ),
                    highlightedAutocompletionIndex$: createObservable(
                        onNext(100, 1)
                    ),
                    autocompletions$: [ 'abc', 'abc1', 'abc2' ]
                });

                let results = getValues(selectedAutocompletion$);

                assert.equalCollection(
                    results,
                    [ 'abc1' ]
                );

            }));

        });


        suite('isValueInvalid$', () => {

            test('should be value invalid if there is no autocompletion and valid when there is some',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let isValueInvalid$ = callWithObservables(model.isValueInvalid$, {
                    autocompletions$: createObservable(
                        onNext(100, [ 'abc', 'abc1' ]),
                        onNext(200, [ ]),
                        onNext(300, [ 'xyz' ])
                    )
                });

                let results = getValues(isValueInvalid$);

                assert.equalCollection(
                    results,
                    [ false, true, false ]
                );

            }));


            test('should be value not invalid when editing is finished',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let isValueInvalid$ = callWithObservables(model.isValueInvalid$, {
                    finish$: createObservable(
                        onNext(101, 'something'),
                        onNext(201, 'anything')
                    ),
                    autocompletions$: createObservable(
                        onNext(100, [ ]),
                        onNext(200, [ ])
                    )
                });

                let results = getValues(isValueInvalid$);

                assert.equalCollection(
                    results,
                    [ false, true, false, true, false ]
                );

            }));

        });


        suite('notValidatedTextFieldValue$', () => {

            test('should pass every value from valueChange$',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let notValidatedTextFieldValue$ = callWithObservables(model.notValidatedTextFieldValue$, {
                    valueChange$: createObservable(
                        onNext(100, 'something'),
                        onNext(200, 'anything'),
                        onNext(300, 'xxx')
                    )
                });

                let results = getValues(notValidatedTextFieldValue$);

                assert.equalCollection(
                    results,
                    [ 'something', 'anything', 'xxx' ]
                );

            }));

        });


        suite('textFieldValue$', () => {

            test('should start with empty value',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let textFieldValue$ = callWithObservables(model.textFieldValue$, { });

                let results = getValues(textFieldValue$);

                assert.equalCollection(
                    results,
                    [ '' ]
                );

            }));

            test('should change every time text field value changes',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let textFieldValue$ = callWithObservables(model.textFieldValue$, {
                    notValidatedTextFieldValue$: createObservable(
                        onNext(101, 'abc'),
                        onNext(201, '123'),
                        onNext(301, 'xyz')
                    )
                });

                let results = getValues(textFieldValue$);

                assert.equalCollection(
                    results,
                    [ '', 'abc', '123', 'xyz' ]
                );

            }));


            test('should change every time selected autocompletion changes',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let textFieldValue$ = callWithObservables(model.textFieldValue$, {
                    selectedAutocompletion$: createObservable(
                        onNext(101, 'abc'),
                        onNext(201, '123'),
                        onNext(301, 'xyz')
                    )
                });

                let results = getValues(textFieldValue$);

                assert.equalCollection(
                    results,
                    [ '', 'abc', '123', 'xyz' ]
                );

            }));


            test('should change every time edition finishes with latest distinct value from value$',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let textFieldValue$ = callWithObservables(model.textFieldValue$, {
                    finish$: createObservable(
                        onNext(101, 'something'),
                        onNext(201, 'anything'),
                        onNext(301, 'whatever')
                    ),
                    value$: createObservable(
                        onNext(100, 'abc'),
                        onNext(300, 'xyz')
                    )
                });

                let results = getValues(textFieldValue$);

                assert.equalCollection(
                    results,
                    [ '', 'abc', 'xyz' ]
                );

            }));

        });


        suite('value$', () => {

            test('should value change every time selected autocompletion changes',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let value$ = callWithObservables(model.value$, {
                    selectedAutocompletion$: createObservable(
                        onNext(100, 'abc1'),
                        onNext(200, 'abc2')
                    )
                });

                let results = getValues(value$);

                assert.equalCollection(
                    results,
                    [ 'abc1', 'abc2' ]
                );

            }));


            test('should value change every time editing finishes and there is some autocompletion for current text field value',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let value$ = callWithObservables(model.value$, {
                    finish$: createObservable(
                        onNext(101, 'something'),
                        onNext(201, 'anything'),
                        onNext(301, 'anything')
                    ),
                    notValidatedTextFieldValue$: createObservable(
                        onNext(100, 'abc'),
                        onNext(200, 'xyz'),
                        onNext(300, 'def')
                    ),
                    autocompletions$:  createObservable(
                        onNext(100, [ 'abc', 'abc1', 'abc2' ]),
                        onNext(200, [ ]),
                        onNext(300, [ 'def', 'definition', 'undefined' ])
                    )
                });

                let results = getValues(value$);

                assert.equalCollection(
                    results,
                    [ 'abc', 'def' ]
                );

            }));


            test('should value change if previous value was different',
            inject((createObservable, onNext, callWithObservables, getValues) => {
                let value$ = callWithObservables(model.value$, {
                    selectedAutocompletion$: createObservable(
                        onNext(100, 'abc'),
                        onNext(200, 'def')
                    ),
                    finish$: createObservable(
                        onNext(101, 'something'),
                        onNext(201, 'anything'),
                        onNext(301, 'anything')
                    ),
                    notValidatedTextFieldValue$: createObservable(
                        onNext(100, 'abc'),
                        onNext(200, 'xyz'),
                        onNext(300, 'def')
                    ),
                    autocompletions$:  createObservable(
                        onNext(100, [ 'abc', 'abc1', 'abc2' ]),
                        onNext(200, [ ]),
                        onNext(300, [ 'def', 'definition', 'undefined' ])
                    )
                });

                let results = getValues(value$);

                assert.equalCollection(
                    results,
                    [ 'abc', 'def' ]
                );

            }));

        });

    });

});