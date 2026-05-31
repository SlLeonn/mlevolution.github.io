(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "lstm-gru",
      order: 5,
      title: "LSTM / GRU",
      year: "1997 / 2014",
      overview: {
        what: "LSTM and GRU are recurrent units designed to remember useful information for longer.",
        consists: "They add learned gates for memory control, but they still process sequences step by step, which limits parallelism.",
      },
      panels: {
        architecture: {
          summary: "Gates regulate the memory flow instead of letting every update overwrite everything.",
          diagram: {
            type: "gates",
            memory: "controlled memory stream",
            input: "x_t + h_(t-1)",
            caption: "abstract gated unit: LSTM keeps c_t separate, GRU merges memory into h_t",
            gates: [
              {
                label: "Keep",
                short: "k_t",
                description:
                  "In an LSTM, the forget gate f_t keeps or removes old cell memory. In a GRU, the complementary part of the update gate, 1 - z_t, keeps previous hidden state.",
              },
              {
                label: "Update",
                short: "u_t",
                description:
                  "LSTM writes with the input gate i_t and candidate c~_t. GRU writes with the update gate z_t and candidate h~_t, while reset r_t shapes the candidate.",
              },
              {
                label: "Output",
                short: "o_t",
                description:
                  "LSTM uses an output gate o_t to expose part of c_t as h_t. GRU has no separate output gate; h_t is the updated hidden state.",
              },
            ],
          },
        },
        math: {
          label: "Gated memory",
          formula: "m_t = keep_t*m_(t-1) + update_t*candidate_t",
          formulaMath:
            '<math display="block"><msub><mi>m</mi><mi>t</mi></msub><mo>=</mo><msub><mi>k</mi><mi>t</mi></msub><mo>&odot;</mo><msub><mi>m</mi><mrow><mi>t</mi><mo>-</mo><mn>1</mn></mrow></msub><mo>+</mo><msub><mi>u</mi><mi>t</mi></msub><mo>&odot;</mo><msub><mover><mi>m</mi><mo>~</mo></mover><mi>t</mi></msub></math>',
          terms: ["k_t: keep gate", "u_t: update gate", "m_t: memory state"],
          note: "The exact LSTM and GRU equations differ, but both use gates to control memory.",
        },
        demo: {
          label: "Gate flow",
          type: "gate-flow",
          title: "Memory is controlled by gates",
          description: "Each gate acts like a learned valve over the memory, the new evidence, or the visible hidden state.",
          states: [
            {
              label: "Keep",
              activeGate: 0,
              caption:
                "Keep means preserving useful past state: LSTM does it with f_t over c_(t-1); GRU does it through 1 - z_t over h_(t-1).",
            },
            {
              label: "Update",
              activeGate: 1,
              caption:
                "Update means writing new evidence: LSTM combines i_t with c~_t; GRU combines z_t with h~_t and uses r_t to build that candidate.",
            },
            {
              label: "Output",
              activeGate: 2,
              caption:
                "Output is different in each cell: LSTM has o_t and tanh(c_t); GRU simply exposes the updated hidden state h_t.",
            },
          ],
        },
        controls: {
          label: "Core pieces",
          items: ["memory", "gates", "long context"],
        },
        metrics: {
          label: "Evolution link",
          title: "What to remember",
          points: ["Strength: controlled memory", "Limitation: sequential computation", "Next step: encoder-decoder systems"],
        },
      },
    })
  );
})();
