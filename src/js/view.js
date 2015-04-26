import { Rx, h, vdomPropHook } from 'cyclejs';

var path = require('path');
var fs = require('fs');
var stylesheet = fs.readFileSync(path.resolve(__dirname, '../css/styles.css'), 'utf8');

export default function view(
    textFieldValue$,
    autocompletions$,
    areAutocompletionsVisible$,
    highlightedAutocompletionIndex$,
    isValueInvalid$
) {
    return Rx.Observable.combineLatest(
        textFieldValue$,
        autocompletions$,
        areAutocompletionsVisible$,
        highlightedAutocompletionIndex$,
        isValueInvalid$,
        (textFieldValue, autocompletions, areAutocompletionsVisible, highlightedAutocompletionIndex, isValueInvalid) =>
        h('div', [
            h('style', stylesheet),
            h('input#field', {
                type: 'text',
                value: textFieldValue,
                className: isValueInvalid ? 'is-invalid' : ''
            }),
            h('ul', {
                scrollTop: vdomPropHook((element, property) => {
                    var singleOptionHeight = element.children[0] ? element.children[0].offsetHeight : 18;
                    var selectedAutocompletionTop = highlightedAutocompletionIndex * singleOptionHeight;
                    var selectedAutocompletionBottom = (highlightedAutocompletionIndex + 1) * singleOptionHeight;

                    var visibleViewport = {
                        top: element[property],
                        bottom: element[property] + element.offsetHeight
                    };

                    if(selectedAutocompletionTop < visibleViewport.top) {
                        element[property] = selectedAutocompletionTop;
                    } else if(selectedAutocompletionBottom > visibleViewport.bottom) {
                        element[property] = selectedAutocompletionTop + singleOptionHeight - element.offsetHeight;
                    }
                }),
                className: areAutocompletionsVisible ? 'is-visible' : ''
            }, autocompletions.map((keyword, index) => h('li.autocompletion', {
                key: index,
                index: index,
                className: highlightedAutocompletionIndex === index ? 'is-selected' : ''
            }, keyword)))
        ])
    )
    .shareReplay(1);
}
