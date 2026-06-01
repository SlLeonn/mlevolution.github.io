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
              {
                label: "n inputs",
                nodes: ["x1", "x2", "...", "xn"],
                description:
                  "The input layer represents one example as n numerical features. The perceptron does not learn here; it only receives the coordinates it will try to separate.",
              },
              {
                label: "weighted sum",
                nodes: ["sum"],
                description:
                  "The neuron multiplies each feature by a learned weight, adds all contributions, and shifts the score with a bias. This produces one linear score z.",
              },
              {
                label: "decision",
                nodes: ["y"],
                description:
                  "The threshold turns the score into a class decision. Because there is only one score and one threshold, the boundary is always a line or hyperplane.",
              },
            ],
          },
        },
        math: {
          label: "Linear threshold",
          formula: "y = step(sum_i w_i*x_i + b)",
          formulaMath:
            '<math display="block"><mi>y</mi><mo>=</mo><mi>step</mi><mo>(</mo><munderover><mo>&sum;</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><msub><mi>w</mi><mi>i</mi></msub><msub><mi>x</mi><mi>i</mi></msub><mo>+</mo><mi>b</mi><mo>)</mo></math>',
          terms: ["n inputs", "w_i: one weight per input", "b: bias", "step: yes/no activation"],
          intro: "A perceptron is simple because every step stays linear until the final threshold.",
          steps: [
            {
              meta: "01 / input vector",
              title: "Represent the example numerically",
              equationHtml: "x = [x<sub>1</sub>, x<sub>2</sub>, ..., x<sub>n</sub>]",
              copy: "Each coordinate stores one measured feature of the object, signal, or data point.",
            },
            {
              meta: "02 / linear score",
              title: "Add weighted evidence",
              equationHtml: "z = w<sup>T</sup>x + b",
              copy: "Positive and negative weights decide which features push the score toward each class.",
            },
            {
              meta: "03 / threshold",
              title: "Convert score into class",
              equationHtml: "y = step(z)",
              copy: "The activation answers one binary question: is the score above the decision threshold?",
            },
            {
              meta: "04 / geometry",
              title: "One boundary only",
              equationHtml: "w<sup>T</sup>x + b = 0",
              copy: "This equation defines a line in 2D or a hyperplane in n dimensions, so XOR remains impossible.",
            },
          ],
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
