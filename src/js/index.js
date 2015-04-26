import createComponent from './create-component';
import createStreamsGroup from './create-streams-group';

import view from './view';
import intent from './intent';
import model from './model';


createComponent('autocompleted-select', function(interaction$, props) {
    let view$$ = createStreamsGroup({ view$: view });
    let intent$$ = createStreamsGroup(intent);
    let model$$ = createStreamsGroup(model);

    interaction$.inject(view$$.view$);
    view$$.inject(model$$);
    model$$.inject(intent$$, {
        datalistAttr$: props.datalist
    });
    intent$$.inject({ interaction$,
        valueAttr$: props.value
    });

    model$$.value$.skip(1).subscribe((value) => {
        this.value = value;
        
        this.dispatchEvent(new Event('change'));
    });

}, [ 'value', 'datalist' ]);
