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
          formula: "u_t = [x_t, h_(t-1)]. LSTM has separate c_t memory; GRU uses h_t as memory and output.",
          formulaHtml:
            "u<sub>t</sub>&nbsp;=&nbsp;[x<sub>t</sub>, h<sub>t-1</sub>] &nbsp; | &nbsp; LSTM: separate c<sub>t</sub>&nbsp;memory &nbsp; | &nbsp; GRU: h<sub>t</sub>&nbsp;is memory and output",
          terms: [
            "u_t: current input plus previous hidden state",
            "sigma: soft gate between 0 and 1",
            "odot: element-wise multiplication",
            "c_t: LSTM cell state",
            "h_t: visible recurrent state",
            "f/i/o: forget, input, output gates",
            "r/z: reset and update gates",
          ],
          intro:
            "Read every gate as a learned soft switch. Values near 0 block information; values near 1 let it pass. LSTM uses these switches to manage a separate memory c_t, while GRU uses fewer switches and stores memory directly in h_t.",
          steps: [
            {
              meta: "01 / shared input",
              title: "Build the signal seen by the gates",
              equationHtml:
                "u<sub>t</sub> = [x<sub>t</sub>, h<sub>t-1</sub>]",
              copy:
                "Both cells look at the current input and the previous hidden state. Writing this pair as u_t keeps the formulas short and makes the roles easier to see.",
            },
            {
              meta: "02 / LSTM gates",
              title: "Choose what to keep, write, and expose",
              equationHtml:
                "f<sub>t</sub> = &sigma;(W<sub>f</sub>u<sub>t</sub> + b<sub>f</sub>)<br>i<sub>t</sub> = &sigma;(W<sub>i</sub>u<sub>t</sub> + b<sub>i</sub>)<br>o<sub>t</sub> = &sigma;(W<sub>o</sub>u<sub>t</sub> + b<sub>o</sub>)",
              copy:
                "The forget gate f_t preserves old memory, the input gate i_t allows a new write, and the output gate o_t controls what part of memory becomes visible.",
            },
            {
              meta: "03 / LSTM update",
              title: "Write memory before producing output",
              equationHtml:
                "c&#771;<sub>t</sub> = tanh(W<sub>c</sub>u<sub>t</sub> + b<sub>c</sub>)<br>c<sub>t</sub> = f<sub>t</sub> &odot; c<sub>t-1</sub> + i<sub>t</sub> &odot; c&#771;<sub>t</sub><br>h<sub>t</sub> = o<sub>t</sub> &odot; tanh(c<sub>t</sub>)",
              copy:
                "First the cell proposes new content, then c_t combines preserved memory with the allowed write. The hidden state h_t is only the exposed view of that memory.",
            },
            {
              meta: "04 / GRU gates",
              title: "Use two gates instead of three",
              equationHtml:
                "r<sub>t</sub> = &sigma;(W<sub>r</sub>u<sub>t</sub> + b<sub>r</sub>)<br>z<sub>t</sub> = &sigma;(W<sub>z</sub>u<sub>t</sub> + b<sub>z</sub>)",
              copy:
                "The reset gate r_t decides how much past information helps build the candidate. The update gate z_t decides how strongly the candidate replaces the previous state.",
            },
            {
              meta: "05 / GRU candidate",
              title: "Reset the past only while proposing new content",
              equationHtml:
                "h&#771;<sub>t</sub> = tanh(W<sub>h</sub>[x<sub>t</sub>, r<sub>t</sub> &odot; h<sub>t-1</sub>] + b<sub>h</sub>)",
              copy:
                "The reset gate does not erase h_t directly. It only controls how much of h_(t-1) is used to compute the candidate h~_t.",
            },
            {
              meta: "06 / GRU state",
              title: "Interpolate between old state and candidate",
              equationHtml:
                "h<sub>t</sub> = (1 - z<sub>t</sub>) &odot; h<sub>t-1</sub> + z<sub>t</sub> &odot; h&#771;<sub>t</sub>",
              copy:
                "GRU has no separate c_t and no output gate. The hidden state h_t is both the memory that continues forward and the visible recurrent output.",
            },
          ],
          note:
            "A useful mental model: LSTM separates memory from visibility; GRU merges them. LSTM is more explicit, while GRU is more compact. Both solve the plain RNN problem of overwriting context too aggressively.",
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
