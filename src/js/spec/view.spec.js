/* global suite, setup, teardown, test */

import chai from 'chai';
import { assert } from 'chai';

// has to be imported before Rx
import inject from './cycle-mock';

import { Rx } from 'cyclejs';

import DataFlowNode from 'cyclejs/lib/data-flow-node';

import view from '../view';

chai.use(require('chai-equal-collection')(Rx.internals.isEqual));


suite('view', () => {

    suite('API', () => {

        test('Should be a function and not throw', () => {

            assert.isFunction(view);
            assert.doesNotThrow(view);

        });

        suite('returned value', () => {
            var viewInstance;

            setup(() => {
                viewInstance = view();
            });

            teardown(() => {
                viewInstance = null;
            });

            test('should return DataFlowNode', () => {

                assert.instanceOf(viewInstance, DataFlowNode);

            });

        });

    });

    suite('I/O', () => {
        var viewInstance;

        setup(() => {
            viewInstance = view();
        });

        teardown(() => {
            viewInstance = null;
        });


        test('should rerender input with id field and value',
        inject((scheduler, onNext, mockUser, mockDataFlowSource, render, getValues) => {
            viewInstance.inject(mockDataFlowSource({
                textFieldValue$: scheduler.createHotObservable(
                    onNext(100, 'abc')
                ),
                autocompletions$: [ 'abc', 'def', 'ghi' ],
                areAutocompletionsVisible$: false,
                highlightedAutocompletionIndex$: 0,
                isValueInvalid$: false
            }));

            var results = getValues(scheduler.startWithTiming(() =>
                render(viewInstance),
                50,
                80,
                1000
            ));

            var input = results[0].querySelector('input#field');
            assert.isNotNull(input);

            assert.equal(input.value, 'abc');
        }));

        test('should rerender view every time value attribute changes',
        inject((scheduler, onNext, mockUser, mockDataFlowSource, render, getValues) => {
            viewInstance.inject(mockDataFlowSource({
                textFieldValue$: scheduler.createHotObservable(
                    onNext(100, 'abc'),
                    onNext(200, 'def'),
                    onNext(250, 'ghi')
                ),
                autocompletions$: [ 'abc', 'def', 'ghi' ],
                areAutocompletionsVisible$: false,
                highlightedAutocompletionIndex$: 0,
                isValueInvalid$: false
            }));

            var results = getValues(scheduler.startWithTiming(() =>
                render(viewInstance),
                50,
                80,
                1000
            ));


            assert.equal(results.length, 3);

            assert.equalCollection(
                results.map((element) => {
                    return element.querySelector('#field').value;
                }),
                [ 'abc', 'def', 'ghi' ]
            );
        }));


        // test('should change value every time input event on field is emitted',
        // inject((scheduler, onNext, mockUser, mockDataFlowSource) => {
        //     intentInstance.inject(mockUser({
        //         '#field@input': scheduler.createHotObservable(
        //             onNext(100, { target: { value: 'abc' } }),
        //             onNext(200, { target: { value: 'def' } }),
        //             onNext(250, { target: { value: 'ghi' } })
        //         )
        //     }), mockDataFlowSource());

        //     var results = scheduler.startWithTiming(() =>
        //         intentInstance.get('valueChange$'),
        //         50,
        //         80,
        //         1000
        //     );

        //     assert.equalCollection(results.messages, [
        //         onNext(100, 'abc'),
        //         onNext(200, 'def'),
        //         onNext(250, 'ghi')
        //     ]);

        // }));


        // test('should change value only if it is different than previous one',
        // inject((scheduler, onNext, mockUser, mockDataFlowSource) => {
        //     intentInstance.inject(mockUser({
        //         '#field@input': scheduler.createHotObservable(
        //             onNext(100, { target: { value: 'abc' } }),
        //             onNext(200, { target: { value: 'def' } }),
        //             onNext(250, { target: { value: 'ghi' } })
        //         )
        //     }), mockDataFlowSource({
        //         value$: scheduler.createHotObservable(
        //             onNext(101, 'abc'),
        //             onNext(199, 'def'),
        //             onNext(251, 'ghi')
        //         )
        //     }));

        //     var results = scheduler.startWithTiming(() =>
        //         intentInstance.get('valueChange$'),
        //         50,
        //         80,
        //         1000
        //     );

        //     assert.equalCollection(results.messages, [
        //         onNext(100, 'abc'),
        //         onNext(199, 'def'),
        //         onNext(250, 'ghi')
        //     ]);
        // }));

    });

});