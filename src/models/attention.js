(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "attention",
      order: 7,
      title: "Attention",
      year: "2014",
      overview: {
        what: "Attention lets a model choose which input positions matter most for the current output.",
        consists: "It compares queries with keys, then builds weighted combinations of values.",
      },
      panels: {
        architecture: {
          summary: "Attention turns tokens into queries, keys, and values, then mixes values using learned relevance weights.",
          diagram: {
            type: "attention",
            tokens: ["x1", "x2", "x3", "x4", "x5"],
            output: "context vector",
            stages: [
              {
                label: "Queries",
                caption: "A query asks what the current token is looking for.",
              },
              {
                label: "Keys",
                caption: "Keys describe what each input token can offer.",
              },
              {
                label: "Values",
                caption: "Values carry the information that will be blended after scoring.",
              },
              {
                label: "Weights",
                caption: "Dot products between Q and K become normalized attention weights.",
              },
              {
                label: "Context",
                caption: "The output is a weighted sum of values, focused on the most relevant positions.",
              },
            ],
          },
        },
        math: {
          label: "Scaled dot-product attention",
          formula: "Attention(Q,K,V)=softmax(QK^T/sqrt(d_k))V",
          formulaHtml:
            "Attention(Q,K,V) = softmax(QK<sup>T</sup> / &radic;d<sub>k</sub>)V",
          intro:
            "Attention is the mechanism that decides which positions should influence the current representation.",
          steps: [
            {
              meta: "01 / projections",
              title: "Create Q, K, and V from tokens",
              equation: "Q=XW_Q, K=XW_K, V=XW_V",
              equationHtml:
                "Q = XW<sub>Q</sub>, &nbsp; K = XW<sub>K</sub>, &nbsp; V = XW<sub>V</sub>",
              copy:
                "Each token representation is projected into three roles: query, key, and value.",
            },
            {
              meta: "02 / compatibility",
              title: "Measure relevance",
              equation: "S=QK^T/sqrt(d_k)",
              equationHtml: "S = QK<sup>T</sup> / &radic;d<sub>k</sub>",
              copy:
                "A query-key dot product is large when two positions are compatible. Scaling keeps scores stable as the key dimension grows.",
            },
            {
              meta: "03 / normalization",
              title: "Convert scores into weights",
              equation: "A=softmax(S)",
              equationHtml: "A = softmax(S)",
              copy:
                "Softmax makes each row sum to 1, so the model distributes attention across the sequence.",
            },
            {
              meta: "04 / weighted sum",
              title: "Blend information from values",
              equation: "O=AV",
              equationHtml: "O = AV",
              copy:
                "The final context vector is a weighted combination of value vectors, not a recurrent memory state.",
            },
          ],
          terms: ["Q: what to look for", "K: what each token offers", "V: information to copy", "d_k: key dimension", "A: attention map"],
          note:
            "Attention is powerful because every position can directly compare itself with every other position. The mechanism is content-based: it learns relevance from the token representations instead of relying only on distance or order.",
        },
        controls: {
          label: "Training idea",
          items: ["queries", "keys", "values", "softmax weights", "context vector"],
        },
        metrics: {
          label: "Evolution link",
          title: "Why it mattered",
          points: ["Direct long-range links", "Interpretable weight maps", "Foundation for transformers"],
        },
      },
    })
  );
})();
