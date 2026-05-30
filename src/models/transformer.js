(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "transformer",
      order: 8,
      title: "Transformer",
      year: "2017",
      overview: {
        what: "A transformer processes sequences with attention instead of recurrence.",
        consists: "It stacks L attention and feed-forward blocks so every token can interact with every other token.",
      },
    })
  );
})();
