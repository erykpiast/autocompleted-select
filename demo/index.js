require('../src/js/index');

var autocompletedSelect = document.createElement('autocompleted-select');
autocompletedSelect.value = 'option1';
autocompletedSelect.datalist = [ 'option1', 'option2' ].map((val) => [val]);

document.body.appendChild(autocompletedSelect);