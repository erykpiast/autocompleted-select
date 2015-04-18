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

    suite('I/O', () => {
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


        test('should change value only if it is different than previous one',
        inject((createObservable, onNext, callWithObservables, getValues) => {
            let valueChange$ = callWithObservables(intent.valueChange$, {
                inputOnField$: createObservable(
                    onNext(100, { target: { value: 'abc' } }),
                    onNext(200, { target: { value: 'def' } }),
                    onNext(250, { target: { value: 'ghi' } })
                ),
                valueAttr$:  createObservable(
                    onNext(101, 'abc'),
                    onNext(199, 'def'),
                    onNext(251, 'ghi')
                )
            });

            let results = getValues(valueChange$);

            assert.equalCollection(
                results,
                [ 'abc', 'def', 'ghi' ]
            );
        }));

    });

});