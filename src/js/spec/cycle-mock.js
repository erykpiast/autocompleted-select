// it's the same instance that Cycle uses
import Rx from 'cyclejs/node_modules/rx/dist/rx';
// this call extends Rx above with VirtualTime class and HAS TO be included BEFORE rx.testing
import 'cyclejs/node_modules/rx/dist/rx.virtualtime';
import 'cyclejs/node_modules/rx/dist/rx.testing';

import createElement from 'cyclejs/node_modules/virtual-dom/create-element';

import Depender from 'depender';


export default function injectTestingUtils(fn) {
    var scheduler = new Rx.TestScheduler();

    /**
     * @function mockDataFlowNode - creates a mock of DataFlowNode
     * @param {object} [definitionObj={}] - definition of observables for the mock
     * @property {*} definitionObj[observableName] - definition of mock for particular data stream
     *      if Observable is provided, it will be returned when `get` with `observableName` as argument is called
     *      if any other value is provided, cold Observable starting with this value is created
     *      if `get` function is called with key not provided in `definitionObj`, empty hot Obserable is created
     */
    function mockDataFlowNode(definitionObj = {}) {
        var observables = { };

        Object.keys(definitionObj).forEach((name) => {
            if(definitionObj[name] instanceof Rx.Observable) {
                observables[name] = definitionObj[name];
            } else {
                observables[name] = scheduler.createColdObservable(
                    Rx.ReactiveTest.onNext(0, definitionObj[name])
                );
            }
        });

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


    function render(view) {
        return view.get('vtree$')
            .map(createElement);
    }
    
    
    function getValues(results) {
        return results.messages.map((message) => message.value.value);
    }


    var injector = new Depender();

    injector.define('mockUser', mockUser);
    injector.define('mockDataFlowSource', mockDataFlowNode);
    injector.define('mockDataFlowNode', mockDataFlowNode);
    injector.define('scheduler', scheduler);
    injector.define('render', render);
    injector.define('getValues', getValues);
    injector.define('onNext', (...args) => Rx.ReactiveTest.onNext(...args));

    return function() {
        return injector.use(fn);
    };
}