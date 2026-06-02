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
          formula: "LSTM: c_t = f_t*c_(t-1) + i_t*c~_t, h_t = o_t*tanh(c_t). GRU: h_t = (1-z_t)*h_(t-1) + z_t*h~_t",
          formulaHtml:
            "LSTM: c<sub>t</sub> = f<sub>t</sub> &odot; c<sub>t-1</sub> + i<sub>t</sub> &odot; c&#771;<sub>t</sub>, h<sub>t</sub> = o<sub>t</sub> &odot; tanh(c<sub>t</sub>) &nbsp; | &nbsp; GRU: h<sub>t</sub> = (1 - z<sub>t</sub>) &odot; h<sub>t-1</sub> + z<sub>t</sub> &odot; h&#771;<sub>t</sub>",
          terms: [
            "sigma: gate between 0 and 1",
            "odot: element-wise product",
            "c_t: LSTM cell state",
            "h_t: hidden state",
            "f_t/i_t/o_t: LSTM gates",
            "r_t/z_t: GRU gates",
          ],
          intro:
            "Both units are recurrent cells, but their internal memory is different. LSTM keeps a separate cell state c_t; GRU folds memory into h_t with fewer gates.",
          steps: [
            {
              meta: "01 / LSTM gates",
              title: "Compute three memory valves",
              equationHtml:
                "f<sub>t</sub>, i<sub>t</sub>, o<sub>t</sub> = &sigma;(W[x<sub>t</sub>, h<sub>t-1</sub>] + b)",
              copy:
                "The forget gate keeps old memory, the input gate writes new memory, and the output gate decides what becomes visible.",
            },
            {
              meta: "02 / LSTM candidate",
              title: "Propose new cell content",
              equationHtml: "c&#771;<sub>t</sub> = tanh(W<sub>c</sub>[x<sub>t</sub>, h<sub>t-1</sub>] + b<sub>c</sub>)",
              copy:
                "The candidate is the new information the cell could write, but it only enters memory if the input gate allows it.",
            },
            {
              meta: "03 / LSTM state",
              title: "Keep, write, then expose",
              equationHtml:
                "c<sub>t</sub> = f<sub>t</sub> &odot; c<sub>t-1</sub> + i<sub>t</sub> &odot; c&#771;<sub>t</sub><br>h<sub>t</sub> = o<sub>t</sub> &odot; tanh(c<sub>t</sub>)",
              copy:
                "The cell state carries long-term memory, while h_t is the part of that memory exposed to the next layer or time step.",
            },
            {
              meta: "04 / GRU gates",
              title: "Compute reset and update gates",
              equationHtml:
                "r<sub>t</sub> = &sigma;(W<sub>r</sub>[x<sub>t</sub>, h<sub>t-1</sub>] + b<sub>r</sub>), &nbsp; z<sub>t</sub> = &sigma;(W<sub>z</sub>[x<sub>t</sub>, h<sub>t-1</sub>] + b<sub>z</sub>)",
              copy:
                "The reset gate controls how much past state builds the candidate; the update gate controls how much new state is written.",
            },
            {
              meta: "05 / GRU candidate",
              title: "Shape the candidate state",
              equationHtml:
                "h&#771;<sub>t</sub> = tanh(W<sub>h</sub>[x<sub>t</sub>, r<sub>t</sub> &odot; h<sub>t-1</sub>] + b<sub>h</sub>)",
              copy:
                "If r_t is small, the candidate ignores much of the past and focuses on the current input.",
            },
            {
              meta: "06 / GRU state",
              title: "Blend old and new memory",
              equationHtml:
                "h<sub>t</sub> = (1 - z<sub>t</sub>) &odot; h<sub>t-1</sub> + z<sub>t</sub> &odot; h&#771;<sub>t</sub>",
              copy:
                "GRU has no separate c_t or output gate. Its hidden state is both the memory and the visible output.",
            },
          ],
          note:
            "The main idea is controlled writing. Plain RNNs overwrite memory at every step; LSTM and GRU learn when to preserve, reset, update, or expose information.",
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
