(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "lstm-gru",
      order: 5,
      title: "LSTM / GRU",
      year: "1997 / 2014",
      overview: {
        what: "LSTM and GRU are recurrent units designed to remember useful information for longer.",
        consists: "They add learned gates that decide what to keep, what to update, and what to expose.",
      },
      panels: {
        architecture: {
          summary: "Gates regulate the memory flow instead of letting every update overwrite everything.",
          diagram: {
            type: "gates",
            memory: "memory stream",
            gates: ["keep", "update", "output"],
          },
        },
        math: {
          label: "Gated memory",
          formula: "m_t = keep_t*m_(t-1) + update_t*candidate_t",
          formulaHtml:
            "m<sub>t</sub> = k<sub>t</sub> &odot; m<sub>t-1</sub> + u<sub>t</sub> &odot; m&#771;<sub>t</sub>",
          terms: ["k_t: keep gate", "u_t: update gate", "m_t: memory state"],
          note: "The exact LSTM and GRU equations differ, but both use gates to control memory.",
        },
        demo: {
          label: "Gate flow",
          type: "gate-flow",
          title: "Memory is filtered, not blindly overwritten",
          description: "Select a gate to see how information is routed through the recurrent unit.",
          states: [
            { label: "Keep", activeGate: 0, caption: "Keep useful context from earlier time steps." },
            { label: "Update", activeGate: 1, caption: "Write new evidence only when it helps." },
            { label: "Output", activeGate: 2, caption: "Expose the part of memory needed now." },
          ],
        },
        controls: {
          label: "Training idea",
          items: ["memory", "gates", "long context"],
        },
        metrics: {
          label: "Evolution link",
          title: "What improved",
          points: ["Better long-term memory", "More stable gradients", "Foundation for seq2seq"],
        },
      },
    })
  );
})();
