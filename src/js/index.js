import createComponent from './create-component';
import createGroup from 'cyclejs-group';

import view from './view';
import intent from './intent';
import model from './model';


createComponent('autocompleted-select', function(interaction$, props) {
    let view$$ = createGroup({ view$: view });
    let intent$$ = createGroup(intent);
    let model$$ = createGroup(model);

    interaction$.inject(view$$.view$);
    view$$.inject(model$$);
    model$$.inject(intent$$, {
        datalistAttr$: props.datalist
    }, model$$);
    intent$$.inject({ interaction$,
        valueAttr$: props.value
    }, intent$$);

    model$$.value$.skip(1).subscribe((value) => {
        this.value = value;
        
        this.dispatchEvent(new Event('change'));
    });

}, [ 'value', 'datalist' ]);
