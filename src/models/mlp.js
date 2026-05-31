(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "mlp",
      order: 2,
      title: "MLP",
      year: "1986",
      overview: {
        what: "A multilayer perceptron stacks many neurons so the model can learn nonlinear patterns.",
        consists: "It can solve patterns such as XOR, but deeper MLPs can be hard to train and ignore structure like time or locality.",
      },
      panels: {
        architecture: {
          summary: "Many layers transform raw inputs into increasingly useful features.",
          diagram: {
            type: "network",
            layers: [
              {
                label: "n inputs",
                nodes: ["x1", "x2", "...", "xn"],
                description:
                  "The input layer only presents the measured features. It does not learn yet; it gives the network the coordinates of the problem.",
              },
              {
                label: "hidden layer l",
                nodes: ["h1", "h2", "...", "hm"],
                description:
                  "An early hidden layer learns simple intermediate features by mixing the inputs with weights and applying a nonlinear activation.",
              },
              {
                label: "hidden layer L",
                nodes: ["z1", "z2", "...", "zk"],
                description:
                  "Deeper hidden layers recombine earlier features into more abstract patterns, which is what lets the MLP bend decision boundaries.",
              },
              {
                label: "c outputs",
                nodes: ["y1", "...", "yc"],
                description:
                  "The output layer converts the learned representation into c scores or probabilities, one for each class or target.",
              },
            ],
          },
        },
        math: {
          label: "Layer composition",
          formula: "a^(l) = phi(W^(l) a^(l-1) + b^(l))",
          formulaMath:
            '<math display="block"><msup><mi>a</mi><mrow><mo>(</mo><mi>&ell;</mi><mo>)</mo></mrow></msup><mo>=</mo><mi>&phi;</mi><mo>(</mo><msup><mi>W</mi><mrow><mo>(</mo><mi>&ell;</mi><mo>)</mo></mrow></msup><msup><mi>a</mi><mrow><mo>(</mo><mi>&ell;</mi><mo>-</mo><mn>1</mn><mo>)</mo></mrow></msup><mo>+</mo><msup><mi>b</mi><mrow><mo>(</mo><mi>&ell;</mi><mo>)</mo></mrow></msup><mo>)</mo></math>',
          terms: ["L layers", "m neurons per hidden layer", "phi: nonlinear activation", "backprop learns all weights"],
          note: "The key leap is nonlinearity: layers can bend and combine boundaries.",
        },
        demo: {
          label: "Nonlinear boundary",
          type: "decision-boundary",
          title: "Many neurons shape a flexible boundary",
          description: "Hidden neurons combine simple cuts into a curved decision region.",
          initialState: 1,
          states: [
            {
              label: "Perceptron view",
              caption: "A linear model still fails on XOR because opposite corners share the same class.",
              path: "M 12 18 L 88 82",
              points: [
                { x: 24, y: 24, className: "a" },
                { x: 76, y: 76, className: "a" },
                { x: 24, y: 76, className: "b" },
                { x: 76, y: 24, className: "b" },
              ],
            },
            {
              label: "MLP view",
              caption: "Hidden layers combine several simple cuts, creating two separated regions for XOR.",
              paths: [
                "M 7 50 C 24 35, 39 35, 50 50 C 61 65, 76 65, 93 50",
                "M 50 7 C 35 24, 35 39, 50 50 C 65 61, 65 76, 50 93",
              ],
              regionPaths: [
                {
                  className: "region-a",
                  d: "M 0 0 H 100 V 50 C 76 65, 61 65, 50 50 C 39 35, 24 35, 0 50 Z",
                },
                {
                  className: "region-a",
                  d: "M 0 100 H 100 V 50 C 76 65, 61 65, 50 50 C 39 35, 24 35, 0 50 Z",
                },
                {
                  className: "region-b",
                  d: "M 0 0 H 50 C 35 24, 35 39, 50 50 C 65 61, 65 76, 50 100 H 0 Z",
                },
                {
                  className: "region-b",
                  d: "M 100 0 H 50 C 35 24, 35 39, 50 50 C 65 61, 65 76, 50 100 H 100 Z",
                },
              ],
              points: [
                { x: 24, y: 24, className: "a" },
                { x: 76, y: 76, className: "a" },
                { x: 24, y: 76, className: "b" },
                { x: 76, y: 24, className: "b" },
              ],
            },
          ],
        },
        controls: {
          label: "Core pieces",
          items: ["L layers", "m neurons", "activation", "backprop"],
        },
        metrics: {
          label: "Evolution link",
          title: "What to remember",
          points: ["Strength: nonlinear decision regions", "Limitation: no memory or spatial bias", "Next step: specialized architectures"],
        },
      },
    })
  );
})();
