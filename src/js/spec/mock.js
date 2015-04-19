// it's the same instance that Cycle uses
import { Rx } from 'cyclejs';
// this call extends Rx above with VirtualTime class and HAS TO be included BEFORE rx.testing
import 'cyclejs/node_modules/rx/dist/rx.virtualtime';
import 'cyclejs/node_modules/rx/dist/rx.testing';

import createElement from 'cyclejs/node_modules/virtual-dom/create-element';



import getParametersNames from 'get-parameter-names';

import Depender from 'depender';


export default function injectTestingUtils(fn) {
    var scheduler = new Rx.TestScheduler();

    /**
     * @function callWithObservables - calls function with arguments specified as keys of the object
     * @param {object} [observables={}] - collection of observables to use as the function arguments
     * @property {*} observables[observableName] - definition of Observable mock for given name
     *      if value other than observable is provided, hot Observable starting with this value is created
     *      if any of function argument is missing, empty hot Observable is created
     * @returns {Observable} value returned from the function
     */
    function callWithObservables(fn, observables = {}, ctx = null) {
        var args = { };

        Object.keys(observables).forEach((name) => {
            if(observables[name] instanceof Rx.Observable) {
                args[name] = observables[name];
            } else {
                args[name] = createObservable(
                    Rx.ReactiveTest.onNext(2, observables[name])
                );
            }
        });

        var fnArgs = getParametersNames(fn);

        fnArgs.forEach((name) => {
            if(!(args[name] instanceof Rx.Observable)) {
                args[name] = createObservable();
            }
        });

        return fn.apply(ctx, fnArgs.map((name) =>
            args[name].tap(console.log.bind(console, name))
            )
        );
    }


    function mockInteractions(definitionObj = {}) {
        var eventsMap = { };

        Object.keys(definitionObj).forEach((name) => {
            var [ selector, event ] = name.split('@');

            if(!eventsMap.hasOwnProperty(selector)) {
                eventsMap[selector] = { };
            }

            eventsMap[selector][event] = definitionObj[name];
        });

        return {
            choose: (selector, event) => {
                if(!eventsMap.hasOwnProperty(selector)) {
                    eventsMap[selector] = { };
                }

                if(!eventsMap[selector].hasOwnProperty(event)) {
                    eventsMap[selector][event] = createObservable();
                }

                return eventsMap[selector][event]
                    .tap(console.log.bind(console, selector, event));
            }
        };
    }


    function getValues(observable) {
        return scheduler.startWithTiming(
            () => observable,
            1,
            10,
            100000
        ).messages.map((message) => message.value.value);
    }
    
    
    function createObservable(...args) {
        return scheduler.createColdObservable(...args).shareReplay(1);
    }


    var injector = new Depender();

    injector.define('mockInteractions', mockInteractions);
    injector.define('callWithObservables', callWithObservables);
    injector.define('createObservable', createObservable);
    injector.define('render', createElement);
    injector.define('getValues', getValues);
    injector.define('onNext', (...args) => Rx.ReactiveTest.onNext(...args));

    return function() {
        return injector.use(fn);
    };
}