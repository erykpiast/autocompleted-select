/* global suite, setup, teardown, test */

import DataFlowNode from 'cyclejs/src/data-flow-node';
import Cycle from 'cyclejs';
import { Rx } from 'cyclejs';

import chai from 'chai';
import { assert } from 'chai';

import intent from '../intent';

chai.use(require('chai-equal-collection')(Rx.internals.isEqual));


var onNext = Rx.ReactiveTest.onNext;


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


    function mockInput(definitionObj) {
        return Cycle.createDataFlowSource(definitionObj);
    }

    suite('I/O', () => {
        var intentInstance;
        var fakeView, fakeAttrs;
        var scheduler;

        setup(() => {
            scheduler = new Rx.TestScheduler();

            fakeView = mockInput({
                keydown$: scheduler.createHotObservable(
                    // onNext(1000, { keyCode: 40 })
                ),
                change$: scheduler.createHotObservable(
                    // onNext(1000, { target: { value: 'abc' } })
                ),
                hover$: scheduler.createHotObservable(
                    // onNext(1000, { target: { index: 13 } })
                ),
                click$: scheduler.createHotObservable(
                    // onNext(1000, true)
                ),
                focus$: scheduler.createHotObservable(
                    // onNext(1000, true)
                ),
                blur$: scheduler.createHotObservable(
                    // onNext(1000, true)
                )
            });
            fakeAttrs = mockInput({
                value$: scheduler.createHotObservable(
                    onNext(100, 'abc'),
                    onNext(200, 'def'),
                    onNext(250, 'ghi')
                )
            });

            intentInstance = intent();

            intentInstance.inject(fakeView, fakeAttrs);
        });

        teardown(() => {
            intentInstance = fakeView = fakeAttrs = scheduler = null;
        });


        test('should change value every time value attribute changes', () => {

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
        });

    });

});