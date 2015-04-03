/* global suite, setup, teardown, test */

import chai from 'chai';
import { assert } from 'chai';

// has to be imported before Rx
import inject from './cycle-mock';

import { Rx } from 'cyclejs';

import DataFlowNode from 'cyclejs/lib/data-flow-node';

import intent from '../intent';

chai.use(require('chai-equal-collection')(Rx.internals.isEqual));


suite('intent', () => {

    suite('API', () => {

        test('Should be a function and not throw', () => {

            assert.isFunction(intent);
            assert.doesNotThrow(intent);

        });

        suite('returned value', () => {
            var intentInstance;

            setup(() => {
                intentInstance = intent();
            });

            teardown(() => {
                intentInstance = null;
            });

            test('should return DataFlowNode', () => {

                assert.instanceOf(intentInstance, DataFlowNode);

            });

        });

    });

    suite('I/O', () => {
        var intentInstance;

        setup(() => {
            intentInstance = intent();
        });

        teardown(() => {
            intentInstance = null;
        });


        test('should change value every time value attribute changes',
        inject((scheduler, onNext, mockUser, mockDataFlowSource) => {
            intentInstance.inject(mockUser(), mockDataFlowSource({
                value$: scheduler.createHotObservable(
                    onNext(100, 'abc'),
                    onNext(200, 'def'),
                    onNext(250, 'ghi')
                )
            }));

            var results = scheduler.startWithTiming(() =>
                intentInstance.get('valueChange$'),
                50,
                80,
                1000
            );

            assert.equalCollection(results.messages, [
                onNext(100, 'abc'),
                onNext(200, 'def'),
                onNext(250, 'ghi')
            ]);
        }));


        test('should change value every time input event on field is emitted',
        inject((scheduler, onNext, mockUser, mockDataFlowSource) => {
            intentInstance.inject(mockUser({
                '#field@input': scheduler.createHotObservable(
                    onNext(100, { target: { value: 'abc' } }),
                    onNext(200, { target: { value: 'def' } }),
                    onNext(250, { target: { value: 'ghi' } })
                )
            }), mockDataFlowSource());

            var results = scheduler.startWithTiming(() =>
                intentInstance.get('valueChange$'),
                50,
                80,
                1000
            );

            assert.equalCollection(results.messages, [
                onNext(100, 'abc'),
                onNext(200, 'def'),
                onNext(250, 'ghi')
            ]);

        }));


        test('should change value only if it is different than previous one',
        inject((scheduler, onNext, mockUser, mockDataFlowSource) => {
            intentInstance.inject(mockUser({
                '#field@input': scheduler.createHotObservable(
                    onNext(100, { target: { value: 'abc' } }),
                    onNext(200, { target: { value: 'def' } }),
                    onNext(250, { target: { value: 'ghi' } })
                )
            }), mockDataFlowSource({
                value$: scheduler.createHotObservable(
                    onNext(101, 'abc'),
                    onNext(199, 'def'),
                    onNext(251, 'ghi')
                )
            }));

            var results = scheduler.startWithTiming(() =>
                intentInstance.get('valueChange$'),
                50,
                80,
                1000
            );

            assert.equalCollection(results.messages, [
                onNext(100, 'abc'),
                onNext(199, 'def'),
                onNext(250, 'ghi')
            ]);
        }));

    });

});