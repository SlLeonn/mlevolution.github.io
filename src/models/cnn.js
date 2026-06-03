(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "cnn",
      order: 3,
      title: "CNN",
      year: "1998",
      overview: {
        what: "A convolutional neural network learns small filters that slide across images and detect reusable visual patterns.",
        consists:
          "It combines local receptive fields, shared weights, nonlinear activations, pooling, and a final predictor.",
      },
      panels: {
        architecture: {
          summary: "CNNs connect each filter to local image patches, share that filter across space, then classify pooled maps.",
          diagram: {
            type: "cnn",
            input: "image tensor X",
            convolution: "convolutional feature maps",
            pooling: "pooled maps",
            output: "dense classifier + softmax",
            phases: [
              {
                label: "Local patch",
                caption:
                  "The filter only sees a small receptive field, not every pixel at once. This is the key difference from a fully connected layer.",
              },
              {
                label: "Shared filters",
                caption:
                  "The same kernel slides over the whole image, creating feature maps with far fewer parameters than full connectivity.",
              },
              {
                label: "Pooling",
                caption:
                  "Pooling summarizes nearby activations, reducing spatial size while keeping strong visual evidence.",
              },
              {
                label: "Classifier",
                caption:
                  "Only after convolution and pooling do the extracted features feed a dense classifier for the final prediction.",
              },
            ],
          },
        },
        math: {
          label: "Convolutional feature extraction",
          formula:
            "Input -> Convolution -> ReLU -> Pooling -> Dense -> Softmax -> Loss -> Update",
          formulaHtml:
            "X &rarr; Z = X * K + b &rarr; A = ReLU(Z) &rarr; P = pool(A) &rarr; y&#770; = softmax(V vec(P) + d)",
          intro:
            "A CNN is not only one equation. It is a sequence of tensor operations that preserve image structure while learning which local patterns matter.",
          steps: [
            {
              meta: "01 / image tensor",
              title: "Represent the image numerically",
              equation: "X in R^(H x W x C)",
              equationHtml: "X &isin; R<sup>H x W x C</sup>",
              copy:
                "An image is a grid of numbers: height H, width W, and C channels. C is 1 for grayscale and usually 3 for RGB.",
            },
            {
              meta: "02 / convolution",
              title: "Slide a learned filter over local patches",
              equation:
                "z_(i,j,k)=<K_k, patch_(i,j)(X)>+b_k",
              equationHtml:
                "z<sub>i,j,k</sub> = &lang;K<sub>k</sub>, patch<sub>i,j</sub>(X)&rang; + b<sub>k</sub>",
              copy:
                "Filter K_k is compared with the local image patch at position (i, j). The inner product means multiply matching entries across height, width, and channels, then sum them. Stride moves the patch location, padding controls border handling, and the same K_k is reused everywhere.",
            },
            {
              meta: "03 / spatial size",
              title: "Stride and padding control the feature map",
              equation: "H_out = floor((H - F + 2P) / S) + 1",
              equationHtml:
                "H<sub>out</sub> = floor((H - F + 2P) / S) + 1",
              copy:
                "Stride S decides how far the filter jumps. Padding P adds border pixels so important edge information is not immediately lost.",
            },
            {
              meta: "04 / activation",
              title: "Keep nonlinear visual evidence",
              equation: "a_(i,j,k)=ReLU(z_(i,j,k))=max(0,z_(i,j,k))",
              equationHtml:
                "a<sub>i,j,k</sub> = ReLU(z<sub>i,j,k</sub>) = max(0, z<sub>i,j,k</sub>)",
              copy:
                "ReLU removes negative responses and keeps strong positive evidence. This lets stacked layers build edges into shapes and shapes into object parts.",
            },
            {
              meta: "05 / pooling",
              title: "Summarize the strongest local response",
              equation: "p_(r,s,k)=max_(i,j in R_(r,s)) a_(i,j,k)",
              equationHtml:
                "p<sub>r,s,k</sub> = max<sub>(i,j)&isin;R<sub>r,s</sub></sub> a<sub>i,j,k</sub>",
              copy:
                "Pooling reduces computation while preserving the most important local signal. It also makes the model less sensitive to small shifts.",
            },
            {
              meta: "06 / prediction",
              title: "Classify and learn from error",
              equation: "y_hat=softmax(V vec(P)+d), L=-sum_i y_i log(y_hat_i)",
              equationHtml:
                "y&#770; = softmax(V vec(P) + d), &nbsp; L = -&sum;<sub>i</sub> y<sub>i</sub>log(y&#770;<sub>i</sub>)",
              copy:
                "Flattened feature maps feed a dense classifier. Cross-entropy measures prediction error, and gradient descent updates filters with W <- W - eta grad_W L.",
            },
          ],
          terms: [
            "X: image tensor",
            "F: filter size",
            "S: stride",
            "P: padding",
            "K: learned kernel",
            "k filters -> k feature maps",
            "shared weights reduce parameters",
            "gradient descent specializes filters",
          ],
          note:
            "The important idea is locality plus reuse: nearby pixels are related, so a small kernel can describe a useful pattern; the same kernel is shared across every location, so CNNs need far fewer parameters than dense networks on images. During training, random filters become edge detectors, texture detectors, part detectors, and finally class evidence.",
        },
        demo: {
          label: "Local pattern detector",
          type: "decision-boundary",
          title: "A filter responds wherever its pattern appears",
          description:
            "The same learned detector can fire on different image regions because convolution shares one filter across space.",
          states: [
            {
              label: "early edges",
              caption: "Early filters usually learn simple local contrasts such as edges, corners, and color changes.",
              path: "M 16 78 C 34 42, 58 38, 86 18",
              points: [
                { x: 22, y: 66, className: "a" },
                { x: 34, y: 50, className: "a" },
                { x: 48, y: 43, className: "a" },
                { x: 60, y: 38, className: "a" },
                { x: 24, y: 24, className: "b" },
                { x: 70, y: 74, className: "b" },
                { x: 82, y: 52, className: "b" },
              ],
            },
            {
              label: "deeper parts",
              caption:
                "Deeper layers combine earlier maps, so small edges become motifs, object parts, and finally class evidence.",
              path:
                "M 20 30 C 32 10, 68 12, 80 34 C 92 60, 70 84, 42 78 C 18 72, 8 48, 20 30 Z",
              regionPath:
                "M 20 30 C 32 10, 68 12, 80 34 C 92 60, 70 84, 42 78 C 18 72, 8 48, 20 30 Z",
              points: [
                { x: 36, y: 34, className: "a" },
                { x: 55, y: 29, className: "a" },
                { x: 66, y: 48, className: "a" },
                { x: 43, y: 62, className: "a" },
                { x: 18, y: 78, className: "b" },
                { x: 86, y: 22, className: "b" },
                { x: 82, y: 80, className: "b" },
              ],
            },
          ],
        },
        controls: {
          label: "Training idea",
          items: ["filter size", "number of filters", "stride", "pooling", "shared weights"],
        },
        metrics: {
          label: "Evolution link",
          title: "Why CNNs mattered",
          points: ["Uses image structure", "Far fewer weights than dense layers", "Learns translation-aware features"],
        },
      },
    })
  );
})();
