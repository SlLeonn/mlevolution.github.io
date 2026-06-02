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
                  "A feature map U_phi(x) writes the classical features into amplitudes, phases, or rotations of qubits.",
              },
              {
                label: "Variational circuit",
                title: "Train quantum parameters",
                caption:
                  "Parameterized gates U_theta act like the trainable layers of the model. The parameters theta are updated from a classical loss.",
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
                  "A classical optimizer compares predictions with targets, updates theta, and sends new parameters back to the circuit.",
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
            "U_phi(x): feature map",
            "U_theta: trainable circuit",
            "M: measurement observable",
            "theta: trainable parameters",
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
                "The variational circuit contains parameters theta, similar in role to weights in a classical neural network.",
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
              caption: "Classical ML still starts with features x, labels y, preprocessing, and a task-specific loss.",
              graphicPlaceholder: "Classical data graphic slot",
              viewNote: "Reserved for a graphic showing features and labels before quantum encoding.",
            },
            {
              label: "Encode",
              activeStage: 1,
              caption: "The feature map U_phi(x) prepares a quantum state whose structure depends on the input data.",
              graphicPlaceholder: "Feature map graphic slot",
              viewNote: "Reserved for a graphic showing how x controls qubit rotations or state preparation.",
            },
            {
              label: "Circuit",
              activeStage: 2,
              caption: "The parameterized circuit U_theta is the trainable part of the quantum model.",
              graphicPlaceholder: "Variational circuit graphic slot",
              viewNote: "Reserved for a graphic showing trainable gates acting like the model core.",
            },
            {
              label: "Measure",
              activeStage: 3,
              caption: "Measurement produces classical values, so the result can be handled like any model output.",
              graphicPlaceholder: "Measurement graphic slot",
              viewNote: "Reserved for a graphic showing expectation values becoming classical outputs.",
            },
            {
              label: "Update",
              activeStage: 4,
              caption: "A classical optimizer updates theta and repeats the loop until the loss improves.",
              graphicPlaceholder: "Optimizer feedback graphic slot",
              viewNote: "Reserved for a graphic showing the optimizer sending new parameters back to the circuit.",
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
