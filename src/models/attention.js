(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "attention",
      order: 7,
      title: "Attention",
      year: "2014",
      overview: {
        what: "Attention lets a model choose which input positions matter most for the current output.",
        consists: "It compares queries with keys, then builds weighted combinations of values.",
      },
    })
  );
})();
