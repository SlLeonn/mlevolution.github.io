(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "perceptron",
      order: 1,
      title: "Perceptron",
      year: "1958",
      overview: {
        what: "A perceptron is the simplest trainable neuron: it learns one straight boundary between classes.",
        consists: "Because its structure is only a weighted sum plus a threshold, it can solve only linearly separable problems.",
      },
      panels: {
        architecture: {
          summary: "One neuron receives n inputs and produces one decision.",
          diagram: {
            type: "network",
            layers: [
              { label: "n inputs", nodes: ["x1", "x2", "...", "xn"] },
              { label: "weighted sum", nodes: ["sum"] },
              { label: "decision", nodes: ["y"] },
            ],
          },
        },
        math: {
          label: "Linear threshold",
          formula: "y = step(sum_i w_i*x_i + b)",
          formulaMath:
            '<math display="block"><mi>y</mi><mo>=</mo><mi>step</mi><mo>(</mo><munderover><mo>&sum;</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><msub><mi>w</mi><mi>i</mi></msub><msub><mi>x</mi><mi>i</mi></msub><mo>+</mo><mi>b</mi><mo>)</mo></math>',
          terms: ["n inputs", "w_i: one weight per input", "b: bias", "step: yes/no activation"],
          note: "It is powerful enough for linearly separable data, but it cannot bend the boundary.",
        },
        demo: {
          label: "Linear boundary",
          type: "decision-boundary",
          title: "A single cut through the input space",
          description: "Move between two views: the perceptron always stays linear.",
          states: [
            {
              label: "Clear split",
              caption: "When one straight boundary is enough, the perceptron is a clean solution.",
              path: "M 12 80 L 88 20",
              points: [
                { x: 20, y: 30, className: "a" },
                { x: 30, y: 38, className: "a" },
                { x: 42, y: 24, className: "a" },
                { x: 58, y: 72, className: "b" },
                { x: 70, y: 60, className: "b" },
                { x: 82, y: 78, className: "b" },
              ],
            },
            {
              label: "XOR",
              caption: "XOR places equal classes on opposite corners, so no single line can separate them.",
              path: "M 12 18 L 88 82",
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
          items: ["n weights", "bias", "threshold"],
        },
        metrics: {
          label: "Evolution link",
          title: "What to remember",
          points: ["Strength: simple and interpretable", "Limitation: cannot solve XOR", "Next step: stack neurons into layers"],
        },
      },
    })
  );
})();
