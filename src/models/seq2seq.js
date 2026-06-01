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
          formula: "z = Encoder(x_1...x_T), y_t = Decoder(y_(t-1), z)",
          formulaMath:
            '<math display="block"><mi>z</mi><mo>=</mo><mi>Enc</mi><mo>(</mo><msub><mi>x</mi><mn>1</mn></msub><mo>,</mo><mo>...</mo><mo>,</mo><msub><mi>x</mi><mi>T</mi></msub><mo>)</mo><mo>,</mo><mspace width="0.6em"/><msub><mi>y</mi><mi>t</mi></msub><mo>=</mo><mi>Dec</mi><mo>(</mo><msub><mi>y</mi><mrow><mi>t</mi><mo>-</mo><mn>1</mn></mrow></msub><mo>,</mo><mi>z</mi><mo>)</mo></math>',
          terms: ["h_t: encoder state", "z: context vector", "s_t: decoder state", "T source steps", "S target steps"],
          intro:
            "Seq2Seq separates a problem into reading and writing. The encoder first turns the source sequence into memory; the decoder then turns that memory into a new sequence.",
          steps: [
            {
              meta: "01 / encode source",
              title: "Read the input sequence",
              equationHtml: "h<sub>t</sub> = EncCell(x<sub>t</sub>, h<sub>t-1</sub>)",
              copy:
                "The same encoder cell is reused across source positions, so h_t stores what the model knows after reading up to x_t.",
            },
            {
              meta: "02 / bridge",
              title: "Compress into context",
              equationHtml: "z = h<sub>T</sub>",
              copy:
                "Classic Seq2Seq passes the final encoder state to the decoder as a fixed-size summary of the whole input.",
            },
            {
              meta: "03 / decode target",
              title: "Generate one step at a time",
              equationHtml: "s<sub>t</sub> = DecCell(y<sub>t-1</sub>, s<sub>t-1</sub>, z)",
              copy:
                "The decoder state depends on the previous target token, the previous decoder state, and the source context.",
            },
            {
              meta: "04 / predict token",
              title: "Choose the next output",
              equationHtml: "p(y<sub>t</sub>) = softmax(W<sub>o</sub>s<sub>t</sub> + b<sub>o</sub>)",
              copy:
                "A softmax turns the decoder state into probabilities over possible output tokens.",
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
