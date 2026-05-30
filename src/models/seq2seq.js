(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "seq2seq",
      order: 6,
      title: "Seq2Seq",
      year: "2014",
      overview: {
        what: "Seq2Seq maps one sequence into another, such as an input sentence into an output sentence.",
        consists: "An encoder compresses x_1...x_T into context, then a decoder generates y_1...y_S.",
      },
      panels: {
        architecture: {
          summary: "The encoder reads first; the decoder generates after receiving context.",
          diagram: {
            type: "seq2seq",
            source: ["x1", "x2", "...", "xT"],
            target: ["y1", "y2", "...", "yS"],
            bridge: "context z",
          },
        },
        math: {
          label: "Encoder to decoder",
          formula: "z = Encoder(x_1...x_T), y_t = Decoder(y_(t-1), z)",
          formulaHtml:
            "z = Enc(x<sub>1</sub>, ..., x<sub>T</sub>), &nbsp; y<sub>t</sub> = Dec(y<sub>t-1</sub>, z)",
          terms: ["z: context vector", "T source steps", "S generated steps"],
          note: "The context bottleneck explains why attention becomes the next natural step.",
        },
        demo: {
          label: "Encoder-decoder flow",
          type: "encoder-decoder",
          title: "Read a sequence, then write a sequence",
          description: "The model turns an input timeline into an output timeline through context.",
          states: [
            { label: "Encode", activePhase: 0, caption: "The encoder gathers meaning from all source steps." },
            { label: "Context", activePhase: 1, caption: "The fixed vector z carries the compressed source." },
            { label: "Decode", activePhase: 2, caption: "The decoder unfolds output steps one by one." },
          ],
        },
        controls: {
          label: "Training idea",
          items: ["encoder", "context z", "decoder"],
        },
        metrics: {
          label: "Evolution link",
          title: "Why attention follows",
          points: ["Transforms sequences", "Useful for translation", "Context can bottleneck"],
        },
      },
    })
  );
})();
