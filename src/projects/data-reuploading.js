(function () {
  window.MLEvolution.registerProject({
    id: "data-reuploading",
    label: "DataReuploading",
    title: "DataReuploading",
    year: "QML project",
    kicker: "Variational quantum model",
    summary:
      "DataReuploading alternates classical data encoding with trainable quantum transformations, so the same input can shape the model across several layers.",
    relation:
      "Classical analogy: like an MLP, it repeatedly transforms features with trainable parameters, but the hidden representation is a quantum state and the readable outputs are measurements.",
    architecture: {
      summary:
        "DRU is a strategy for feeding classical information into a quantum circuit more than once, instead of relying on a single data encoding at the beginning.",
      relation:
        "In a dense neural network, one activation can fan out to many neurons. In a quantum circuit, an unknown encoded state cannot be freely copied, so DRU reuses the original classical input x between trainable blocks.",
      flow: [
        {
          label: "Input features",
          notationHtml: "x &in; R<sup>n</sup>",
          detail:
            "The input is still ordinary classical data. It can be stored, normalized, and reused before it is encoded into a circuit.",
        },
        {
          label: "Encode, not clone",
          notationHtml: "U<sub>enc</sub>(x)",
          detail:
            "Features control gates that prepare a quantum state. After encoding, an unknown quantum state cannot simply be copied into many branches.",
        },
        {
          label: "Train",
          notationHtml: "U<sub>train</sub>(&theta;<sub>l</sub>)",
          detail:
            "Trainable gates reshape the encoded state. They act like weights, but they operate through reversible quantum transformations.",
        },
        {
          label: "Reupload",
          notationHtml: "repeat L times",
          detail:
            "The classical input x is injected again from outside the circuit, giving the model repeated access without cloning the quantum state.",
        },
        {
          label: "Interact",
          notationHtml: "n<sub>q</sub> qubits",
          detail:
            "Entangling gates let qubits share information through interactions, replacing the dense fan-out used by many classical layers.",
        },
        {
          label: "Measure",
          notationHtml: "z(x) &in; R<sup>m</sup>",
          detail:
            "Measurements convert the quantum state back into classical numbers that can be used as logits or learned features.",
        },
        {
          label: "Predict",
          notationHtml: "c classes",
          detail:
            "A classical head maps the measured vector to class scores, and a standard optimizer updates the circuit parameters.",
        },
      ],
      cards: [
        {
          title: "What DRU is solving",
          copy:
            "Classical dense layers can copy activations into many neurons. Quantum circuits cannot clone arbitrary unknown states, so DRU reuses the original classical input instead.",
        },
        {
          title: "No-cloning intuition",
          copy:
            "The no-cloning theorem does not stop us from copying classical data. It stops us from duplicating an arbitrary quantum state after the data has been encoded.",
        },
        {
          title: "Dense-layer analogy",
          copy:
            "Instead of sending one activation to many neurons, DRU alternates data-controlled gates, trainable gates, and entanglement across L layers.",
        },
        {
          title: "How hybrid models use it",
          copy:
            "Measurements produce z(x), a classical feature vector that can be used alone or concatenated with classical features before a learner such as XGBoost.",
        },
      ],
    },
    panels: {
      math: {
        label: "General DRU math",
        formula: "U_l(x,theta_l)=U_train(theta_l)U_enc(x), z(x)=measure(U(x,theta))",
        formulaHtml:
          "U<sub>l</sub>(x, &theta;<sub>l</sub>) = U<sub>train</sub>(&theta;<sub>l</sub>)U<sub>enc</sub>(x), &nbsp; z(x) = measure(U(x, &theta;))",
        terms: [
          "x: classical features",
          "U_enc: data encoding",
          "U_train: trainable gates",
          "L: reuploading layers",
          "z(x): measured features",
          "g: classical head",
        ],
        intro:
          "The general DRU idea is compact: encode the same classical input several times, alternate it with trainable transformations, then measure a classical feature vector.",
        steps: [
          {
            meta: "01 / block",
            title: "One reuploading block",
            equationHtml:
              "U<sub>l</sub>(x, &theta;<sub>l</sub>) = U<sub>train</sub>(&theta;<sub>l</sub>)U<sub>enc</sub>(x)",
            copy:
              "Each layer uses the data through U_enc(x), then applies trainable gates. This is the basic data-plus-weights pattern.",
          },
          {
            meta: "02 / stack",
            title: "Repeat the idea L times",
            equationHtml:
              "U(x, &theta;) = U<sub>L</sub>(x, &theta;<sub>L</sub>) ... U<sub>1</sub>(x, &theta;<sub>1</sub>)",
            copy:
              "Reuploading means the original classical input is injected repeatedly, giving the circuit depth without cloning the encoded quantum state.",
          },
          {
            meta: "03 / state",
            title: "Transform the quantum representation",
            equationHtml:
              "|&psi;(x; &theta;)&rang; = U(x, &theta;)|0&rang;<sup>&otimes;n<sub>q</sub></sup>",
            copy:
              "The circuit creates a representation of x inside a quantum state across n_q qubits.",
          },
          {
            meta: "04 / measure",
            title: "Return classical features",
            equationHtml:
              "z(x) = [&langle;O<sub>1</sub>&rangle;, &langle;O<sub>2</sub>&rangle;, ..., &langle;O<sub>m</sub>&rangle;]",
            copy:
              "Measurement turns the quantum state into ordinary numbers. From classical ML, z(x) is simply a learned feature vector.",
          },
          {
            meta: "05 / predict",
            title: "Use a classical head",
            equationHtml:
              "y_hat = g(z(x))",
            copy:
              "The final prediction can come from a linear head, a sigmoid classifier, or a larger classical model that consumes the measured features.",
          },
        ],
        note:
          "This keeps the mathematics general: a specific project chooses how to select inputs, scale angles, entangle qubits, measure observables, and train the classical head.",
      },
      demo: {
        label: "DRU classifier",
        type: "qml-flow",
        title: "Direct DRU classifier flow",
        description:
          "Click each step to follow how classical samples become gate angles, DRU measurements, and a final prediction.",
        states: [
          {
            label: "Classical input",
            activeStage: 0,
            graphic: "feature-matrix",
            viewNote:
              "A DRU pipeline starts with ordinary supervised pairs: each classical sample x_n is matched with a target y_n before any quantum encoding.",
          },
          {
            label: "Select and scale",
            activeStage: 1,
            graphic: "select-scale",
            viewNote:
              "The selector S chooses q inputs for the circuit, and the scaler A maps those values into gate angles.",
          },
          {
            label: "DRU map",
            activeStage: 2,
            graphic: "dru-map",
            viewNote:
              "The DRU map φθ repeatedly uploads the same angles a between trainable gates, then returns measured features z(x).",
          },
          {
            label: "Measurement",
            activeStage: 3,
            graphic: "dru-measurement",
            viewNote:
              "The DRU state is measured through observables M_i, producing a classical vector z(x, θ) for the final classifier.",
          },
          {
            label: "Output head",
            activeStage: 4,
            graphic: "output-head",
            viewNote:
              "Measured DRU features are ordinary numbers; a small output head combines them into logits, probabilities, or class scores.",
          },
          {
            label: "Training loop",
            activeStage: 5,
            graphic: "training-loop",
            viewNote:
              "Training is classical: predictions are compared with targets, a loss is computed, and the optimizer updates θ, a, and b.",
          },
        ],
      },
      controls: {
        label: "Connection pieces",
        items: [
          "feature selector S",
          "angular scaler A",
          "DRU map phi_theta",
          "measurement vector z",
          "output head",
          "training loop",
        ],
      },
      metrics: {
        heading: "Projects",
        label: "Applications",
        kicker: "DRU applications",
        title: "Projects",
        intro:
          "The general DRU architecture can support different implementations. Select an application to see the project-specific details without mixing them into the core explanation.",
        isWide: true,
        showApplicationLabels: false,
        applications: ["tail-653", "cnn-dru"],
        points: [
          "Project 1: Tail 653 and QDRU-XGBoost",
          "Project 2: CNN compressor plus DRU",
          "Each application is editable from its own file",
        ],
      },
    },
  });
})();
