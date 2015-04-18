createStreamsGroup
==================

```javascript
    
    createStreamsGroup({
        a$: (changeA$) => changeA$.map(({ target }) => target.value),
        b$: (changeB$) => changeB$.map(({ target }) => target.value),
        c$: (a$, b$) => Rx.Observable.combineLatest(
            a$,
            b$,
            (a, b) => a + b
        )
    });
    
```