/* global suite, test */

import chai from 'chai';
import { assert } from 'chai';

// has to be imported before Rx
import inject from 'cyclejs-mock';

import { Rx } from 'cyclejs';

import view from '../view';

chai.use(require('chai-equal-collection')(Rx.internals.isEqual));


suite('view', () => {

    suite('API', () => {

        test('Should be a function', () => {

            assert.isFunction(view);

        });

    });

    suite('I/O', () => {

        test('should rerender input with id field and value',
        inject((createObservable, onNext, render, getValues, callWithObservables) => {
            let vtree$ = callWithObservables(view, {
                textFieldValue$: createObservable(
                    onNext(100, 'abc')
                ),
                autocompletions$: [ 'abc', 'def', 'ghi' ],
                areAutocompletionsVisible$: false,
                highlightedAutocompletionIndex$: 0,
                isValueInvalid$: false
            });

            let results = getValues(vtree$.map(render));

            let input = results[0].querySelector('input#field');
            assert.isNotNull(input);

            assert.equal(input.value, 'abc');
        }));

        test('should rerender view every time value attribute changes',
        inject((createObservable, onNext, render, getValues, callWithObservables) => {
            let vtree$ = callWithObservables(view, {
                textFieldValue$: createObservable(
                    onNext(100, 'abc'),
                    onNext(200, 'def'),
                    onNext(250, 'ghi')
                ),
                autocompletions$: [ 'abc', 'def', 'ghi' ],
                areAutocompletionsVisible$: false,
                highlightedAutocompletionIndex$: 0,
                isValueInvalid$: false
            });

            let results = getValues(vtree$.map(render));

            assert.equal(results.length, 3);

            assert.equalCollection(
                results.map((element) =>  element.querySelector('#field').value),
                [ 'abc', 'def', 'ghi' ]
            );
        }));

    });

});