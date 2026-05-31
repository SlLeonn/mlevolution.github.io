(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "seq2seq",
      order: 6,
      title: "Seq2Seq",
      year: "2014",
      overview: {
        what: "Seq2Seq maps one sequence into another, such as an input sentence into an output sentence.",
        consists: "An encoder compresses x_1...x_T into context, but forcing everything through one vector can create a bottleneck.",
      },
      panels: {
        architecture: {
          summary: "The encoder reads first; the decoder generates after receiving context.",
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
                  "The encoder reuses the same recurrent cell from x_1 to x_T, updating h_t so later states carry more source context.",
              },
              {
                label: "Context",
                caption:
                  "The final encoder state becomes context z, a compact summary that initializes or conditions the decoder.",
              },
              {
                label: "Decoder",
                caption:
                  "The decoder starts from <GO>, uses z, and predicts y_1 to y_S autoregressively, feeding previous outputs into later steps.",
              },
            ],
          },
        },
        math: {
          label: "Encoder to decoder",
          formula: "z = Encoder(x_1...x_T), y_t = Decoder(y_(t-1), z)",
          formulaMath:
            '<math display="block"><mi>z</mi><mo>=</mo><mi>Enc</mi><mo>(</mo><msub><mi>x</mi><mn>1</mn></msub><mo>,</mo><mo>...</mo><mo>,</mo><msub><mi>x</mi><mi>T</mi></msub><mo>)</mo><mo>,</mo><mspace width="0.6em"/><msub><mi>y</mi><mi>t</mi></msub><mo>=</mo><mi>Dec</mi><mo>(</mo><msub><mi>y</mi><mrow><mi>t</mi><mo>-</mo><mn>1</mn></mrow></msub><mo>,</mo><mi>z</mi><mo>)</mo></math>',
          terms: ["z: context vector", "T source steps", "S generated steps"],
          note: "The context bottleneck explains why attention becomes the next natural step.",
        },
        demo: {
          label: "Encoder-decoder flow",
          type: "encoder-decoder",
          title: "Read a sequence, then write a sequence",
          description: "The model turns an input timeline into an output timeline through context.",
          states: [
            {
              label: "Encode",
              activePhase: 0,
              caption:
                "Encoder steps read x_1, x_2, ..., x_T in order. The omitted dots mean repeated middle time steps, not an extra state.",
            },
            {
              label: "Context",
              activePhase: 1,
              caption:
                "Context z transfers the source summary to the decoder. In classic Seq2Seq this fixed vector is also the main bottleneck.",
            },
            {
              label: "Decode",
              activePhase: 2,
              caption:
                "Decoder steps generate y_1, y_2, ..., y_S while using z and the previously generated token as input.",
            },
          ],
        },
        controls: {
          label: "Core pieces",
          items: ["encoder", "context z", "decoder"],
        },
        metrics: {
          label: "Evolution link",
          title: "What to remember",
          points: ["Strength: sequence-to-sequence mapping", "Limitation: fixed context bottleneck", "Next step: attention"],
        },
      },
    })
  );
})();
