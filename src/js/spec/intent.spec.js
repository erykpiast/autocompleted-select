/* global suite, setup, teardown, test */

import assign from 'lodash.assign';

import DataFlowNode from 'cyclejs/lib/data-flow-node';

import 'cyclejs/node_modules/rx/dist/rx.virtualtime';
import Rx from 'cyclejs/node_modules/rx/dist/rx';
import { ReactiveTest } from 'cyclejs/node_modules/rx/dist/rx.testing';

import chai from 'chai';
import { assert } from 'chai';

import intent from '../intent';

chai.use(require('chai-equal-collection')(Rx.internals.isEqual));

var onNext = ReactiveTest.onNext;


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
        var fakeView, fakeAttrs;
        var scheduler;


        function mockDataFlowSource(definitionObj = {}) {
            var observables = assign({ }, definitionObj);

            return {
                get: (observableName) => {
                    if(!observables.hasOwnProperty(observableName)) {
                        observables[observableName] = scheduler.createHotObservable();
                    }

                    return observables[observableName];
                }
            };
        }


        function mockUser(definitionObj = {}) {
            var eventsMap = { };

            Object.keys(definitionObj).forEach((name) => {
                var [ selector, event ] = name.split('@');

                if(!eventsMap.hasOwnProperty(selector)) {
                    eventsMap[selector] = { };
                }

                eventsMap[selector][event] = definitionObj[name];
            });

            return {
                event$: (selector, event) => {
                    if(!eventsMap.hasOwnProperty(selector)) {
                        eventsMap[selector] = { };
                    }

                    if(!eventsMap[selector].hasOwnProperty(event)) {
                        eventsMap[selector][event] = scheduler.createHotObservable();
                    }

                    return eventsMap[selector][event];
                }
            };
        }

        setup(() => {
            scheduler = new Rx.TestScheduler();

            intentInstance = intent();
        });

        teardown(() => {
            intentInstance = fakeView = fakeAttrs = scheduler = null;
        });


        test('should change value every time value attribute changes', () => {
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
        });


        test('should change value every time input event on field is emitted', () => {
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

        });


        test('should change value only if it is different than previous one', () => {
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
        });

    });

});