(function () {
  window.MLEvolution.registerModel(
    window.MLEvolution.createModel({
      id: "transformer",
      order: 8,
      title: "Transformer",
      year: "2017",
      overview: {
        what: "A transformer processes sequences with attention instead of recurrence.",
        consists: "It stacks L attention and feed-forward blocks so every token can interact with every other token.",
      },
      panels: {
        architecture: {
          summary:
            "A transformer block wraps multi-head attention with residual paths, normalization, and position-wise feed-forward layers.",
          diagram: {
            type: "transformer",
            stack: "repeat this block L times; attention is one sublayer inside the block",
            stages: [
              {
                label: "Tokens",
                caption:
                  "Token embeddings are combined with positional information so order is visible without recurrence.",
              },
              {
                label: "Multi-head",
                caption:
                  "Several attention heads run in parallel, letting the block capture different relationships at the same time.",
              },
              {
                label: "Add + Norm",
                caption:
                  "Residual connections preserve the incoming representation, while layer normalization stabilizes deep stacks.",
              },
              {
                label: "FFN",
                caption:
                  "A position-wise feed-forward network transforms each token independently after attention has mixed context.",
              },
              {
                label: "Block output",
                caption:
                  "The block output feeds the next layer, or the final prediction head after the last layer.",
              },
              {
                label: "Residual path",
                caption:
                  "Skip paths let gradients and token information flow around sublayers, which makes deep transformer stacks trainable.",
              },
            ],
          },
        },
        math: {
          label: "Transformer block composition",
          formula:
            "H0=X+P; A_l=MultiHead(LN(H_l)); U_l=H_l+A_l; F_l=FFN(LN(U_l)); H_(l+1)=U_l+F_l",
          formulaHtml:
            "H<sub>0</sub> = X + P &rarr; A<sub>&ell;</sub> = MultiHead(LN(H<sub>&ell;</sub>)) &rarr; U<sub>&ell;</sub> = H<sub>&ell;</sub> + A<sub>&ell;</sub> &rarr; H<sub>&ell;+1</sub> = U<sub>&ell;</sub> + FFN(LN(U<sub>&ell;</sub>))",
          intro:
            "The transformer is the architecture built around attention. Its math is about composing attention with residual updates, normalization, and feed-forward transformations across many layers.",
          steps: [
            {
              meta: "01 / input state",
              title: "Add token and position information",
              equation: "H_0 = X + P",
              equationHtml: "H<sub>0</sub> = X + P",
              copy:
                "X contains token embeddings, while P injects order because the model has no recurrence or convolutional scan.",
            },
            {
              meta: "02 / multi-head attention",
              title: "Run several attention views in parallel",
              equation: "head_i=Attention(HW_i^Q, HW_i^K, HW_i^V)",
              equationHtml:
                "head<sub>i</sub> = Attention(HW<sub>i</sub><sup>Q</sup>, HW<sub>i</sub><sup>K</sup>, HW<sub>i</sub><sup>V</sup>)",
              copy:
                "This reuses the attention mechanism, but splits it into heads so one block can track syntax, coreference, position, or other relations.",
            },
            {
              meta: "03 / concatenate heads",
              title: "Merge the attention views",
              equation: "MHA(H)=Concat(head_1,...,head_h)W_O",
              equationHtml:
                "MHA(H) = Concat(head<sub>1</sub>, ..., head<sub>h</sub>)W<sub>O</sub>",
              copy:
                "The heads are concatenated and projected back into the model dimension.",
            },
            {
              meta: "04 / residual attention update",
              title: "Preserve the previous representation",
              equation: "U_l = H_l + MHA(LN(H_l))",
              equationHtml:
                "U<sub>&ell;</sub> = H<sub>&ell;</sub> + MHA(LN(H<sub>&ell;</sub>))",
              copy:
                "The skip connection keeps the original token state while attention adds contextual information.",
            },
            {
              meta: "05 / feed-forward sublayer",
              title: "Transform each token independently",
              equation: "FFN(u)=W_2 phi(W_1u+b_1)+b_2",
              equationHtml:
                "FFN(u) = W<sub>2</sub>&phi;(W<sub>1</sub>u + b<sub>1</sub>) + b<sub>2</sub>",
              copy:
                "After tokens exchange information through attention, the feed-forward network refines each token channel-wise.",
            },
            {
              meta: "06 / stacked block",
              title: "Repeat the block L times",
              equation: "H_(l+1)=U_l+FFN(LN(U_l))",
              equationHtml:
                "H<sub>&ell;+1</sub> = U<sub>&ell;</sub> + FFN(LN(U<sub>&ell;</sub>))",
              copy:
                "Depth comes from stacking this block. Attention is inside the block; the transformer is the repeated system around it.",
            },
          ],
          terms: ["P: positional encoding", "h: number of heads", "LN: layer normalization", "residual paths", "FFN: position-wise MLP"],
          note:
            "This keeps the transformer explanation separate from the attention explanation: attention computes relevance weights, while the transformer organizes attention into a trainable deep architecture with normalization, skip connections, feed-forward layers, and repeated blocks.",
        },
        demo: {
          label: "Block flow",
          type: "transformer-block",
          title: "Step through one transformer block",
          description:
            "Attention is one sublayer. The full block also uses residual paths, normalization, and a feed-forward update.",
          states: [
            {
              label: "input",
              activeStages: [0],
              primaryStage: 0,
              caption:
                "The block begins with token embeddings plus positional information.",
            },
            {
              label: "attention",
              activeStages: [0, 1, 2],
              primaryStage: 1,
              caption:
                "Multi-head attention mixes information across tokens, then add + norm stabilizes the update.",
            },
            {
              label: "feed-forward",
              activeStages: [2, 3, 4],
              primaryStage: 3,
              caption:
                "The feed-forward network transforms each token after attention has shared context.",
            },
            {
              label: "residuals",
              activeStages: [0, 2, 4, 5, 6],
              primaryStage: 6,
              caption:
                "Residual paths preserve information and gradients while each sublayer contributes an update.",
            },
            {
              label: "output",
              activeStages: [4, 5],
              primaryStage: 5,
              caption:
                "The resulting state feeds the next block or the final prediction head.",
            },
          ],
          initialState: 1,
        },
        controls: {
          label: "Training idea",
          items: ["positions", "heads", "residuals", "layer norm", "feed-forward", "L blocks"],
        },
        metrics: {
          label: "Evolution link",
          title: "Why it scaled",
          points: ["Parallel sequence processing", "Deep residual blocks", "Attention as a reusable sublayer"],
        },
      },
    })
  );
})();
