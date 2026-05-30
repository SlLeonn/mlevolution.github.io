# Model files

Each model has its own file in this folder. To edit a model later, open its file and override only the fields that need custom content.

Example:

```js
(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "perceptron",
      order: 1,
      title: "Perceptron",
      panels: {
        math: {
          placeholder: "New math text",
        },
      },
    })
  );
})();
```

Keep `id` values stable because the interface uses them to activate timeline items.

## Editable panels

- `architecture`: short summary and diagram data.
- `math`: one formula, term chips, and one note.
- `demo`: interactive visual states.
- `controls`: short training concept chips.
- `metrics`: short evolution notes.

Prefer short text and data objects over raw HTML. The renderer in `src/app.js` turns these fields into the visible interface.
