import { Rx, createStream, render } from 'cyclejs';
import mapValues from 'map-values';


export default function createComponent(name, definitionFn, propsNames = []) {
    let proto = Object.create(HTMLElement.prototype);
    proto.createdCallback = function() {
        let props = {};
        propsNames.forEach((name) => {
            let value$ = props[name] = new Rx.Subject();
            let value = this[name];

            Object.defineProperty(this, name, {
                set(newValue) {
                    value = newValue;

                    value$.onNext(value);

                    return value;
                },
                get() {
                    return value;
                }
            });
        });

        let children$ = new Rx.Subject();
        (new MutationObserver((mutations) => {
            mutations
                .filter((mutation) => mutation.type === 'attributes')
                .filter((mutation) => mutation.target === this)
                .forEach((mutation) => {
                    let name = mutation.attributeName;

                    this[name] = this.getAttribute(name);
                });

            mutations
                .filter((mutation) => mutation.type !== 'attributes')
                .forEach(() => {
                    children$.onNext(this.children);
                });
        })).observe(this, {
            subtree: true,
            attributes: true,
            attributeFilter: Object.keys(props)
        });


        this.shadowRoot = this.createShadowRoot();
        let interaction$ = createStream((vtree) => render(vtree, this.shadowRoot).interaction$);

        definitionFn.call(
            this,
            interaction$,
            mapValues(props, (prop$) => prop$.shareReplay(1)),
            children$.shareReplay(1)
        );
    };

    document.registerElement(name, {
        prototype: proto
    });

}