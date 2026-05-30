(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "cnn",
      order: 3,
      title: "CNN",
      year: "1998",
      overview: {
        what: "A convolutional neural network learns filters that scan structured data such as images.",
        consists: "It uses n filters, local receptive fields, nonlinearities, and often pooling before a final predictor.",
      },
    })
  );
})();
