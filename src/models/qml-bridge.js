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
          label: "DRU implementation",
          title: "PyTorch + PennyLane bridge",
          isWide: true,
          snapshot: {
            kicker: "Implementation example",
            title: "Data re-uploading quantum part",
            intro:
              "After the CNN compressor returns four classical features, the DRU circuit re-encodes those values across two quantum blocks, applies trainable entangling layers, and returns expectation values to a classical output head.",
            formulaHtml:
              "CNN(x) &in; R<sup>4</sup> &rarr; AngleEmbedding &rarr; StronglyEntanglingLayers &rarr; [&langle;Z<sub>0</sub>&rangle;, ..., &langle;Z<sub>3</sub>&rangle;]",
            cards: [
              {
                title: "Device and wires",
                equationHtml: "qml.device('lightning.gpu', wires = 4)",
                copy:
                  "The implementation uses a PennyLane GPU simulator with one wire per compressed CNN feature.",
                detailTitle: "Quantum device setup",
                detailCopy:
                  "The number of wires is num_qubits. In your code num_qubits = 4, matching the CNNCompressor output_features value.",
                detailEquations: [
                  {
                    meta: "device",
                    title: "Simulator",
                    equationHtml:
                      "dev = qml.device('lightning.gpu', wires = num_qubits)",
                    copy:
                      "The circuit is evaluated through PennyLane with the Torch interface.",
                  },
                  {
                    meta: "feature size",
                    title: "CNN-to-QNN agreement",
                    equationHtml:
                      "CNNCompressor(..., output_features = num_qubits)",
                    copy:
                      "The classical compressor and quantum circuit share the same feature dimension.",
                  },
                ],
              },
              {
                title: "Re-uploading blocks",
                equationHtml: "num_reupload_blocks = 2",
                copy:
                  "The same four CNN features are injected into the circuit twice.",
                detailTitle: "Data re-uploading pattern",
                detailCopy:
                  "A DRU block alternates data encoding and trainable quantum transformation. Repeating the block gives the circuit repeated access to the same classical vector without cloning a quantum state.",
                detailEquations: [
                  {
                    meta: "block",
                    title: "One block",
                    equationHtml:
                      "AngleEmbedding(inputs) &rarr; StronglyEntanglingLayers(weights[block])",
                    copy:
                      "AngleEmbedding writes the classical features into Y rotations; the entangling layer supplies trainable parameters.",
                  },
                  {
                    meta: "repeat",
                    title: "Two blocks",
                    equationHtml:
                      "for block in range(2): encode(inputs), entangle(weights[block])",
                    copy:
                      "The input is re-uploaded before each trainable block.",
                  },
                ],
              },
              {
                title: "Encoding",
                equationHtml: "qml.AngleEmbedding(inputs, rotation = 'Y')",
                copy:
                  "Each CNN output controls a Y rotation on its corresponding qubit.",
                detailTitle: "Classical values become gate angles",
                detailCopy:
                  "The QNN receives ordinary PyTorch tensors. AngleEmbedding maps those tensor values into rotation angles on the circuit wires.",
                detailEquations: [
                  {
                    meta: "inputs",
                    title: "Circuit input",
                    equationHtml:
                      "inputs = CNN(x) = [r<sub>0</sub>, r<sub>1</sub>, r<sub>2</sub>, r<sub>3</sub>]",
                    copy:
                      "There is one compressed value per qubit.",
                  },
                  {
                    meta: "rotation",
                    title: "Encoding gate",
                    equationHtml:
                      "RY(r<sub>i</sub>) on wire i",
                    copy:
                      "The code uses rotation='Y', so each feature controls a Y-axis angle.",
                  },
                ],
              },
              {
                title: "Trainable quantum layer",
                equationHtml: "weights: (2, 1, 4, 3)",
                copy:
                  "StronglyEntanglingLayers contributes 24 trainable quantum parameters.",
                detailTitle: "Weight shape",
                detailCopy:
                  "The TorchLayer weight shape is num_reupload_blocks x num_layers_per_block x num_qubits x 3. The last dimension represents three rotation parameters per qubit.",
                detailEquations: [
                  {
                    meta: "shape",
                    title: "Parameter tensor",
                    equationHtml:
                      "(2, 1, 4, 3)",
                    copy:
                      "Two re-upload blocks, one entangling layer per block, four qubits, and three rotation angles.",
                  },
                  {
                    meta: "count",
                    title: "Trainable count",
                    equationHtml:
                      "2 x 1 x 4 x 3 = 24",
                    copy:
                      "These parameters are optimized through the PyTorch training loop.",
                  },
                ],
              },
              {
                title: "Measurements",
                equationHtml: "[expval(PauliZ(i))]<sub>i=0..3</sub>",
                copy:
                  "The circuit returns four expectation values, one per qubit.",
                detailTitle: "Quantum-to-classical output",
                detailCopy:
                  "Measurement turns the final quantum state back into a classical vector. That vector can enter another PyTorch layer.",
                detailEquations: [
                  {
                    meta: "readout",
                    title: "Expectation vector",
                    equationHtml:
                      "z = [&langle;Z<sub>0</sub>&rangle;, &langle;Z<sub>1</sub>&rangle;, &langle;Z<sub>2</sub>&rangle;, &langle;Z<sub>3</sub>&rangle;]",
                    copy:
                      "Each value is differentiable through PennyLane's Torch interface.",
                  },
                  {
                    meta: "head",
                    title: "Classical output layer",
                    equationHtml:
                      "Linear(num_qubits, num_classes)",
                    copy:
                      "The final PyTorch layer maps quantum measurements to class logits.",
                  },
                ],
              },
              {
                title: "Hybrid training",
                equationHtml: "CrossEntropyLoss + Adam(lr = 0.001)",
                copy:
                  "The whole model trains as one PyTorch module: CNN, QNN TorchLayer, and output head.",
                detailTitle: "End-to-end model",
                detailCopy:
                  "HybridModel.forward applies cnn(x), qnn(x), then output_layer(x). The optimizer sees parameters from the classical CNN, quantum TorchLayer, and final linear layer.",
                detailEquations: [
                  {
                    meta: "forward",
                    title: "Model chain",
                    equationHtml:
                      "x &rarr; CNNCompressor &rarr; qml.qnn.TorchLayer &rarr; Linear",
                    copy:
                      "The quantum layer sits between two classical PyTorch components.",
                  },
                  {
                    meta: "optimizer",
                    title: "Training setup",
                    equationHtml:
                      "optimizer = Adam(hybrid_model.parameters(), lr = 0.001)",
                    copy:
                      "All differentiable parameters are updated by the same optimizer.",
                  },
                ],
              },
            ],
          },
          points: [
            "4 CNN features feed 4 qubits",
            "2 data re-uploading blocks",
            "AngleEmbedding uses Y rotations",
            "StronglyEntanglingLayers has 24 trainable parameters",
            "PauliZ measurements feed a classical output layer",
          ],
        },
      },
    })
  );
})();
