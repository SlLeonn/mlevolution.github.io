(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "qml-bridge",
      order: 9,
      title: "Quantum ML Bridge",
      year: "Ongoing",
      overview: {
        what: "The QML bridge connects classical model ideas with parameterized quantum circuits.",
        consists: "It maps classical inputs into quantum states, applies trainable circuit layers, and reads measurements as outputs.",
      },
    })
  );
})();
