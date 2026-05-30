(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "perceptron",
      order: 1,
      title: "Perceptron",
      year: "1958",
      overview: {
        what: "A perceptron is the simplest trainable neuron: it learns a straight boundary between classes.",
        consists: "It combines n inputs with n weights, adds a bias, and passes the result through a threshold.",
      },
      panels: {
        architecture: {
          summary: "One neuron receives n inputs and produces one decision.",
          diagram: {
            type: "network",
            layers: [
              { label: "n inputs", nodes: ["x1", "...", "xn"] },
              { label: "weighted sum", nodes: ["sum"] },
              { label: "decision", nodes: ["y"] },
            ],
          },
        },
        math: {
          label: "Linear threshold",
          formula: "y = step(sum_i w_i*x_i + b)",
          formulaHtml: "y = step(&sum;<sub>i=1</sub><sup>n</sup> w<sub>i</sub>x<sub>i</sub> + b)",
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
              label: "Hard pattern",
              caption: "If the classes curve around each other, a single linear cut is not enough.",
              path: "M 16 52 L 86 52",
              points: [
                { x: 28, y: 28, className: "a" },
                { x: 48, y: 30, className: "a" },
                { x: 70, y: 34, className: "a" },
                { x: 24, y: 74, className: "b" },
                { x: 52, y: 67, className: "b" },
                { x: 78, y: 72, className: "b" },
              ],
            },
          ],
        },
        controls: {
          label: "Training idea",
          items: ["n weights", "bias", "threshold"],
        },
        metrics: {
          label: "Evolution link",
          title: "Why move forward",
          points: ["Easy to understand", "Only linear boundaries", "Seeds the idea of a neuron"],
        },
      },
    })
  );
})();
