(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "rnn",
      order: 4,
      title: "RNN",
      year: "1990",
      overview: {
        what: "A recurrent neural network reads ordered data while carrying a memory state through time.",
        consists: "The same cell processes each step t, but long sequences can wash out old information through repeated updates.",
      },
      panels: {
        architecture: {
          summary: "One recurrent cell is reused across T ordered time steps.",
          diagram: {
            type: "sequence",
            cell: "shared RNN cell",
            caption: "same recurrent cell, same weights, repeated through time",
            output: "h_t",
            steps: [
              {
                button: "x_1",
                input: "x_1",
                hidden: "h_1",
                output: "o_1",
                description:
                  "The first input starts the recurrence. The cell combines x_1 with an initial memory h_0 and writes the first hidden state h_1.",
              },
              {
                button: "x_2",
                input: "x_2",
                hidden: "h_2",
                output: "o_2",
                description:
                  "The next step reuses the same weights on x_2 while reading h_1, so the model can use context from what it has already seen.",
              },
              {
                button: "...",
                omitted: true,
                description:
                  "The dots represent any number of middle time steps. The cell is not copied with new parameters; the same recurrent rule is applied again and again.",
              },
              {
                button: "x_T",
                input: "x_T",
                hidden: "h_T",
                output: "o_T",
                description:
                  "At the final step, h_T is the compact summary of the sequence. The output o_T is produced from that final state.",
              },
            ],
          },
        },
        math: {
          label: "Shared recurrence",
          formula: "h_t = phi(W_x x_t + W_h h_(t-1) + b)",
          formulaMath:
            '<math display="block"><msub><mi>h</mi><mi>t</mi></msub><mo>=</mo><mi>&phi;</mi><mo>(</mo><msub><mi>W</mi><mi>x</mi></msub><msub><mi>x</mi><mi>t</mi></msub><mo>+</mo><msub><mi>W</mi><mi>h</mi></msub><msub><mi>h</mi><mrow><mi>t</mi><mo>-</mo><mn>1</mn></mrow></msub><mo>+</mo><mi>b</mi><mo>)</mo></math>',
          terms: ["x_t: input at step t", "h_t: memory state", "shared weights across T steps"],
          note: "RNNs introduced the idea that a network can reuse itself over a sequence.",
        },
        demo: {
          label: "Sequence memory",
          type: "sequence-state",
          title: "State update through time",
          description: "The view follows the hidden state, the compact memory passed from one step to the next.",
          states: [
            {
              label: "First update",
              activeStep: 0,
              caption:
                "The first update turns x_1 and h_0 into h_1. This gives the sequence a memory instead of treating x_1 as an isolated input.",
            },
            {
              label: "Repeated rule",
              activeStep: 2,
              caption:
                "Middle steps repeat the same rule with shared weights. This is efficient, but repeated compression can make early information fade.",
            },
            {
              label: "Final readout",
              activeStep: 3,
              caption:
                "At x_T, the model reads h_T to produce an output. Plain RNNs can struggle when the useful signal is many steps in the past.",
            },
          ],
        },
        controls: {
          label: "Core pieces",
          items: ["shared cell", "hidden state", "T steps"],
        },
        metrics: {
          label: "Evolution link",
          title: "What to remember",
          points: ["Strength: handles sequences", "Limitation: fragile long-term memory", "Next step: gated recurrent units"],
        },
      },
    })
  );
})();
