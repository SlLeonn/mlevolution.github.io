# ML Evolution

A static GitHub Pages skeleton for an interactive Machine Learning and Quantum Machine Learning walkthrough.

## Project structure

- `index.html`: page shell and layout landmarks.
- `styles.css`: visual system, responsive layout, and component styling.
- `src/core/model-factory.js`: shared helpers for registering models and projects.
- `src/models/`: one editable file per model in the timeline.
- `src/projects/qml-projects.js`: editable QML project card registry.
- `src/app.js`: renders the timeline, workspace state, and QML cards.

## Editing a model

Open the matching file inside `src/models/` and update its fields. Keep `id` values stable because the interface uses them to activate timeline items.
