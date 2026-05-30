(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "rnn",
      order: 4,
      title: "RNN",
      year: "1990",
      overview: {
        what: "A recurrent neural network reads ordered data while carrying a memory state through time.",
        consists: "The same cell processes each step t, mixing the new input with the previous hidden state.",
      },
      panels: {
        architecture: {
          summary: "One shared cell unfolds across T time steps.",
          diagram: {
            type: "sequence",
            tokens: ["x1", "x2", "...", "xT"],
            cell: "shared RNN cell",
            output: "h_t",
          },
        },
        math: {
          label: "Shared recurrence",
          formula: "h_t = phi(W_x x_t + W_h h_(t-1) + b)",
          formulaHtml:
            "h<sub>t</sub> = &phi;(W<sub>x</sub>x<sub>t</sub> + W<sub>h</sub>h<sub>t-1</sub> + b)",
          terms: ["x_t: input at step t", "h_t: memory state", "shared weights across T steps"],
          note: "RNNs introduced the idea that a network can reuse itself over a sequence.",
        },
        demo: {
          label: "Sequence memory",
          type: "sequence-state",
          title: "Information flows through time",
          description: "Each step updates the state, so later decisions can use earlier context.",
          states: [
            { label: "early t", activeStep: 0, caption: "The state begins with the first visible signal." },
            { label: "middle t", activeStep: 2, caption: "The hidden state carries compressed context forward." },
            { label: "late T", activeStep: 3, caption: "Long chains can blur old information, motivating gates." },
          ],
        },
        controls: {
          label: "Training idea",
          items: ["shared cell", "hidden state", "T steps"],
        },
        metrics: {
          label: "Evolution link",
          title: "Why gates appeared",
          points: ["Works with sequences", "Reuses parameters", "Struggles with long memory"],
        },
      },
    })
  );
})();
