(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "qml-bridge",
      order: 9,
      title: "Quantum ML Bridge",
      year: "Ongoing",
      overview: {
        what: "Quantum Machine Learning connects classical data pipelines with parameterized quantum circuits.",
        consists:
          "Classical features are encoded into a quantum state, trainable gates transform that state, and measurements return values that a classical optimizer can use.",
      },
      panels: {
        architecture: {
          summary: "QML keeps the classical learning loop, but replaces part of the model with a trainable quantum circuit.",
          diagram: {
            type: "qml-bridge",
            stages: [
              {
                label: "Classical data",
                title: "Start with features",
                caption:
                  "The input is still a classical vector x. QML does not remove preprocessing; it changes how part of the model represents and transforms the data.",
              },
              {
                label: "Feature map",
                title: "Encode into a quantum state",
                caption:
                  "A feature map Uφ(x) writes the classical features into amplitudes, phases, or rotations of qubits.",
              },
              {
                label: "Variational circuit",
                title: "Train quantum parameters",
                caption:
                  "Parameterized gates Uθ act like the trainable layers of the model. The parameters θ are updated from a classical loss.",
              },
              {
                label: "Measurement",
                title: "Read classical outputs",
                caption:
                  "Measurements convert the quantum state back into numbers, usually expectation values that can become predictions or features.",
              },
              {
                label: "Optimizer",
                title: "Close the learning loop",
                caption:
                  "A classical optimizer compares predictions with targets, updates θ, and sends new parameters back to the circuit.",
              },
            ],
          },
        },
        math: {
          label: "Hybrid model",
          formula: "z(x,theta)=<psi(x,theta)|M|psi(x,theta)>, L(theta)=loss(z,y)",
          formulaHtml:
            "z(x, &theta;) = &langle;&psi;(x, &theta;)| M |&psi;(x, &theta;)&rangle;, &nbsp; L(&theta;) = loss(z, y)",
          terms: [
            "x: classical input",
            "Uφ(x): feature map",
            "Uθ: trainable circuit",
            "M: measurement observable",
            "θ: trainable parameters",
          ],
          intro:
            "The mathematical bridge is simple: encode data as a quantum state, transform it with trainable gates, measure an output, and optimize the parameters using a classical loss.",
          steps: [
            {
              meta: "01 / encode",
              title: "Turn features into a quantum state",
              equationHtml: "|&psi;(x)&rang; = U<sub>&phi;</sub>(x)|0&rang;",
              copy:
                "The feature map is the quantum analogue of a first representation layer: it decides how classical data enters Hilbert space.",
            },
            {
              meta: "02 / transform",
              title: "Apply trainable gates",
              equationHtml: "|&psi;(x, &theta;)&rang; = U<sub>&theta;</sub>|&psi;(x)&rang;",
              copy:
                "The variational circuit contains parameters θ, similar in role to weights in a classical neural network.",
            },
            {
              meta: "03 / measure",
              title: "Return a classical number",
              equationHtml: "z(x, &theta;) = &lang;&psi;(x, &theta;)|M|&psi;(x, &theta;)&rang;",
              copy:
                "Measurement maps the quantum state back to a scalar, vector, class score, or feature used by classical code.",
            },
            {
              meta: "04 / optimize",
              title: "Train with a classical loss",
              equationHtml: "&theta; &larr; &theta; - &eta;&nabla;<sub>&theta;</sub>L(&theta;)",
              copy:
                "Training remains a classical optimization loop. The quantum circuit is evaluated many times to estimate outputs or gradients.",
            },
          ],
          note:
            "This is why QML can be presented as a bridge, not a replacement: data loading, losses, metrics, and optimization stay classical while the model core may be quantum.",
        },
        demo: {
          label: "Hybrid loop",
          type: "qml-flow",
          title: "Classical loop, quantum model core",
          description: "Click each step to follow the flow from classical input to quantum measurement and back to optimization.",
          states: [
            {
              label: "Data",
              activeStage: 0,
              caption:
                "QML starts from the same supervised-learning ingredients: features, labels, preprocessing, and a loss.",
              graphic: "bridge-data",
              viewNote:
                "The dataset and objective stay classical. The quantum part only changes how the model represents or transforms the input.",
            },
            {
              label: "Encode",
              activeStage: 1,
              caption: "A feature map Uφ(x) writes classical features into a quantum state.",
              graphic: "bridge-encode",
              viewNote:
                "The input x controls gates such as rotations, preparing a state |ψ(x)⟩ that carries the encoded data.",
            },
            {
              label: "Circuit",
              activeStage: 2,
              caption: "The parameterized circuit Uθ is the trainable model core.",
              graphic: "bridge-circuit",
              viewNote:
                "The parameters θ play the role of trainable weights; entangling gates let qubits interact inside the model.",
            },
            {
              label: "Measure",
              activeStage: 3,
              caption: "Measurements estimate observables Mᵢ and return classical numbers zᵢ.",
              graphic: "bridge-measure",
              viewNote:
                "The vector z(x, θ) can be used as logits, probabilities, or features for another classical model.",
            },
            {
              label: "Update",
              activeStage: 4,
              caption: "A classical optimizer updates θ and sends the new parameters back to Uθ.",
              graphic: "bridge-update",
              viewNote:
                "Training remains classical: evaluate the circuit, compute a loss, update θ, and run the circuit again.",
            },
          ],
        },
        controls: {
          label: "Bridge pieces",
          items: ["Feature map", "Variational circuit", "Measurement", "Classical optimizer"],
        },
        metrics: {
          label: "Bridge summary",
          title: "What to remember",
          points: [
            "Classical data enters through feature maps",
            "Trainable gates play the model-core role",
            "Measurements return classical outputs",
            "Optimization remains classical",
          ],
        },
      },
    })
  );
})();
