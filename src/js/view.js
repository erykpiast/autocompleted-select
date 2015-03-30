import Cycle from 'cyclejs';
import { Rx } from 'cyclejs';
import { h } from 'cyclejs';


export default function createAutocompletedTextView() {
    var autocompletedTextView = Cycle.createView(function (autocompletedTextModel) {
        return {
            vtree$: Rx.Observable.combineLatest(
                autocompletedTextModel.get('textFieldValue$'),
                autocompletedTextModel.get('autocompletions$'),
                autocompletedTextModel.get('areAutocompletionsVisible$'),
                autocompletedTextModel.get('highlightedAutocompletionIndex$'),
                autocompletedTextModel.get('isValueInvalid$'),
                (value, autocompletions, areAutocompletionsVisible, highlightedAutocompletionIndex, isValueInvalid) =>
                h('div', [
                    h('input#field', {
                        type: 'text',
                        value: value,
                        className: isValueInvalid ? 'is-invalid' : ''
                    }),
                    h('ul', {
                        scrollTop: Cycle.vdomPropHook((element, property) => {
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
                        index: index,
                        className: highlightedAutocompletionIndex === index ? 'is-selected' : ''
                    }, keyword)))
                ])
            )
        };
    });

    return autocompletedTextView;
}
