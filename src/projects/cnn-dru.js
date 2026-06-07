(function () {
  window.MLEvolution.registerDruApplication({
    id: "cnn-dru",
    label: "Project 2",
    title: "CNN Compressor + DataReuploading",
    year: "QML project",
    kicker: "Project 2",
    summary:
      "This project combines a classical CNN compressor with a DataReuploading quantum circuit. The CNN prepares four classical features, the quantum circuit reuploads them through trainable blocks, and a classical head reads the measured outputs.",
    relation:
      "Classical connection: the CNN is a learned feature extractor, the QNN is a trainable representation block, and the final prediction is still trained with a classical supervised loss.",
    architecture: {
      summary:
        "Project 2 is a hybrid chain: image-like classical input, CNN compression, angle encoding, repeated DRU blocks, Pauli-Z measurement, and a classical output layer.",
      relation:
        "The quantum layer does not replace the whole ML pipeline. It sits between a classical compressor and a classical prediction head.",
      flow: [
        {
          label: "Classical input",
          notationHtml: "x &in; R<sup>57 x 9 x 2</sup>",
          detail:
            "The input is a two-channel image-like tensor. Its local structure motivates a convolutional compressor before the quantum circuit.",
        },
        {
          label: "CNN compressor",
          notationHtml: "CNNCompressor(x) &in; R<sup>4</sup>",
          detail:
            "A small Conv2d path extracts local evidence and compresses it into four classical values.",
        },
        {
          label: "Angle encoding",
          notationHtml: "AngleEmbedding(r)",
          detail:
            "The four compressed values remain classical until they control Y-rotation gates on the quantum wires.",
        },
        {
          label: "DRU blocks",
          notationHtml: "num_reupload_blocks = 2",
          detail:
            "The same compressed vector is injected before each trainable StronglyEntanglingLayers block.",
        },
        {
          label: "Measurement",
          notationHtml: "[expval(PauliZ(i))]<sub>i=0..3</sub>",
          detail:
            "The circuit returns four expectation values, one per qubit, as ordinary numeric features.",
        },
        {
          label: "Classical head",
          notationHtml: "Linear(num_qubits, num_classes)",
          detail:
            "A PyTorch linear layer maps measured quantum features to class logits.",
        },
      ],
      cards: [
        {
          title: "Classical compressor",
          copy:
            "The CNN is not the final classifier. It prepares a compact vector whose length matches the number of qubits.",
        },
        {
          title: "Quantum feature block",
          copy:
            "The DRU circuit reuploads the same compressed vector between trainable quantum transformations.",
        },
        {
          title: "Measurement boundary",
          copy:
            "After Pauli-Z measurements, the output is classical again and can feed a normal PyTorch layer.",
        },
      ],
    },
    panels: {
      math: {
        label: "Project math",
        formula:
          "x -> CNNCompressor(x)=r, r -> AngleEmbedding -> StronglyEntanglingLayers -> z -> logits",
        formulaHtml:
          "x &rarr; r = CNNCompressor(x) &in; R<sup>4</sup> &rarr; U<sub>DRU</sub>(r, &theta;) &rarr; z &rarr; logits",
        terms: [
          "x: image-like classical tensor",
          "r: compressed CNN feature vector",
          "num_qubits = 4",
          "AngleEmbedding: quantum feature map",
          "StronglyEntanglingLayers: trainable circuit block",
          "z: Pauli-Z expectation vector",
        ],
        intro:
          "The project can be read as one differentiable hybrid model: a CNN maps the input to four values, a DRU circuit transforms those values, and a classical head maps measurements to logits.",
        steps: [
          {
            meta: "01 / compression",
            title: "Classical feature compression",
            equationHtml:
              "f<sub>CNN</sub>: R<sup>57 x 9 x 2</sup> &rarr; R<sup>4</sup>",
            copy:
              "The compressor reduces the structured input to four values, matching the four quantum wires.",
          },
          {
            meta: "02 / encoding",
            title: "Angle embedding",
            equationHtml:
              "r<sub>i</sub> &rarr; RY(r<sub>i</sub>) on wire i",
            copy:
              "Each compressed feature controls one Y-axis rotation.",
          },
          {
            meta: "03 / reuploading",
            title: "Repeated quantum blocks",
            equationHtml:
              "for block in range(2): AngleEmbedding(r), StronglyEntanglingLayers(weights[block])",
            copy:
              "The same classical vector is injected before each trainable quantum block.",
          },
          {
            meta: "04 / readout",
            title: "Measured feature vector",
            equationHtml:
              "z = [&langle;Z<sub>0</sub>&rangle;, &langle;Z<sub>1</sub>&rangle;, &langle;Z<sub>2</sub>&rangle;, &langle;Z<sub>3</sub>&rangle;]",
            copy:
              "The quantum state is converted back into a vector of classical expectation values.",
          },
          {
            meta: "05 / prediction",
            title: "Classical output layer",
            equationHtml:
              "logits = Linear(num_qubits, num_classes)(z)",
            copy:
              "The last layer turns the measured vector into class scores.",
          },
        ],
        note:
          "The notation intentionally follows the implementation: CNNCompressor, AngleEmbedding, StronglyEntanglingLayers, PauliZ measurements, TorchLayer, and a PyTorch optimizer.",
      },
      metrics: {
        label: "Implementation details",
        title: "PyTorch + PennyLane bridge",
        isWide: true,
        snapshot: {
          kicker: "Project 2 implementation",
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
                "The number of wires is num_qubits. In the implementation, num_qubits = 4, matching the CNNCompressor output_features value.",
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
    sections: ["Compressor", "Encoding", "DRU blocks", "Measurement", "Training"],
    points: [
      "CNNCompressor prepares four classical features",
      "AngleEmbedding maps those features to rotations",
      "StronglyEntanglingLayers supplies trainable quantum parameters",
      "Pauli-Z measurements return classical values",
      "The full model trains through PyTorch and PennyLane",
    ],
  });
})();
