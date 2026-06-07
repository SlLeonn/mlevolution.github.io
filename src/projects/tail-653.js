(function () {
  window.MLEvolution.registerDruApplication({
    id: "tail-653",
    label: "Project 1",
    title: "Tail 653 and QDRU-XGBoost",
    year: "QML project",
    kicker: "Project 1",
    summary:
      "Tail 653 instantiates the general DRU pipeline as a supervised flight-state problem and evaluates whether DRU measurements add useful representation columns to a classical model.",
    relation:
      "The DRU circuit is treated as a trainable feature map. Its measured outputs can be used directly by a linear head or concatenated with classical features before a classical learner such as XGBoost.",
    snapshot: {
      kicker: "Specific application",
      title: "Tail 653 and QDRU-XGBoost",
      intro:
        "Tail 653 instantiates the general DRU pipeline as a supervised flight-state problem and evaluates whether DRU measurements add useful representation columns to a classical model.",
      formulaHtml:
        "P(y = 1 | x) = &sigma;(&Sigma;<sub>m</sub> f<sub>m</sub>([x; &phi;<sub>&theta;*</sub>(A(S(x)))]))",
      cards: [
        {
          title: "Task",
          equationHtml: "y &in; {stable, vertical_maneuver}",
          copy:
            "Each flight window is classified as stable or vertical maneuver using supervised binary learning.",
          detailTitle: "Supervised binary task",
          detailCopy:
            "The project starts as a standard binary classification problem. DRU changes the representation block, not the learning objective.",
          detailEquations: [
            {
              meta: "dataset",
              title: "Samples and labels",
              equationHtml:
                "D = {(x<sub>n</sub>, y<sub>n</sub>)}<sub>n=1</sub><sup>N</sup>, &nbsp; x<sub>n</sub> &in; R<sup>p</sup>, &nbsp; y<sub>n</sub> &in; {0,1}",
              copy:
                "Each row is one flight window with p predictors and one binary target.",
            },
            {
              meta: "logit",
              title: "Model output",
              equationHtml:
                "h<sub>n</sub> = f<sub>&Theta;</sub>(x<sub>n</sub>), &nbsp; p<sub>n</sub> = &sigma;(h<sub>n</sub>)",
              copy:
                "The model produces a logit h, then sigmoid converts it into a probability for the positive class.",
            },
            {
              meta: "decision",
              title: "Thresholded prediction",
              equationHtml:
                "y_hat<sub>n</sub> = 1[p<sub>n</sub> &ge; &tau;]",
              copy:
                "The threshold tau is chosen after training, usually on validation data.",
            },
          ],
        },
        {
          title: "Classical inputs",
          equationHtml: "x = statistics(BLAC, FPAC, CTAC)",
          copy:
            "The model uses statistics from predictive flight signals. Labeling signals are not used as predictors.",
          detailTitle: "Classical feature construction",
          detailCopy:
            "Before QML appears, the project builds a classical feature table from flight-signal windows.",
          detailEquations: [
            {
              meta: "feature table",
              title: "Primary input matrix",
              equationHtml:
                "X<sub>stats</sub> &in; R<sup>N &times; p</sup>",
              copy:
                "N is the number of windows and p is the number of classical predictors.",
            },
            {
              meta: "signals",
              title: "Predictor construction",
              equationHtml:
                "x<sub>n</sub> = statistics(BLAC, FPAC, CTAC)",
              copy:
                "The predictors summarize the channels used as model inputs.",
            },
            {
              meta: "target",
              title: "Flight-state probability",
              equationHtml:
                "P(vertical_maneuver | x<sub>n</sub>) = &sigma;(f<sub>&Theta;</sub>(x<sub>n</sub>))",
              copy:
                "The supervised task is still interpreted as a probability over the positive class.",
            },
          ],
        },
        {
          title: "Leakage control",
          equationHtml: "y = labeling_rule(IVV, ALT)",
          copy:
            "Labels come from vertical-motion information, but IVV and altitude-derived signals are excluded from X.",
          detailTitle: "Leakage-aware setup",
          detailCopy:
            "The label can be derived from vertical-motion signals, but those signals should not become predictors.",
          detailEquations: [
            {
              meta: "label rule",
              title: "Target construction",
              equationHtml:
                "y<sub>n</sub> = labeling_rule(IVV, ALT)",
              copy:
                "The label is constructed from signals that describe vertical behavior.",
            },
            {
              meta: "input rule",
              title: "Predictor separation",
              equationHtml:
                "{IVV, ALT} &cap; inputs(X) = &empty;",
              copy:
                "The same signals used to define the label are excluded from the model input table.",
            },
            {
              meta: "split rule",
              title: "Reduce correlated-window leakage",
              equationHtml:
                "files<sub>train</sub> &cap; files<sub>val</sub> &cap; files<sub>test</sub> = &empty;",
              copy:
                "Splitting by source file helps avoid near-duplicate windows crossing train, validation, and test.",
            },
          ],
        },
        {
          title: "Circuit view",
          equationHtml: "r = S(x), &nbsp; x<sup>q</sup> = A(r)",
          copy:
            "Only q selected and scaled features enter the circuit, keeping the DRU input compact and multichannel.",
          detailTitle: "DRU circuit view",
          detailCopy:
            "The circuit receives a selected classical view, scales it into angles, reuploads it across layers, entangles qubits, and measures observables.",
          graphic: "dru-circuit",
          detailEquations: [
            {
              meta: "selection",
              title: "Select q circuit inputs",
              equationHtml:
                "S: R<sup>p</sup> &rarr; R<sup>q</sup>, &nbsp; r<sub>n</sub> = S(x<sub>n</sub>)",
              copy:
                "S chooses a compact multichannel view for the quantum circuit.",
            },
            {
              meta: "scaling",
              title: "Map features to gate angles",
              equationHtml:
                "A: R<sup>q</sup> &rarr; [-&pi;, &pi;]<sup>q</sup>, &nbsp; x<sub>n</sub><sup>q</sup> = A(r<sub>n</sub>)",
              copy:
                "The angular scaler should be fitted on train and reused on validation and test.",
            },
            {
              meta: "local block",
              title: "Rot-only local transformation",
              equationHtml:
                "Rot(&alpha;<sub>l,i</sub>x<sub>i</sub> + &beta;<sub>l,i</sub>) Rot(w<sub>l,i</sub>)",
              copy:
                "Data-controlled rotations and trainable rotations alternate at each layer and qubit.",
            },
            {
              meta: "entanglement",
              title: "Ring interaction",
              equationHtml:
                "U<sub>ent</sub> = &prod;<sub>i=0</sub><sup>q-1</sup> CNOT<sub>i,(i+1) mod q</sub>",
              copy:
                "The ring lets neighboring qubits interact, including the last qubit returning to the first.",
            },
          ],
        },
        {
          title: "DRU features",
          equationHtml: "z = &phi;<sub>&theta;</sub>(x<sup>q</sup>)",
          copy:
            "Measurements become classical columns, such as local observables and qubit-correlation observables.",
          detailTitle: "Measured DRU representation",
          detailCopy:
            "Once the circuit is evaluated, the quantum state is no longer the object passed to the classifier. The classifier receives measured numbers.",
          detailEquations: [
            {
              meta: "feature map",
              title: "DRU as nonlinear representation",
              equationHtml:
                "&phi;<sub>&theta;</sub>: R<sup>q</sup> &rarr; R<sup>d</sup>",
              copy:
                "From classical ML, the circuit is a trainable feature map.",
            },
            {
              meta: "observables",
              title: "Local and correlation measurements",
              equationHtml:
                "z = [&langle;Z<sub>i</sub>&rangle;, &langle;Z<sub>i</sub>Z<sub>i+1</sub>&rangle;]<sub>i=0</sub><sup>q-1</sup>",
              copy:
                "A common choice is to measure each qubit and ring-neighbor correlations.",
            },
            {
              meta: "dimension",
              title: "Feature dimension",
              equationHtml:
                "d = 2q",
              copy:
                "With local Z and ring ZZ measurements, q qubits produce 2q measured features.",
            },
          ],
        },
        {
          title: "Hybrid model",
          equationHtml: "u = [x; z]",
          copy:
            "QDRU-XGBoost freezes or reuses the DRU representation and trains a classical tree ensemble on the augmented table.",
          detailTitle: "QDRU-XGBoost hybrid",
          detailCopy:
            "The quantum component produces extra features. XGBoost itself remains a classical learner over an augmented input table.",
          detailEquations: [
            {
              meta: "direct DRU",
              title: "Direct classifier",
              equationHtml:
                "P(y = 1 | x) = &sigma;(a<sup>T</sup>&phi;<sub>&theta;</sub>(A(S(x))) + b)",
              copy:
                "The direct DRU uses a simple classical head on measured DRU features.",
            },
            {
              meta: "hybrid input",
              title: "Augmented feature vector",
              equationHtml:
                "u<sub>n</sub> = [x<sub>n</sub>; &phi;<sub>&theta;*</sub>(A(S(x<sub>n</sub>)))]",
              copy:
                "The hybrid model concatenates original classical features with trained DRU measurements.",
            },
            {
              meta: "xgboost",
              title: "Classical tree ensemble",
              equationHtml:
                "P(y = 1 | x) = &sigma;(&Sigma;<sub>m=1</sub><sup>M</sup> f<sub>m</sub>(u))",
              copy:
                "The final logit is the sum of classical decision trees evaluated on the augmented vector.",
            },
            {
              meta: "controls",
              title: "Fair interpretation",
              equationHtml:
                "[x; z<sub>DRU</sub>] vs [x; T<sub>PCA</sub>(x)], [x; T<sub>poly</sub>(x)], [x; T<sub>RBF</sub>(x)]",
              copy:
                "DRU features should be compared with classical feature-map controls before making strong claims.",
            },
          ],
        },
      ],
    },
    points: [
      "Direct DRU: p = sigma(a^T z + b)",
      "Hybrid DRU: XGBoost trains on [x; z]",
      "Splits by source file reduce correlated-window leakage",
      "Compare against PCA, polynomial, random RBF, and untrained DRU controls",
    ],
  });
})();
