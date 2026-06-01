(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "seq2seq",
      order: 6,
      title: "Seq2Seq",
      year: "2014",
      overview: {
        what: "Seq2Seq maps an input sequence into an output sequence, even when their lengths are different.",
        consists:
          "A recurrent encoder reads x_1...x_T into a context vector, then a recurrent decoder generates y_1...y_S one step at a time.",
      },
      panels: {
        architecture: {
          summary: "The encoder builds source states h_t, context z bridges the model, and the decoder writes target states s_t.",
          diagram: {
            type: "seq2seq",
            source: ["x_1", "x_2", "...", "x_T"],
            target: ["y_1", "y_2", "...", "y_S"],
            sourceSteps: [
              { input: "x_1", state: "h_1" },
              { input: "x_2", state: "h_2" },
              { omitted: true, label: "..." },
              { input: "x_T", state: "h_T" },
            ],
            targetSteps: [
              { previous: "<GO>", state: "s_1", output: "y_1" },
              { previous: "y_1", state: "s_2", output: "y_2" },
              { omitted: true, label: "..." },
              { previous: "y_(S-1)", state: "s_S", output: "y_S" },
            ],
            bridge: "z",
            phases: [
              {
                label: "Encoder",
                caption:
                  "The encoder applies the same recurrent cell to every source token. Each h_t summarizes the prefix seen so far, and h_T becomes the strongest summary of the full input.",
              },
              {
                label: "Context",
                caption:
                  "Context z is the bridge from encoder to decoder. In the classic model it is usually h_T, so all source information must fit through one vector.",
              },
              {
                label: "Decoder",
                caption:
                  "The decoder is another recurrent system. It starts with <GO>, reads z, predicts y_t, then feeds the previous target token into the next step.",
              },
            ],
          },
        },
        math: {
          label: "Encoder to decoder",
          formula: "h_t = phi(W_x x_t + W_h h_(t-1)), z = h_T, s_t = phi(W_y e(y_(t-1)) + W_s s_(t-1) + W_z z)",
          formulaMath:
            '<math display="block"><msub><mi>h</mi><mi>t</mi></msub><mo>=</mo><mi>&phi;</mi><mo>(</mo><msub><mi>W</mi><mi>x</mi></msub><msub><mi>x</mi><mi>t</mi></msub><mo>+</mo><msub><mi>W</mi><mi>h</mi></msub><msub><mi>h</mi><mrow><mi>t</mi><mo>-</mo><mn>1</mn></mrow></msub><mo>)</mo><mo>,</mo><mspace width="0.6em"/><mi>z</mi><mo>=</mo><msub><mi>h</mi><mi>T</mi></msub><mo>,</mo><mspace width="0.6em"/><mi>p</mi><mo>(</mo><msub><mi>y</mi><mi>t</mi></msub><mo>)</mo><mo>=</mo><mi>softmax</mi><mo>(</mo><msub><mi>W</mi><mi>o</mi></msub><msub><mi>s</mi><mi>t</mi></msub><mo>)</mo></math>',
          terms: [
            "x_t: source token",
            "h_t: encoder state",
            "z: context vector",
            "s_t: decoder state",
            "e(y): previous-token embedding",
            "p(y_t): next-token probabilities",
          ],
          intro:
            "Inside a classic Seq2Seq model there are two recurrent updates: one reads the source into h_t, and the other writes the target from s_t. The context vector z connects both halves.",
          steps: [
            {
              meta: "01 / encode source",
              title: "Update source memory",
              equationHtml:
                "h<sub>t</sub> = &phi;(W<sub>x</sub>x<sub>t</sub> + W<sub>h</sub>h<sub>t-1</sub> + b<sub>h</sub>)",
              copy:
                "The encoder combines the current source token with the previous encoder state. Reusing the same weights lets it read any source length T.",
            },
            {
              meta: "02 / bridge",
              title: "Pass one fixed summary",
              equationHtml: "z = h<sub>T</sub>",
              copy:
                "The final encoder state becomes the context vector. This is the classic bottleneck: the decoder receives the whole source through z.",
            },
            {
              meta: "03 / decode target",
              title: "Update target memory",
              equationHtml:
                "s<sub>t</sub> = &phi;(W<sub>y</sub>e(y<sub>t-1</sub>) + W<sub>s</sub>s<sub>t-1</sub> + W<sub>z</sub>z + b<sub>s</sub>)",
              copy:
                "The decoder reads the previous output token, its own previous state, and the source context to decide what should come next.",
            },
            {
              meta: "04 / predict token",
              title: "Turn state into probabilities",
              equationHtml:
                "p(y<sub>t</sub> | y<sub>&lt;t</sub>, x) = softmax(W<sub>o</sub>s<sub>t</sub> + b<sub>o</sub>)",
              copy:
                "The model does not output a word directly; it produces a probability distribution and selects the most likely next token.",
            },
          ],
          note:
            "The main weakness is the fixed context bottleneck: long or detailed inputs can be hard to compress into one vector. Attention solves this by letting the decoder look back at all encoder states.",
        },
        demo: {
          label: "Encoder-decoder flow",
          type: "encoder-decoder",
          title: "Read a sequence, then write a sequence",
          description: "The interaction follows the three conceptual stages: read source, pass context, generate target.",
          states: [
            {
              label: "Encode",
              activePhase: 0,
              caption:
                "Encoding is the reading phase: the model moves from x_1 to x_T, updating h_t at each source position with shared recurrent weights.",
            },
            {
              label: "Context",
              activePhase: 1,
              caption:
                "The context vector z transfers the source summary. It is a bridge, not another token, and in the classic version it can become a bottleneck.",
            },
            {
              label: "Decode",
              activePhase: 2,
              caption:
                "Decoding is autoregressive: each prediction y_t depends on z and on the target history already produced.",
            },
          ],
        },
        controls: {
          label: "Core pieces",
          items: ["source encoder", "context z", "decoder state", "autoregressive output"],
        },
        metrics: {
          label: "Evolution link",
          title: "What to remember",
          points: ["Strength: variable-length sequence mapping", "Limitation: fixed context bottleneck", "Next step: attention"],
        },
      },
    })
  );
})();
