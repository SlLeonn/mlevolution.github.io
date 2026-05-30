(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "mlp",
      order: 2,
      title: "MLP",
      year: "1986",
      overview: {
        what: "A multilayer perceptron stacks many neurons so the model can learn nonlinear patterns.",
        consists: "It uses L layers, each with several neurons, and trains them together with backpropagation.",
      },
      panels: {
        architecture: {
          summary: "Many layers transform raw inputs into increasingly useful features.",
          diagram: {
            type: "network",
            layers: [
              { label: "n inputs", nodes: ["x1", "...", "xn"] },
              { label: "hidden layer l", nodes: ["h1", "...", "hm"] },
              { label: "hidden layer L", nodes: ["z1", "...", "zk"] },
              { label: "c outputs", nodes: ["y1", "...", "yc"] },
            ],
          },
        },
        math: {
          label: "Layer composition",
          formula: "a^(l) = phi(W^(l) a^(l-1) + b^(l))",
          formulaHtml:
            "a<sup>(&ell;)</sup> = &phi;(W<sup>(&ell;)</sup>a<sup>(&ell;-1)</sup> + b<sup>(&ell;)</sup>)",
          terms: ["L layers", "m neurons per hidden layer", "phi: nonlinear activation", "backprop learns all weights"],
          note: "The key leap is nonlinearity: layers can bend and combine boundaries.",
        },
        demo: {
          label: "Nonlinear boundary",
          type: "decision-boundary",
          title: "Many neurons shape a flexible boundary",
          description: "Hidden neurons combine simple cuts into a curved decision region.",
          states: [
            {
              label: "Few neurons",
              caption: "With too little capacity, the model behaves almost like a simple cut.",
              path: "M 18 70 C 36 48, 58 46, 82 30",
              points: [
                { x: 32, y: 30, className: "a" },
                { x: 46, y: 24, className: "a" },
                { x: 58, y: 36, className: "a" },
                { x: 28, y: 76, className: "b" },
                { x: 64, y: 70, className: "b" },
                { x: 78, y: 54, className: "b" },
              ],
            },
            {
              label: "More neurons",
              caption: "With enough hidden units, the MLP can wrap a smooth region around a pattern.",
              path:
                "M 28 22 C 45 10, 69 19, 75 39 C 84 66, 58 84, 36 73 C 15 62, 10 36, 28 22 Z",
              regionPath:
                "M 28 22 C 45 10, 69 19, 75 39 C 84 66, 58 84, 36 73 C 15 62, 10 36, 28 22 Z",
              points: [
                { x: 38, y: 34, className: "a" },
                { x: 52, y: 28, className: "a" },
                { x: 61, y: 48, className: "a" },
                { x: 42, y: 58, className: "a" },
                { x: 16, y: 78, className: "b" },
                { x: 84, y: 24, className: "b" },
                { x: 80, y: 78, className: "b" },
              ],
            },
          ],
        },
        controls: {
          label: "Training idea",
          items: ["L layers", "m neurons", "activation", "backprop"],
        },
        metrics: {
          label: "Evolution link",
          title: "What changed",
          points: ["Learns features", "Handles nonlinear data", "Needs careful training"],
        },
      },
    })
  );
})();
