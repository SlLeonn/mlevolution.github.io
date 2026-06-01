(function () {
  const namespace = window.MLEvolution || {};
  const models = [...(namespace.models || [])].sort((a, b) => a.order - b.order);
  const projects = namespace.projects || [];
  const svgNamespace = "http://www.w3.org/2000/svg";

  const elements = {
    timeline: document.querySelector("[data-timeline]"),
    title: document.querySelector("[data-active-title]"),
    modelBrief: document.querySelector("[data-model-brief]"),
    formulaStrip: document.querySelector("[data-formula-strip]"),
    model: document.querySelector("[data-active-model]"),
    index: document.querySelector("[data-active-index]"),
    architectureView: document.querySelector("[data-architecture-view]"),
    mathLabel: document.querySelector("[data-math-label]"),
    mathView: document.querySelector("[data-math-view]"),
    demoLabel: document.querySelector("[data-demo-label]"),
    demoView: document.querySelector("[data-demo-view]"),
    controlsLabel: document.querySelector("[data-controls-label]"),
    controlsShell: document.querySelector("[data-controls-shell]"),
    metricsLabel: document.querySelector("[data-metrics-label]"),
    metricsView: document.querySelector("[data-metrics-view]"),
    insightView: document.querySelector("[data-insight-view]"),
    qmlProjects: document.querySelector("[data-qml-projects]"),
  };

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function setText(node, value) {
    if (node) {
      node.textContent = value;
    }
  }

  function getDisplayIndex(position) {
    return `${pad(position + 1)} / ${pad(models.length)}`;
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text) {
      element.textContent = text;
    }

    return element;
  }

  function createSvgElement(tag, attributes = {}) {
    const element = document.createElementNS(svgNamespace, tag);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });

    return element;
  }

  function renderEmptyArchitecture(panel) {
    const nodeRow = createElement("div", "node-row");
    const placeholder = createElement("p", "", panel.placeholder);

    nodeRow.append(
      createElement("span", "node"),
      createElement("span", "node"),
      createElement("span", "node node-accent")
    );
    elements.architectureView.replaceChildren(nodeRow, placeholder);
  }

  function renderNetworkArchitecture(panel) {
    const diagram = panel.diagram;
    const shell = createElement("div", "model-diagram");
    const svg = createSvgElement("svg", {
      class: "architecture-svg",
      viewBox: "0 0 640 310",
      role: "img",
      "aria-label": `${panel.summary} network diagram`,
    });
    const controls = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", panel.summary);
    const layers = diagram.layers;
    const nodeMap = [];
    const xGap = layers.length > 1 ? 500 / (layers.length - 1) : 0;

    layers.forEach((layer, layerIndex) => {
      const x = 70 + xGap * layerIndex;
      const yGap = layer.nodes.length > 1 ? 170 / (layer.nodes.length - 1) : 0;
      const startY = 70 + (170 - yGap * (layer.nodes.length - 1)) / 2;

      nodeMap[layerIndex] = layer.nodes.map((nodeLabel, nodeIndex) => ({
        layerIndex,
        nodeIndex,
        label: nodeLabel,
        isEllipsis: nodeLabel === "...",
        x,
        y: startY + yGap * nodeIndex,
      }));
    });

    nodeMap.slice(0, -1).forEach((layer, layerIndex) => {
      layer.forEach((fromNode) => {
        nodeMap[layerIndex + 1].forEach((toNode) => {
          if (fromNode.isEllipsis || toNode.isEllipsis) {
            return;
          }

          svg.append(
            createSvgElement("line", {
              class: "network-line",
              x1: fromNode.x + 18,
              y1: fromNode.y,
              x2: toNode.x - 18,
              y2: toNode.y,
              "data-from-layer": layerIndex,
              "data-to-layer": layerIndex + 1,
            })
          );
        });
      });
    });

    nodeMap.forEach((layer, layerIndex) => {
      layer.forEach((node) => {
        const group = createSvgElement("g", {
          class: node.isEllipsis ? "network-ellipsis" : "network-node",
          transform: `translate(${node.x} ${node.y})`,
          "data-layer": layerIndex,
        });

        if (node.isEllipsis) {
          group.append(
            createSvgElement("circle", { cy: -10, r: 2.8 }),
            createSvgElement("circle", { cy: 0, r: 2.8 }),
            createSvgElement("circle", { cy: 10, r: 2.8 })
          );
        } else {
          group.append(
            createSvgElement("circle", { r: 18 }),
            createSvgElement("text", { y: 5, "text-anchor": "middle" })
          );
          group.querySelector("text").textContent = node.label;
        }

        svg.append(group);
      });

      const label = createSvgElement("text", {
        class: "layer-label",
        x: layer[0].x,
        y: 286,
        "text-anchor": "middle",
      });

      label.textContent = layers[layerIndex].label;
      svg.append(label);
    });

    function activateLayer(layerIndex) {
      svg.querySelectorAll(".network-node").forEach((node) => {
        node.classList.toggle("is-active", Number(node.dataset.layer) === layerIndex);
      });
      svg.querySelectorAll(".network-line").forEach((line) => {
        const touchesLayer =
          Number(line.dataset.fromLayer) === layerIndex || Number(line.dataset.toLayer) === layerIndex;
        line.classList.toggle("is-active", touchesLayer);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === layerIndex);
      });
      caption.textContent = layers[layerIndex].description || `${layers[layerIndex].label}: ${layers[layerIndex].nodes.join(", ")}`;
    }

    layers.forEach((layer, layerIndex) => {
      const button = createElement("button", "diagram-button", layer.label);

      button.type = "button";
      button.addEventListener("click", () => activateLayer(layerIndex));
      controls.append(button);
    });

    shell.append(svg, controls, caption);
    elements.architectureView.replaceChildren(shell);
    activateLayer(0);
  }

  function renderCnnArchitecture(panel) {
    const diagram = panel.diagram;
    const shell = createElement("div", "cnn-architecture");
    const svg = createSvgElement("svg", {
      class: "cnn-svg",
      viewBox: "0 0 760 330",
      role: "img",
      "aria-label": panel.summary,
    });
    const controls = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", panel.summary);
    const phases = diagram.phases;

    function appendFeatureMap(x, y, width, height, label, phase, layers = 3) {
      for (let index = layers - 1; index >= 0; index -= 1) {
        svg.append(
          createSvgElement("rect", {
            class: "cnn-map",
            x: x + index * 8,
            y: y - index * 8,
            width,
            height,
            rx: 6,
            "data-phase": phase,
          })
        );
      }

      const text = createSvgElement("text", {
        class: "cnn-label",
        x: x + width / 2 + 8,
        y: y + height + 28,
        "text-anchor": "middle",
      });
      text.textContent = label;
      svg.append(text);
    }

    function appendArrow(x1, y1, x2, y2, phase) {
      svg.append(
        createSvgElement("path", {
          class: "cnn-arrow",
          d: `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`,
          "data-phase": phase,
        })
      );
    }

    svg.append(
      createSvgElement("defs"),
      createSvgElement("text", { class: "cnn-small-label", x: 164, y: 84, "text-anchor": "middle" }),
      createSvgElement("text", { class: "cnn-small-label", x: 332, y: 84, "text-anchor": "middle" }),
      createSvgElement("text", { class: "cnn-small-label", x: 502, y: 84, "text-anchor": "middle" })
    );
    svg.querySelectorAll(".cnn-small-label")[0].textContent = "local filter";
    svg.querySelectorAll(".cnn-small-label")[1].textContent = "shared kernels";
    svg.querySelectorAll(".cnn-small-label")[2].textContent = "downsample";

    appendFeatureMap(48, 106, 96, 126, diagram.input, 0, 1);
    svg.append(
      createSvgElement("rect", { class: "cnn-window", x: 76, y: 136, width: 38, height: 38, rx: 4, "data-phase": 0 }),
      createSvgElement("rect", { class: "cnn-kernel", x: 174, y: 134, width: 46, height: 46, rx: 5, "data-phase": 0 }),
      createSvgElement("line", { class: "cnn-local-line", x1: 114, y1: 136, x2: 174, y2: 134, "data-phase": 0 }),
      createSvgElement("line", { class: "cnn-local-line", x1: 114, y1: 174, x2: 174, y2: 180, "data-phase": 0 })
    );

    appendFeatureMap(272, 116, 82, 104, diagram.convolution, 1, 4);
    appendFeatureMap(448, 130, 66, 76, diagram.pooling, 2, 4);

    [584, 626, 668].forEach((x, index) => {
      svg.append(
        createSvgElement("circle", { class: "cnn-dense-node", cx: x, cy: 138 + index * 36, r: 14, "data-phase": 3 })
      );
    });
    svg.append(createSvgElement("circle", { class: "cnn-output-node", cx: 714, cy: 174, r: 18, "data-phase": 3 }));

    appendArrow(146, 166, 272, 168, 1);
    appendArrow(364, 168, 448, 168, 2);
    appendArrow(524, 168, 584, 174, 3);
    appendArrow(682, 174, 696, 174, 3);

    const outputLabel = createSvgElement("text", {
      class: "cnn-label",
      x: 648,
      y: 260,
      "text-anchor": "middle",
    });
    outputLabel.textContent = diagram.output;
    svg.append(outputLabel);

    function activatePhase(phaseIndex) {
      svg.querySelectorAll("[data-phase]").forEach((item) => {
        item.classList.toggle("is-active", Number(item.dataset.phase) === phaseIndex);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === phaseIndex);
      });
      caption.textContent = phases[phaseIndex].caption;
    }

    phases.forEach((phase, phaseIndex) => {
      const button = createElement("button", "diagram-button", phase.label);

      button.type = "button";
      button.addEventListener("click", () => activatePhase(phaseIndex));
      controls.append(button);
    });

    shell.append(svg, controls, caption);
    elements.architectureView.replaceChildren(shell);
    activatePhase(0);
  }

  function normalizeSequenceSteps(diagram) {
    const source =
      diagram.steps ||
      (diagram.tokens || []).map((token, index, list) => {
        const omitted = token === "...";
        const isFinal = index === list.length - 1;

        return {
          button: token,
          input: token,
          hidden: omitted ? "" : isFinal ? "h_T" : `h_${index + 1}`,
          output: omitted ? "" : isFinal ? "o_T" : `o_${index + 1}`,
          omitted,
        };
      });

    return source.map((step, index, list) => {
      const omitted = Boolean(step.omitted);
      const isFinal = index === list.length - 1;
      const fallbackInput = isFinal ? "x_T" : `x_${index + 1}`;

      return {
        button: step.button || step.controlLabel || step.input || step.token || step.label || (omitted ? "..." : fallbackInput),
        input: step.input || step.token || step.label || fallbackInput,
        hidden: omitted ? "" : step.hidden || (isFinal ? "h_T" : `h_${index + 1}`),
        output: omitted ? "" : step.output || (isFinal ? "o_T" : `o_${index + 1}`),
        description: step.description,
        omitted,
      };
    });
  }

  function normalizeSeq2SeqDiagram(diagram) {
    const defaultPhases = [
      {
        label: "Encoder",
        caption: "The encoder reads x_1 to x_T and updates h_t with the same recurrent cell at each step.",
      },
      {
        label: "Context",
        caption: "Context z carries the final source summary from encoder to decoder.",
      },
      {
        label: "Decoder",
        caption: "The decoder predicts y_1 to y_S step by step while conditioning on z.",
      },
    ];
    const phases = defaultPhases.map((phase, index) => ({
      ...phase,
      ...(diagram.phases && diagram.phases[index] ? diagram.phases[index] : {}),
    }));

    return {
      sourceSteps: normalizeSeq2SeqSourceSteps(diagram),
      targetSteps: normalizeSeq2SeqTargetSteps(diagram),
      bridge: diagram.bridge || "z",
      phases,
    };
  }

  function normalizeSeq2SeqSourceSteps(diagram) {
    const rawSteps =
      diagram.sourceSteps && diagram.sourceSteps.length
        ? diagram.sourceSteps
        : (diagram.source || ["x_1", "x_2", "...", "x_T"]).map((token) => ({ input: token }));

    return rawSteps.map((rawStep, index, list) => {
      const step = typeof rawStep === "string" ? { input: rawStep } : rawStep;
      const omitted = Boolean(step.omitted) || step.input === "..." || step.label === "...";
      const isFinal = index === list.length - 1;

      return {
        omitted,
        label: step.label || (omitted ? "..." : step.input),
        input: omitted ? "" : step.input || (isFinal ? "x_T" : `x_${index + 1}`),
        state: omitted ? "" : step.state || (isFinal ? "h_T" : `h_${index + 1}`),
      };
    });
  }

  function normalizeSeq2SeqTargetSteps(diagram) {
    const rawSteps =
      diagram.targetSteps && diagram.targetSteps.length
        ? diagram.targetSteps
        : (diagram.target || ["y_1", "y_2", "...", "y_S"]).map((token) => ({ output: token }));

    return rawSteps.map((rawStep, index, list) => {
      const step = typeof rawStep === "string" ? { output: rawStep } : rawStep;
      const omitted = Boolean(step.omitted) || step.output === "..." || step.label === "...";
      const isFinal = index === list.length - 1;

      return {
        omitted,
        label: step.label || (omitted ? "..." : step.output),
        previous: omitted ? "" : step.previous || (index === 0 ? "<GO>" : isFinal ? "y_(S-1)" : `y_${index}`),
        output: omitted ? "" : step.output || (isFinal ? "y_S" : `y_${index + 1}`),
        state: omitted ? "" : step.state || (isFinal ? "s_S" : `s_${index + 1}`),
      };
    });
  }

  function normalizeGates(diagram) {
    const defaults = [
      {
        label: "Keep",
        short: "k_t",
        description: "The keep gate decides how much old memory should pass forward.",
      },
      {
        label: "Update",
        short: "u_t",
        description: "The update gate decides how much new candidate information should be written.",
      },
      {
        label: "Output",
        short: "o_t",
        description: "The output gate decides what part of memory becomes visible as h_t.",
      },
    ];
    const source = diagram.gates && diagram.gates.length ? diagram.gates : defaults;

    return source.map((gate, index) => {
      if (typeof gate === "string") {
        return {
          ...defaults[index],
          label: gate.charAt(0).toUpperCase() + gate.slice(1),
          short: defaults[index] ? defaults[index].short : gate,
        };
      }

      return {
        ...defaults[index],
        ...gate,
      };
    });
  }

  function renderSequenceArchitecture(panel) {
    const diagram = panel.diagram;
    const steps = normalizeSequenceSteps(diagram);
    const shell = createElement("div", "sequence-architecture");
    const svg = createSvgElement("svg", {
      class: "sequence-svg",
      viewBox: "0 0 680 310",
      role: "img",
      "aria-label": panel.summary,
    });
    const controls = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", panel.summary);
    const xStart = 92;
    const xGap = steps.length > 1 ? 500 / (steps.length - 1) : 0;
    const defs = createSvgElement("defs");
    const marker = createSvgElement("marker", {
      id: "arrow-rnn",
      viewBox: "0 0 10 10",
      refX: 8,
      refY: 5,
      markerWidth: 6,
      markerHeight: 6,
      orient: "auto-start-reverse",
    });

    marker.append(createSvgElement("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
    defs.append(marker);
    svg.append(defs);

    steps.forEach((step, index) => {
      const x = xStart + xGap * index;

      if (index > 0) {
        const previous = steps[index - 1];
        const previousX = xStart + xGap * (index - 1);
        const previousOffset = previous.omitted ? 18 : 34;
        const currentOffset = step.omitted ? 18 : 34;
        const isGap = previous.omitted || step.omitted;

        svg.append(
          createSvgElement("line", {
            class: `rnn-arrow rnn-w${isGap ? " rnn-gap-line" : ""}`,
            x1: previousX + previousOffset,
            y1: 154,
            x2: x - currentOffset,
            y2: 154,
            "data-step": index,
          })
        );

        const weight = createSvgElement("text", {
          class: "weight-label",
          x: previousX + xGap / 2,
          y: 144,
          "text-anchor": "middle",
          "data-step": index,
        });

        weight.textContent = "W";
        svg.append(weight);
      }
    });

    steps.forEach((step, index) => {
      const x = xStart + xGap * index;

      if (step.omitted) {
        const gap = createSvgElement("g", {
          class: "rnn-gap-marker",
          transform: `translate(${x} 154)`,
          "data-step": index,
        });

        gap.append(
          createSvgElement("circle", { cy: -14, r: 3.6 }),
          createSvgElement("circle", { cy: 0, r: 3.6 }),
          createSvgElement("circle", { cy: 14, r: 3.6 })
        );
        svg.append(gap);
      } else {
        const input = createSvgElement("g", { class: "rnn-node rnn-input", transform: `translate(${x} 242)`, "data-step": index });
        const hidden = createSvgElement("g", { class: "rnn-node rnn-hidden", transform: `translate(${x} 154)`, "data-step": index });
        const output = createSvgElement("g", { class: "rnn-node rnn-output", transform: `translate(${x} 62)`, "data-step": index });

        input.append(createSvgElement("circle", { r: 28 }), createSvgElement("text", { y: 5, "text-anchor": "middle" }));
        hidden.append(createSvgElement("circle", { r: 31 }), createSvgElement("text", { y: 5, "text-anchor": "middle" }));
        output.append(createSvgElement("circle", { r: 28 }), createSvgElement("text", { y: 5, "text-anchor": "middle" }));
        input.querySelector("text").textContent = step.input;
        hidden.querySelector("text").textContent = step.hidden;
        output.querySelector("text").textContent = step.output;

        svg.append(
          createSvgElement("line", { class: "rnn-arrow rnn-u", x1: x, y1: 214, x2: x, y2: 190, "data-step": index }),
          createSvgElement("line", { class: "rnn-arrow rnn-v", x1: x, y1: 123, x2: x, y2: 96, "data-step": index }),
          input,
          hidden,
          output
        );

        ["U", "V"].forEach((label, labelIndex) => {
          const text = createSvgElement("text", {
            class: "weight-label",
            x: x + 13,
            y: labelIndex === 0 ? 205 : 111,
            "data-step": index,
          });

          text.textContent = label;
          svg.append(text);
        });
      }

      const button = createElement("button", "diagram-button", step.button);
      button.type = "button";
      button.addEventListener("click", () => activateStep(index));
      controls.append(button);
    });

    const cell = createSvgElement("text", {
      class: "flow-label",
      x: 340,
      y: 292,
      "text-anchor": "middle",
    });
    cell.textContent = diagram.caption || `${diagram.cell} unfolded across T time steps`;
    svg.append(cell);

    function activateStep(stepIndex) {
      svg.querySelectorAll("[data-step]").forEach((node) => {
        const nodeStep = Number(node.dataset.step);
        node.classList.toggle("is-active", nodeStep <= stepIndex);
        node.classList.toggle("is-current", nodeStep === stepIndex);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stepIndex);
      });
      caption.textContent = steps[stepIndex].description || `${diagram.output} carries context after ${steps[stepIndex].button}.`;
    }

    shell.append(svg, controls, caption);
    elements.architectureView.replaceChildren(shell);
    activateStep(0);
  }

  function renderGateArchitecture(panel) {
    const lstmGateItems = [
      {
        label: "Forget",
        description:
          "The forget gate f_t scales the old cell memory c_(t-1). Values near 1 preserve context; values near 0 remove it.",
      },
      {
        label: "Input",
        description:
          "The input gate i_t controls how much of the candidate memory c~_t is written into the cell state.",
      },
      {
        label: "Output",
        description:
          "The output gate o_t decides how much of tanh(c_t) becomes the visible hidden state h_t.",
      },
    ];
    const gruGateItems = [
      {
        label: "Reset",
        description:
          "The reset gate r_t decides how much of h_(t-1) is allowed into the candidate state h~_t. Low reset values make the GRU focus on the current input.",
      },
      {
        label: "Update",
        description:
          "The update gate z_t blends old memory with the candidate state. It controls whether the GRU preserves h_(t-1) or writes h~_t into h_t.",
      },
    ];
    const shell = createElement("div", "gate-architecture");
    const figure = createElement("div", "gate-figure-stack");

    function createArrowDefs(id) {
      const defs = createSvgElement("defs");
      const marker = createSvgElement("marker", {
        id,
        viewBox: "0 0 10 10",
        refX: 8,
        refY: 5,
        markerWidth: 6,
        markerHeight: 6,
        orient: "auto-start-reverse",
      });

      marker.append(createSvgElement("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
      defs.append(marker);
      return defs;
    }

    function addText(svg, text, x, y, className = "gate-label", attributes = {}) {
      const node = createSvgElement("text", {
        class: className,
        x,
        y,
        "text-anchor": "middle",
        ...attributes,
      });

      node.textContent = text;
      svg.append(node);
      return node;
    }

    function addArrow(svg, className, attributes) {
      svg.append(createSvgElement("line", { class: className, ...attributes }));
    }

    function addRectLabel(svg, className, x, y, width, height, text, attributes = {}) {
      const group = createSvgElement("g", {
        class: className,
        transform: `translate(${x} ${y})`,
        ...attributes,
      });

      group.append(
        createSvgElement("rect", { x: -width / 2, y: -height / 2, width, height, rx: 8 }),
        createSvgElement("text", { y: 5, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = text;
      svg.append(group);
      return group;
    }

    function addCircleLabel(svg, className, x, y, radius, text, attributes = {}) {
      const group = createSvgElement("g", {
        class: className,
        transform: `translate(${x} ${y})`,
        ...attributes,
      });

      group.append(
        createSvgElement("circle", { r: radius }),
        createSvgElement("text", { y: 5, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = text;
      svg.append(group);
      return group;
    }

    function createGateControlGroup(items, activate) {
      const controls = createElement("div", "diagram-controls gate-local-controls");
      const caption = createElement("p", "diagram-caption", items[0]?.description || panel.summary);

      items.forEach((gate, index) => {
        const button = createElement("button", "diagram-button", gate.label);
        button.type = "button";
        button.addEventListener("click", () => activate(index, controls, caption));
        controls.append(button);
      });

      return { controls, caption };
    }

    const lstmSvg = createSvgElement("svg", {
      class: "gate-svg gate-cell-svg lstm-cell-svg",
      viewBox: "0 0 900 460",
      role: "img",
      "aria-label": "LSTM cell architecture",
    });
    const gruSvg = createSvgElement("svg", {
      class: "gate-svg gate-cell-svg gru-cell-svg",
      viewBox: "0 0 900 410",
      role: "img",
      "aria-label": "GRU cell architecture",
    });

    lstmSvg.append(createArrowDefs("arrow-gate-lstm"), createSvgElement("rect", { class: "gate-subcell", x: 18, y: 18, width: 864, height: 424, rx: 12 }));
    gruSvg.append(createArrowDefs("arrow-gate-gru"), createSvgElement("rect", { class: "gate-subcell", x: 18, y: 18, width: 864, height: 374, rx: 12 }));

    addText(lstmSvg, "LSTM CELL", 98, 48, "gate-title");
    addText(lstmSvg, "c_t = f_t * c_(t-1) + i_t * c~_t", 480, 48, "gate-equation");
    const lstmZones = [
      { x: 145, y: 120, w: 160, h: 188, gate: 0, label: "Forget gate" },
      { x: 340, y: 120, w: 250, h: 188, gate: 1, label: "Input gate" },
      { x: 625, y: 135, w: 170, h: 173, gate: 2, label: "Output gate" },
    ];
    lstmZones.forEach((box) => {
      lstmSvg.append(
        createSvgElement("rect", {
          class: "gate-dashed-zone",
          x: box.x,
          y: box.y,
          width: box.w,
          height: box.h,
          rx: 10,
          "data-cell": "lstm",
          "data-gate": box.gate,
        })
      );
    });
    addText(lstmSvg, "c_(t-1)", 80, 92, "gate-state-label");
    addText(lstmSvg, "c_t", 828, 92, "gate-state-label");
    addText(lstmSvg, "[x_t, h_(t-1)]", 116, 408, "gate-state-label");
    addText(lstmSvg, "h_t", 826, 226, "gate-state-label");
    addRectLabel(lstmSvg, "gate-chip", 225, 250, 76, 38, "sig", { "data-cell": "lstm", "data-gate": 0 });
    addRectLabel(lstmSvg, "gate-chip", 420, 250, 76, 38, "sig", { "data-cell": "lstm", "data-gate": 1 });
    addRectLabel(lstmSvg, "gate-chip gate-chip-tanh", 530, 250, 86, 38, "tanh", { "data-cell": "lstm", "data-gate": 1 });
    addRectLabel(lstmSvg, "gate-chip", 710, 280, 76, 38, "sig", { "data-cell": "lstm", "data-gate": 2 });
    addRectLabel(lstmSvg, "gate-chip gate-chip-tanh", 650, 166, 86, 38, "tanh", { "data-cell": "lstm", "data-gate": 2 });
    addText(lstmSvg, "f_t", 225, 214, "gate-symbol", { "data-cell": "lstm", "data-gate": 0 });
    addText(lstmSvg, "i_t", 420, 214, "gate-symbol", { "data-cell": "lstm", "data-gate": 1 });
    addText(lstmSvg, "c~_t", 530, 214, "gate-symbol", { "data-cell": "lstm", "data-gate": 1 });
    addText(lstmSvg, "o_t", 666, 250, "gate-symbol", { "data-cell": "lstm", "data-gate": 2 });
    addCircleLabel(lstmSvg, "gate-operator", 225, 92, 18, "x", { "data-cell": "lstm", "data-gate": 0 });
    addCircleLabel(lstmSvg, "gate-operator", 500, 92, 18, "+", { "data-cell": "lstm", "data-gate": 1 });
    addCircleLabel(lstmSvg, "gate-operator", 475, 174, 18, "x", { "data-cell": "lstm", "data-gate": 1 });
    addCircleLabel(lstmSvg, "gate-operator", 710, 222, 18, "x", { "data-cell": "lstm", "data-gate": 2 });
    [
      { x1: 112, y1: 92, x2: 204, y2: 92, gate: 0, className: "gate-memory-path gate-arrow-lstm" },
      { x1: 246, y1: 92, x2: 478, y2: 92, gate: 0, className: "gate-memory-path gate-arrow-lstm" },
      { x1: 522, y1: 92, x2: 802, y2: 92, gate: 1, className: "gate-memory-path gate-arrow-lstm" },
      { x1: 225, y1: 231, x2: 225, y2: 112, gate: 0, className: "gate-signal-path gate-arrow-lstm" },
      { x1: 420, y1: 231, x2: 463, y2: 190, gate: 1, className: "gate-signal-path gate-arrow-lstm" },
      { x1: 530, y1: 231, x2: 488, y2: 190, gate: 1, className: "gate-signal-path gate-arrow-lstm" },
      { x1: 493, y1: 158, x2: 500, y2: 112, gate: 1, className: "gate-signal-path gate-arrow-lstm" },
      { x1: 650, y1: 92, x2: 650, y2: 145, gate: 2, className: "gate-signal-path gate-arrow-lstm" },
      { x1: 650, y1: 185, x2: 696, y2: 214, gate: 2, className: "gate-signal-path gate-arrow-lstm" },
      { x1: 710, y1: 261, x2: 710, y2: 246, gate: 2, className: "gate-signal-path gate-arrow-lstm" },
      { x1: 728, y1: 222, x2: 802, y2: 222, gate: 2, className: "gate-output-path gate-arrow-lstm" },
      { x1: 148, y1: 362, x2: 760, y2: 362, gate: 1, className: "gate-input-path gate-arrow-lstm gate-input-bus" },
      { x1: 225, y1: 362, x2: 225, y2: 270, gate: 0, className: "gate-input-path gate-arrow-lstm" },
      { x1: 420, y1: 362, x2: 420, y2: 270, gate: 1, className: "gate-input-path gate-arrow-lstm" },
      { x1: 530, y1: 362, x2: 530, y2: 270, gate: 1, className: "gate-input-path gate-arrow-lstm" },
      { x1: 710, y1: 362, x2: 710, y2: 299, gate: 2, className: "gate-input-path gate-arrow-lstm" },
    ].forEach((path) =>
      addArrow(lstmSvg, path.className, {
        x1: path.x1,
        y1: path.y1,
        x2: path.x2,
        y2: path.y2,
        "data-cell": "lstm",
        "data-gate": path.gate,
      })
    );
    addText(lstmSvg, "tanh(c_t)", 592, 128, "gate-symbol", { "data-cell": "lstm", "data-gate": 2 });
    lstmZones.forEach((box) => {
      addRectLabel(lstmSvg, "gate-zone-badge", box.x + box.w / 2, box.y + box.h + 24, 120, 28, box.label, {
        "data-cell": "lstm",
        "data-gate": box.gate,
      });
    });
    addText(lstmSvg, "h_t = o_t * tanh(c_t)", 690, 408, "gate-equation", { "data-cell": "lstm", "data-gate": 2 });

    addText(gruSvg, "GRU CELL", 98, 48, "gate-title");
    addText(gruSvg, "h_t = (1 - z_t) * h_(t-1) + z_t * h~_t", 500, 48, "gate-equation");
    const gruZones = [
      { x: 150, y: 155, w: 300, h: 150, gate: 0, label: "Reset gate" },
      { x: 540, y: 92, w: 250, h: 213, gate: 1, label: "Update gate" },
    ];
    gruZones.forEach((box) => {
      gruSvg.append(
        createSvgElement("rect", {
          class: "gate-dashed-zone",
          x: box.x,
          y: box.y,
          width: box.w,
          height: box.h,
          rx: 10,
          "data-cell": "gru",
          "data-gate": box.gate,
        })
      );
    });
    addText(gruSvg, "h_(t-1)", 86, 118, "gate-state-label");
    addText(gruSvg, "x_t", 110, 382, "gate-state-label");
    addText(gruSvg, "h_t", 835, 118, "gate-state-label");
    addRectLabel(gruSvg, "gate-chip", 245, 252, 76, 38, "sig", { "data-cell": "gru", "data-gate": 0 });
    addRectLabel(gruSvg, "gate-chip gate-chip-tanh", 455, 252, 92, 38, "tanh", { "data-cell": "gru", "data-gate": 0 });
    addRectLabel(gruSvg, "gate-chip", 620, 285, 76, 38, "sig", { "data-cell": "gru", "data-gate": 1 });
    addRectLabel(gruSvg, "gate-chip", 620, 78, 84, 34, "1 - z_t", { "data-cell": "gru", "data-gate": 1 });
    addText(gruSvg, "r_t", 245, 218, "gate-symbol", { "data-cell": "gru", "data-gate": 0 });
    addText(gruSvg, "h~_t", 455, 218, "gate-symbol", { "data-cell": "gru", "data-gate": 0 });
    addText(gruSvg, "z_t", 620, 250, "gate-symbol", { "data-cell": "gru", "data-gate": 1 });
    addCircleLabel(gruSvg, "gate-operator", 330, 150, 18, "x", { "data-cell": "gru", "data-gate": 0 });
    addCircleLabel(gruSvg, "gate-operator", 620, 118, 18, "x", { "data-cell": "gru", "data-gate": 1 });
    addCircleLabel(gruSvg, "gate-operator", 690, 252, 18, "x", { "data-cell": "gru", "data-gate": 1 });
    addCircleLabel(gruSvg, "gate-operator", 770, 118, 18, "+", { "data-cell": "gru", "data-gate": 1 });
    [
      { x1: 135, y1: 118, x2: 602, y2: 118, gate: 1, className: "gate-memory-path gate-arrow-gru" },
      { x1: 638, y1: 118, x2: 750, y2: 118, gate: 1, className: "gate-memory-path gate-arrow-gru" },
      { x1: 790, y1: 118, x2: 812, y2: 118, gate: 1, className: "gate-memory-path gate-arrow-gru" },
      { x1: 292, y1: 118, x2: 318, y2: 142, gate: 0, className: "gate-signal-path gate-arrow-gru" },
      { x1: 245, y1: 233, x2: 315, y2: 160, gate: 0, className: "gate-signal-path gate-arrow-gru" },
      { x1: 348, y1: 158, x2: 426, y2: 235, gate: 0, className: "gate-signal-path gate-arrow-gru" },
      { x1: 620, y1: 96, x2: 620, y2: 99, gate: 1, className: "gate-signal-path gate-arrow-gru" },
      { x1: 620, y1: 266, x2: 675, y2: 260, gate: 1, className: "gate-signal-path gate-arrow-gru" },
      { x1: 502, y1: 252, x2: 670, y2: 252, gate: 1, className: "gate-signal-path gate-arrow-gru" },
      { x1: 704, y1: 240, x2: 758, y2: 132, gate: 1, className: "gate-signal-path gate-arrow-gru" },
      { x1: 150, y1: 362, x2: 760, y2: 362, gate: 0, className: "gate-input-path gate-arrow-gru gate-input-bus" },
      { x1: 245, y1: 362, x2: 245, y2: 271, gate: 0, className: "gate-input-path gate-arrow-gru" },
      { x1: 455, y1: 362, x2: 455, y2: 271, gate: 0, className: "gate-input-path gate-arrow-gru" },
      { x1: 620, y1: 362, x2: 620, y2: 304, gate: 1, className: "gate-input-path gate-arrow-gru" },
    ].forEach((path) =>
      addArrow(gruSvg, path.className, {
        x1: path.x1,
        y1: path.y1,
        x2: path.x2,
        y2: path.y2,
        "data-cell": "gru",
        "data-gate": path.gate,
      })
    );
    gruZones.forEach((box) => {
      addRectLabel(gruSvg, "gate-zone-badge", box.x + box.w / 2, box.y + box.h + 24, 120, 28, box.label, {
        "data-cell": "gru",
        "data-gate": box.gate,
      });
    });
    addText(gruSvg, "No separate c_t state; no output gate", 662, 388, "gate-equation");

    const lstmBlock = createElement("div", "gate-cell-block");
    const gruBlock = createElement("div", "gate-cell-block");
    const lstmControls = createGateControlGroup(lstmGateItems, activateLstmGate);
    const gruControls = createGateControlGroup(gruGateItems, activateGruGate);

    function activateLstmGate(gateIndex, controls = lstmControls.controls, caption = lstmControls.caption) {
      lstmSvg.querySelectorAll('[data-cell="lstm"][data-gate]').forEach((gate) => {
        gate.classList.toggle("is-active", Number(gate.dataset.gate) === gateIndex);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === gateIndex);
      });
      caption.textContent = lstmGateItems[gateIndex].description;
    }

    function activateGruGate(gateIndex, controls = gruControls.controls, caption = gruControls.caption) {
      gruSvg.querySelectorAll('[data-cell="gru"][data-gate]').forEach((gate) => {
        gate.classList.toggle("is-active", Number(gate.dataset.gate) === gateIndex);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === gateIndex);
      });
      caption.textContent = gruGateItems[gateIndex].description;
    }

    lstmBlock.append(lstmSvg, lstmControls.controls, lstmControls.caption);
    gruBlock.append(gruSvg, gruControls.controls, gruControls.caption);
    figure.append(lstmBlock, gruBlock);
    shell.append(figure);
    elements.architectureView.replaceChildren(shell);
    activateLstmGate(0);
    activateGruGate(0);
  }

  function renderSeq2SeqArchitecture(panel) {
    const diagram = normalizeSeq2SeqDiagram(panel.diagram);
    const shell = createElement("div", "seq2seq-architecture");
    const svg = createSvgElement("svg", {
      class: "seq2seq-svg",
      viewBox: "0 0 1040 430",
      role: "img",
      "aria-label": panel.summary,
    });
    const controls = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", panel.summary);
    const defs = createSvgElement("defs");
    const marker = createSvgElement("marker", {
      id: "arrow-seq2seq",
      viewBox: "0 0 10 10",
      refX: 8,
      refY: 5,
      markerWidth: 6,
      markerHeight: 6,
      orient: "auto-start-reverse",
    });
    const encoderX = spreadPositions(diagram.sourceSteps.length, 110, 450);
    const decoderX = spreadPositions(diagram.targetSteps.length, 645, 970);
    const cellY = 204;
    const cellOffset = 44;
    const gapOffset = 24;
    const contextRadius = 34;

    marker.append(createSvgElement("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
    defs.append(marker);
    svg.append(
      defs,
      createSvgElement("text", { class: "flow-label seq-section-label", x: 280, y: 42, "text-anchor": "middle" }),
      createSvgElement("text", { class: "flow-label seq-section-label", x: 808, y: 42, "text-anchor": "middle" }),
      createSvgElement("rect", { class: "embedding-bar", x: 60, y: 338, width: 440, height: 30, rx: 8, "data-phase": 0 }),
      createSvgElement("rect", { class: "embedding-bar", x: 590, y: 78, width: 430, height: 30, rx: 8, "data-phase": 2 })
    );
    svg.querySelectorAll(".seq-section-label")[0].textContent = "ENCODER";
    svg.querySelectorAll(".seq-section-label")[1].textContent = "DECODER";

    diagram.sourceSteps.forEach((step, index) => {
      const x = encoderX[index];

      if (index > 0) {
        const previous = diagram.sourceSteps[index - 1];
        const previousOffset = previous.omitted ? gapOffset : cellOffset;
        const currentOffset = step.omitted ? gapOffset : cellOffset;

        svg.append(
          createSvgElement("line", {
            class: `seq-arrow${previous.omitted || step.omitted ? " sequence-gap-link" : ""}`,
            x1: encoderX[index - 1] + previousOffset,
            y1: cellY,
            x2: x - currentOffset,
            y2: cellY,
            "data-phase": 0,
          })
        );
      }

      if (step.omitted) {
        svg.append(
          createSeqGapMarker("seq-gap-marker", x, cellY, 0),
          createTokenText("...", x, 400, 0)
        );
        return;
      }

      svg.append(
        createSvgElement("line", { class: "seq-arrow", x1: x, y1: 338, x2: x, y2: 244, "data-phase": 0 }),
        createSeqCell(step.state, x, cellY, 0),
        createTokenText(step.input, x, 400, 0)
      );
    });

    diagram.targetSteps.forEach((step, index) => {
      const x = decoderX[index];

      if (index > 0) {
        const previous = diagram.targetSteps[index - 1];
        const previousOffset = previous.omitted ? gapOffset : cellOffset;
        const currentOffset = step.omitted ? gapOffset : cellOffset;

        svg.append(
          createSvgElement("line", {
            class: `seq-arrow${previous.omitted || step.omitted ? " sequence-gap-link" : ""}`,
            x1: decoderX[index - 1] + previousOffset,
            y1: cellY,
            x2: x - currentOffset,
            y2: cellY,
            "data-phase": 2,
          })
        );
      }

      if (step.omitted) {
        svg.append(
          createSeqGapMarker("seq-gap-marker", x, cellY, 2),
          createTokenText("...", x, 66, 2),
          createTokenText("...", x, 318, 2)
        );
        return;
      }

      svg.append(
        createSvgElement("line", { class: "seq-arrow", x1: x, y1: 168, x2: x, y2: 110, "data-phase": 2 }),
        createSvgElement("line", { class: "seq-arrow", x1: x, y1: 316, x2: x, y2: 244, "data-phase": 2 }),
        createSeqCell(step.state, x, cellY, 2),
        createTokenText(step.output, x, 66, 2),
        createTokenText(step.previous, x, 318, 2)
      );
    });

    const finalEncoderIndex = findLastRealStepIndex(diagram.sourceSteps);
    const firstDecoderIndex = findFirstRealStepIndex(diagram.targetSteps);
    const finalEncoderX = finalEncoderIndex >= 0 ? encoderX[finalEncoderIndex] : 450;
    const firstDecoderX = firstDecoderIndex >= 0 ? decoderX[firstDecoderIndex] : 645;
    const contextX = 548;
    const context = createSvgElement("g", { class: "context-node", transform: `translate(${contextX} ${cellY})`, "data-phase": 1 });
    context.append(
      createSvgElement("circle", { r: contextRadius }),
      createSvgElement("text", { y: 5, "text-anchor": "middle" })
    );
    setSvgMathText(context.querySelector("text"), diagram.bridge);
    svg.append(
      createSvgElement("line", { class: "seq-arrow", x1: finalEncoderX + cellOffset, y1: cellY, x2: contextX - contextRadius, y2: cellY, "data-phase": 1 }),
      context,
      createSvgElement("line", { class: "seq-arrow", x1: contextX + contextRadius, y1: cellY, x2: firstDecoderX - cellOffset, y2: cellY, "data-phase": 1 })
    );

    diagram.phases.forEach((phase, phaseIndex) => {
      const button = createElement("button", "diagram-button", phase.label);

      button.type = "button";
      button.addEventListener("click", () => activatePhase(phaseIndex));
      controls.append(button);
    });

    function activatePhase(phaseIndex) {
      svg.querySelectorAll("[data-phase]").forEach((item) => {
        item.classList.toggle("is-active", Number(item.dataset.phase) === phaseIndex);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === phaseIndex);
      });
      caption.textContent = diagram.phases[phaseIndex].caption;
    }

    shell.append(svg, controls, caption);
    elements.architectureView.replaceChildren(shell);
    activatePhase(0);
  }

  function createSeqCell(label, x, y, phaseIndex) {
    const group = createSvgElement("g", {
      class: "seq-cell",
      transform: `translate(${x} ${y})`,
      "data-phase": phaseIndex,
    });

    group.append(
      createSvgElement("rect", { x: -39, y: -34, width: 78, height: 68, rx: 14 }),
      createSvgElement("text", { y: 5, "text-anchor": "middle" })
    );
    setSvgMathText(group.querySelector("text"), label);
    return group;
  }

  function createSeqGapMarker(className, x, y, phaseIndex) {
    const attributes = {
      class: className,
      transform: `translate(${x} ${y})`,
    };

    if (phaseIndex !== undefined) {
      attributes["data-phase"] = phaseIndex;
    }

    const group = createSvgElement("g", attributes);

    group.append(
      createSvgElement("circle", { cy: -13, r: 3.4 }),
      createSvgElement("circle", { cy: 0, r: 3.4 }),
      createSvgElement("circle", { cy: 13, r: 3.4 })
    );
    return group;
  }

  function createTokenText(label, x, y, phaseIndex) {
    const token = createSvgElement("text", {
      class: "token-label",
      x,
      y,
      "text-anchor": "middle",
      "data-phase": phaseIndex,
    });

    setSvgMathText(token, label);
    return token;
  }

  function setSvgMathText(textNode, label) {
    const value = String(label);
    const subscriptMatch = value.match(/^([A-Za-z]+)_\((.+)\)$/) || value.match(/^([A-Za-z]+)_([A-Za-z0-9]+)$/);

    textNode.replaceChildren();

    if (subscriptMatch) {
      textNode.classList.add("svg-math");
      textNode.append(
        createSvgElement("tspan", { class: "math-base" }),
        createSvgElement("tspan", { class: "math-sub", "baseline-shift": "sub" })
      );
      textNode.querySelector(".math-base").textContent = subscriptMatch[1];
      textNode.querySelector(".math-sub").textContent = subscriptMatch[2];
      return;
    }

    if (/^[A-Za-z]$/.test(value)) {
      textNode.classList.add("svg-math");
    }

    textNode.textContent = value;
  }

  function spreadPositions(count, start, end) {
    if (count <= 1) {
      return [start + (end - start) / 2];
    }

    const gap = (end - start) / (count - 1);
    return Array.from({ length: count }, (_, index) => start + gap * index);
  }

  function findFirstRealStepIndex(steps) {
    return steps.findIndex((step) => !step.omitted);
  }

  function findLastRealStepIndex(steps) {
    for (let index = steps.length - 1; index >= 0; index -= 1) {
      if (!steps[index].omitted) {
        return index;
      }
    }

    return -1;
  }

  function renderQmlProjectsArchitecture(panel) {
    const shell = createElement("div", "qml-bridge-view");
    const intro = createElement("p", "diagram-caption", panel.summary);
    const grid = createElement("div", "qml-grid qml-grid-inline");

    projects.forEach((project) => {
      const card = createElement("article", "project-card");
      const label = createElement("div", "project-number", project.label);
      const title = createElement("h3", "", project.title);
      const placeholder = createElement("p", "", project.placeholder);
      const block = createElement("div", "placeholder-block");

      block.append(placeholder);
      card.append(label, title, block);
      grid.append(card);
    });

    shell.append(intro, grid);
    elements.architectureView.replaceChildren(shell);
  }

  function renderAttentionArchitecture(panel) {
    const diagram = panel.diagram;
    const shell = createElement("div", "attention-architecture");
    const svg = createSvgElement("svg", {
      class: "attention-svg",
      viewBox: "0 0 760 330",
      role: "img",
      "aria-label": panel.summary,
    });
    const controls = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", panel.summary);

    diagram.tokens.forEach((token, index) => {
      const x = 92 + index * 92;
      const group = createSvgElement("g", {
        class: "attention-token",
        transform: `translate(${x} 66)`,
        "data-token": index,
      });

      group.append(
        createSvgElement("rect", { x: -30, y: -22, width: 60, height: 44, rx: 8 }),
        createSvgElement("text", { y: 5, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = token;
      svg.append(group);
    });

    ["Q", "K", "V"].forEach((label, index) => {
      const x = 162 + index * 140;
      const group = createSvgElement("g", {
        class: "attention-projection",
        transform: `translate(${x} 150)`,
        "data-stage": index,
      });

      group.append(
        createSvgElement("rect", { x: -44, y: -24, width: 88, height: 48, rx: 8 }),
        createSvgElement("text", { y: 6, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = label;
      svg.append(group);
    });

    svg.append(
      createSvgElement("path", {
        class: "attention-flow",
        d: "M 92 88 C 120 116, 136 124, 162 126",
        "data-stage": 0,
      }),
      createSvgElement("path", {
        class: "attention-flow",
        d: "M 276 88 C 282 110, 296 124, 302 126",
        "data-stage": 1,
      }),
      createSvgElement("path", {
        class: "attention-flow",
        d: "M 460 88 C 444 112, 428 124, 442 126",
        "data-stage": 2,
      }),
      createSvgElement("rect", {
        class: "attention-score-box",
        x: 548,
        y: 114,
        width: 116,
        height: 72,
        rx: 10,
        "data-stage": 3,
      }),
      createSvgElement("text", {
        class: "attention-score-label",
        x: 606,
        y: 145,
        "text-anchor": "middle",
        "data-stage": 3,
      }),
      createSvgElement("text", {
        class: "attention-score-label",
        x: 606,
        y: 166,
        "text-anchor": "middle",
        "data-stage": 3,
      }),
      createSvgElement("path", {
        class: "attention-flow",
        d: "M 346 150 C 420 104, 504 104, 548 136",
        "data-stage": 3,
      }),
      createSvgElement("path", {
        class: "attention-flow",
        d: "M 486 150 C 520 168, 540 178, 548 168",
        "data-stage": 4,
      }),
      createSvgElement("rect", {
        class: "attention-context",
        x: 308,
        y: 236,
        width: 144,
        height: 54,
        rx: 10,
        "data-stage": 4,
      }),
      createSvgElement("path", {
        class: "attention-flow",
        d: "M 606 186 C 590 232, 500 252, 452 262",
        "data-stage": 4,
      })
    );
    svg.querySelectorAll(".attention-score-label")[0].textContent = "softmax";
    svg.querySelectorAll(".attention-score-label")[1].textContent = "weights";

    const contextLabel = createSvgElement("text", {
      class: "attention-context-label",
      x: 380,
      y: 268,
      "text-anchor": "middle",
      "data-stage": 4,
    });
    contextLabel.textContent = diagram.output;
    svg.append(contextLabel);

    function activateStage(stageIndex) {
      svg.querySelectorAll("[data-stage]").forEach((item) => {
        item.classList.toggle("is-active", Number(item.dataset.stage) === stageIndex);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stageIndex);
      });
      caption.textContent = diagram.stages[stageIndex].caption;
    }

    diagram.stages.forEach((stage, stageIndex) => {
      const button = createElement("button", "diagram-button", stage.label);

      button.type = "button";
      button.addEventListener("click", () => activateStage(stageIndex));
      controls.append(button);
    });

    shell.append(svg, controls, caption);
    elements.architectureView.replaceChildren(shell);
    activateStage(3);
  }

  function renderTransformerArchitecture(panel) {
    const diagram = panel.diagram;
    const shell = createElement("div", "transformer-architecture");
    const svg = createSvgElement("svg", {
      class: "transformer-svg",
      viewBox: "0 0 760 360",
      role: "img",
      "aria-label": panel.summary,
    });
    const controls = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", panel.summary);
    const blocks = [
      { label: "tokens + position", x: 70, y: 142, width: 120, height: 76 },
      { label: "multi-head attention", x: 250, y: 80, width: 150, height: 72 },
      { label: "add + norm", x: 446, y: 80, width: 112, height: 72 },
      { label: "feed-forward", x: 250, y: 218, width: 150, height: 72 },
      { label: "add + norm", x: 446, y: 218, width: 112, height: 72 },
      { label: "next block / logits", x: 620, y: 142, width: 104, height: 76 },
    ];

    blocks.forEach((block, index) => {
      const group = createSvgElement("g", {
        class: "transformer-block",
        transform: `translate(${block.x} ${block.y})`,
        "data-stage": index,
      });

      group.append(
        createSvgElement("rect", { width: block.width, height: block.height, rx: 10 }),
        createSvgElement("text", { x: block.width / 2, y: block.height / 2 + 5, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = block.label;
      svg.append(group);
    });

    [
      "M 190 180 C 224 180, 222 116, 250 116",
      "M 400 116 L 446 116",
      "M 502 152 C 502 184, 404 206, 328 218",
      "M 400 254 L 446 254",
      "M 558 254 C 600 246, 600 196, 620 180",
      "M 190 180 C 226 188, 574 188, 620 180",
    ].forEach((path, index) => {
      svg.append(createSvgElement("path", { class: "transformer-flow", d: path, "data-stage": index }));
    });

    const stackLabel = createSvgElement("text", {
      class: "transformer-stack-label",
      x: 380,
      y: 330,
      "text-anchor": "middle",
    });
    stackLabel.textContent = diagram.stack;
    svg.append(stackLabel);

    function activateStage(stageIndex) {
      svg.querySelectorAll("[data-stage]").forEach((item) => {
        item.classList.toggle("is-active", Number(item.dataset.stage) === stageIndex);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stageIndex);
      });
      caption.textContent = diagram.stages[stageIndex].caption;
    }

    diagram.stages.forEach((stage, stageIndex) => {
      const button = createElement("button", "diagram-button", stage.label);

      button.type = "button";
      button.addEventListener("click", () => activateStage(stageIndex));
      controls.append(button);
    });

    shell.append(svg, controls, caption);
    elements.architectureView.replaceChildren(shell);
    activateStage(1);
  }

  function createSeqNode(label, x, y, phase) {
    const group = createSvgElement("g", {
      class: "seq-node",
      transform: `translate(${x} ${y})`,
      "data-phase": phase === "source" ? 0 : 2,
    });

    group.append(
      createSvgElement("circle", { r: 21 }),
      createSvgElement("text", { y: 5, "text-anchor": "middle" })
    );
    group.querySelector("text").textContent = label;
    return group;
  }

  function createTokenGroup(label, tokens) {
    const group = createElement("div", "token-group");
    const title = createElement("span", "token-title", label);

    group.append(title);
    tokens.forEach((token) => {
      group.append(createElement("span", "token-chip", token));
    });

    return group;
  }

  function renderArchitecturePanel(panel) {
    if (!elements.architectureView) {
      return;
    }

    const isSeq2Seq = Boolean(panel.diagram && panel.diagram.type === "seq2seq");
    const architecturePanel = elements.architectureView.closest(".architecture-panel");
    const demoPanel = elements.demoView ? elements.demoView.closest(".demo-panel") : null;

    if (architecturePanel) {
      architecturePanel.classList.toggle("is-wide", isSeq2Seq);
    }

    if (demoPanel) {
      demoPanel.classList.toggle("is-wide", isSeq2Seq);
    }

    elements.architectureView.classList.remove("is-content-view");

    if (!panel.diagram) {
      renderEmptyArchitecture(panel);
      return;
    }

    elements.architectureView.classList.add("is-content-view");

    if (panel.diagram.type === "network") {
      renderNetworkArchitecture(panel);
      return;
    }

    if (panel.diagram.type === "cnn") {
      renderCnnArchitecture(panel);
      return;
    }

    if (panel.diagram.type === "sequence") {
      renderSequenceArchitecture(panel);
      return;
    }

    if (panel.diagram.type === "gates") {
      renderGateArchitecture(panel);
      return;
    }

    if (panel.diagram.type === "seq2seq") {
      renderSeq2SeqArchitecture(panel);
      return;
    }

    if (panel.diagram.type === "qml-projects") {
      renderQmlProjectsArchitecture(panel);
      return;
    }

    if (panel.diagram.type === "attention") {
      renderAttentionArchitecture(panel);
      return;
    }

    if (panel.diagram.type === "transformer") {
      renderTransformerArchitecture(panel);
      return;
    }

    renderEmptyArchitecture(panel);
  }

  function renderMathPanel(panel) {
    if (!elements.mathView) {
      return;
    }

    if (!panel.formula) {
      elements.mathView.classList.remove("is-content-view");
      elements.mathView.replaceChildren(createElement("p", "", panel.placeholder));
      return;
    }

    const content = createElement("div", "math-content");
    const formula = createElement("div", "formula");
    const terms = createElement("div", "term-list");
    const note = createElement("p", "math-note", panel.note);

    if (panel.steps && panel.steps.length) {
      const intro = createElement("p", "math-intro", panel.intro || "");
      const steps = createElement("div", "math-step-grid");

      content.classList.add("math-content-detailed");
      formula.classList.add("formula-hero");
      panel.steps.forEach((step) => {
        const card = createElement("article", "math-step");
        const meta = createElement("span", "math-step-meta", step.meta);
        const title = createElement("h4", "", step.title);
        const equation = createElement("div", "step-equation");
        const copy = createElement("p", "", step.copy);

        equation.innerHTML = step.equationMath || step.equationHtml || step.equation;
        card.append(meta, title, equation, copy);
        steps.append(card);
      });

      formula.innerHTML = panel.formulaMath || panel.formulaHtml || panel.formula;
      panel.terms.forEach((term) => {
        terms.append(createElement("span", "term-chip", term));
      });

      content.append(formula, intro, steps, terms, note);
      elements.mathView.classList.add("is-content-view");
      elements.mathView.replaceChildren(content);
      return;
    }

    formula.innerHTML = panel.formulaMath || panel.formulaHtml || panel.formula;

    panel.terms.forEach((term) => {
      terms.append(createElement("span", "term-chip", term));
    });

    content.append(formula, terms, note);
    elements.mathView.classList.add("is-content-view");
    elements.mathView.replaceChildren(content);
  }

  function createDemoShell(panel) {
    const shell = createElement("div", "interactive-demo");
    const header = createElement("div", "demo-copy");
    const title = createElement("h4", "", panel.title);
    const description = createElement("p", "", panel.description);
    const stage = createElement("div", "demo-stage");
    const buttons = createElement("div", "demo-buttons");
    const caption = createElement("p", "demo-caption");

    header.append(title, description);
    shell.append(header, stage, buttons, caption);

    return { shell, stage, buttons, caption };
  }

  function renderDecisionBoundaryDemo(panel) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const svg = createSvgElement("svg", {
      class: "boundary-svg",
      viewBox: "0 0 100 100",
      role: "img",
      "aria-label": panel.title,
    });
    const regionGroup = createSvgElement("g", { class: "boundary-regions" });
    const lineGroup = createSvgElement("g", { class: "boundary-lines" });
    const pointGroup = createSvgElement("g", { class: "point-group" });

    svg.append(
      createSvgElement("rect", { class: "boundary-plane", x: 0, y: 0, width: 100, height: 100 }),
      regionGroup,
      lineGroup,
      pointGroup
    );
    stage.append(svg);

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];
      const regionPaths = state.regionPaths || (state.regionPath ? [state.regionPath] : []);
      const boundaryPaths = state.paths || (state.path ? [state.path] : []);

      regionGroup.replaceChildren(
        ...regionPaths.map((regionPath) => {
          if (typeof regionPath === "string") {
            return createSvgElement("path", { class: "boundary-region", d: regionPath });
          }

          return createSvgElement("path", {
            class: `boundary-region ${regionPath.className || ""}`,
            d: regionPath.d,
          });
        })
      );
      lineGroup.replaceChildren(
        ...boundaryPaths.map((boundaryPath) => createSvgElement("path", { class: "boundary-line", d: boundaryPath }))
      );
      pointGroup.replaceChildren(
        ...state.points.map((point) =>
          createSvgElement("circle", {
            class: `sample-point point-${point.className}`,
            cx: point.x,
            cy: point.y,
            r: 3.7,
          })
        )
      );
      caption.textContent = state.caption;
      buttons.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stateIndex);
      });
    }

    panel.states.forEach((state, stateIndex) => {
      const button = createElement("button", "demo-button", state.label);

      button.type = "button";
      button.addEventListener("click", () => activateState(stateIndex));
      buttons.append(button);
    });

    elements.demoView.replaceChildren(shell);
    activateState(panel.initialState || 0);
  }

  function renderSequenceDemo(panel, architecture) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const steps = normalizeSequenceSteps(architecture.diagram);
    const svg = createSvgElement("svg", {
      class: "sequence-demo-svg",
      viewBox: "0 0 640 220",
      role: "img",
      "aria-label": panel.title,
    });
    const defs = createSvgElement("defs");
    const marker = createSvgElement("marker", {
      id: "arrow-sequence-demo",
      viewBox: "0 0 10 10",
      refX: 8,
      refY: 5,
      markerWidth: 6,
      markerHeight: 6,
      orient: "auto-start-reverse",
    });
    const xStart = 72;
    const xGap = steps.length > 1 ? 500 / (steps.length - 1) : 0;

    marker.append(createSvgElement("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
    defs.append(marker);
    svg.append(defs);

    steps.forEach((step, index) => {
      if (index === 0) {
        return;
      }

      const previous = steps[index - 1];
      const previousX = xStart + xGap * (index - 1);
      const x = xStart + xGap * index;
      const previousOffset = previous.omitted ? 18 : 28;
      const currentOffset = step.omitted ? 18 : 28;

      svg.append(
        createSvgElement("line", {
          class: `sequence-state-link sequence-demo-arrow${previous.omitted || step.omitted ? " sequence-gap-link" : ""}`,
          x1: previousX + previousOffset,
          y1: 54,
          x2: x - currentOffset,
          y2: 54,
          "data-step": index,
        })
      );
    });

    steps.forEach((step, index) => {
      const x = xStart + xGap * index;

      if (step.omitted) {
        const gap = createSvgElement("g", {
          class: "seq-demo-gap",
          transform: `translate(${x} 54)`,
          "data-step": index,
        });

        gap.append(
          createSvgElement("circle", { cy: -13, r: 3.4 }),
          createSvgElement("circle", { cy: 0, r: 3.4 }),
          createSvgElement("circle", { cy: 13, r: 3.4 })
        );
        svg.append(gap);
        return;
      }

      const state = createSvgElement("g", {
        class: "seq-demo-state",
        transform: `translate(${x} 54)`,
        "data-step": index,
      });
      const cell = createSvgElement("g", {
        class: "seq-state-cell",
        transform: `translate(${x} 113)`,
        "data-step": index,
      });
      const input = createSvgElement("g", {
        class: "seq-demo-input",
        transform: `translate(${x} 172)`,
        "data-step": index,
      });

      state.append(createSvgElement("circle", { r: 23 }), createSvgElement("text", { y: 5, "text-anchor": "middle" }));
      cell.append(createSvgElement("rect", { x: -34, y: -19, width: 68, height: 38, rx: 9 }), createSvgElement("text", { y: 5, "text-anchor": "middle" }));
      input.append(createSvgElement("rect", { x: -28, y: -16, width: 56, height: 32, rx: 8 }), createSvgElement("text", { y: 5, "text-anchor": "middle" }));
      state.querySelector("text").textContent = step.hidden;
      cell.querySelector("text").textContent = "RNN";
      input.querySelector("text").textContent = step.input;

      svg.append(
        createSvgElement("line", { class: "sequence-demo-arrow", x1: x, y1: 156, x2: x, y2: 137, "data-step": index }),
        createSvgElement("line", { class: "sequence-demo-arrow", x1: x, y1: 94, x2: x, y2: 80, "data-step": index }),
        state,
        cell,
        input
      );
    });

    stage.append(svg);

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];

      svg.querySelectorAll(".seq-demo-state, .seq-state-cell, .seq-demo-input, .seq-demo-gap, .sequence-demo-arrow").forEach((node) => {
        const nodeStep = Number(node.dataset.step);
        node.classList.toggle("is-active", nodeStep <= state.activeStep);
        node.classList.toggle("is-current", nodeStep === state.activeStep);
      });
      caption.textContent = state.caption;
      buttons.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stateIndex);
      });
    }

    panel.states.forEach((state, stateIndex) => {
      const button = createElement("button", "demo-button", state.label);

      button.type = "button";
      button.addEventListener("click", () => activateState(stateIndex));
      buttons.append(button);
    });

    elements.demoView.replaceChildren(shell);
    activateState(panel.initialState || 0);
  }

  function renderGateDemo(panel, architecture) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const gates = normalizeGates(architecture.diagram);
    const svg = createSvgElement("svg", {
      class: "gate-demo-svg",
      viewBox: "0 0 640 230",
      role: "img",
      "aria-label": panel.title,
    });
    const defs = createSvgElement("defs");
    const marker = createSvgElement("marker", {
      id: "arrow-gate-demo",
      viewBox: "0 0 10 10",
      refX: 8,
      refY: 5,
      markerWidth: 6,
      markerHeight: 6,
      orient: "auto-start-reverse",
    });

    marker.append(createSvgElement("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
    defs.append(marker);

    svg.append(
      defs,
      createSvgElement("rect", { class: "gate-demo-state", x: 38, y: 82, width: 118, height: 52, rx: 8 }),
      createSvgElement("rect", { class: "gate-demo-unit", x: 226, y: 66, width: 188, height: 92, rx: 10 }),
      createSvgElement("rect", { class: "gate-demo-state", x: 486, y: 82, width: 118, height: 52, rx: 8 }),
      createSvgElement("rect", { class: "gate-demo-input", x: 244, y: 178, width: 152, height: 36, rx: 8 }),
      createSvgElement("line", { class: "gate-demo-path gate-demo-memory", x1: 156, y1: 108, x2: 226, y2: 108, "data-gate": 0 }),
      createSvgElement("line", { class: "gate-demo-path gate-demo-memory", x1: 414, y1: 108, x2: 486, y2: 108, "data-gate": 0 }),
      createSvgElement("line", { class: "gate-demo-path gate-demo-write", x1: 320, y1: 178, x2: 320, y2: 144, "data-gate": 1 }),
      createSvgElement("line", { class: "gate-demo-path gate-demo-read", x1: 545, y1: 82, x2: 545, y2: 48, "data-gate": 2 }),
      createSvgElement("text", { class: "flow-label", x: 97, y: 112, "text-anchor": "middle" }),
      createSvgElement("text", { class: "flow-label", x: 545, y: 112, "text-anchor": "middle" }),
      createSvgElement("text", { class: "flow-label", x: 320, y: 202, "text-anchor": "middle" }),
      createSvgElement("text", { class: "flow-label", x: 545, y: 38, "text-anchor": "middle", "data-gate": 2 })
    );
    svg.querySelectorAll(".flow-label")[0].textContent = "m_(t-1)";
    svg.querySelectorAll(".flow-label")[1].textContent = "m_t";
    svg.querySelectorAll(".flow-label")[2].textContent = "x_t + h_(t-1)";
    svg.querySelectorAll(".flow-label")[3].textContent = "h_t";

    gates.forEach((gate, index) => {
      const x = 272 + index * 48;
      const group = createSvgElement("g", {
        class: "gate-node",
        transform: `translate(${x} 108)`,
        "data-gate": index,
      });

      group.append(
        createSvgElement("rect", { x: -23, y: -18, width: 46, height: 36, rx: 7 }),
        createSvgElement("text", { y: 5, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = gate.short;
      svg.append(group);
    });

    stage.append(svg);

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];

      svg.querySelectorAll("[data-gate]").forEach((item) => {
        item.classList.toggle("is-active", Number(item.dataset.gate) === state.activeGate);
      });
      caption.textContent = state.caption;
      buttons.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stateIndex);
      });
    }

    panel.states.forEach((state, stateIndex) => {
      const button = createElement("button", "demo-button", state.label);

      button.type = "button";
      button.addEventListener("click", () => activateState(stateIndex));
      buttons.append(button);
    });

    elements.demoView.replaceChildren(shell);
    activateState(panel.initialState || 0);
  }

  function renderEncoderDecoderDemo(panel, architecture) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const diagram = normalizeSeq2SeqDiagram(architecture.diagram);
    const sourceX = spreadPositions(diagram.sourceSteps.length, 72, 258);
    const targetX = spreadPositions(diagram.targetSteps.length, 438, 626);
    const tokenY = 78;
    const contextX = 350;
    const contextY = 116;
    const svg = createSvgElement("svg", {
      class: "seq2seq-demo-svg",
      viewBox: "0 0 700 230",
      role: "img",
      "aria-label": panel.title,
    });
    const defs = createSvgElement("defs");
    const marker = createSvgElement("marker", {
      id: "arrow-seq2seq-demo",
      viewBox: "0 0 10 10",
      refX: 8,
      refY: 5,
      markerWidth: 6,
      markerHeight: 6,
      orient: "auto-start-reverse",
    });

    marker.append(createSvgElement("path", { d: "M 0 0 L 10 5 L 0 10 z" }));
    defs.append(marker);
    svg.append(defs);

    drawDemoSequenceLinks(diagram.sourceSteps, sourceX, tokenY, 0, "source");
    drawDemoSequenceLinks(diagram.targetSteps, targetX, tokenY, 2, "target");

    svg.append(
      createSvgElement("text", { class: "flow-label seq-section-label", x: 166, y: 34, "text-anchor": "middle", "data-phase": 0 }),
      createSvgElement("text", { class: "flow-label seq-section-label", x: 350, y: 34, "text-anchor": "middle", "data-phase": 1 }),
      createSvgElement("text", { class: "flow-label seq-section-label", x: 532, y: 34, "text-anchor": "middle", "data-phase": 2 }),
      createSvgElement("path", {
        class: "encoder-flow",
        d: "M 78 134 C 154 174, 252 164, 316 118",
        "data-phase": 0,
      }),
      createSvgElement("path", {
        class: "context-pulse",
        d: "M 318 116 C 336 98, 364 98, 382 116",
        "data-phase": 1,
      }),
      createSvgElement("path", {
        class: "decoder-flow",
        d: "M 384 118 C 452 164, 552 174, 622 134",
        "data-phase": 2,
      }),
      createSvgElement("circle", { class: "context-orbit", cx: contextX, cy: contextY, r: 34, "data-phase": 1 })
    );
    svg.querySelectorAll(".seq-section-label")[0].textContent = "SOURCE";
    svg.querySelectorAll(".seq-section-label")[1].textContent = "CONTEXT";
    svg.querySelectorAll(".seq-section-label")[2].textContent = "TARGET";

    diagram.sourceSteps.forEach((step, index) => {
      if (step.omitted) {
        svg.append(createSeqGapMarker("seq-demo-gap", sourceX[index], tokenY, 0));
        return;
      }

      svg.append(createSeqDemoToken(step.input, sourceX[index], tokenY, 0));
    });
    diagram.targetSteps.forEach((step, index) => {
      if (step.omitted) {
        svg.append(createSeqGapMarker("seq-demo-gap", targetX[index], tokenY, 2));
        return;
      }

      svg.append(createSeqDemoToken(step.output, targetX[index], tokenY, 2));
    });

    const context = createSvgElement("text", {
      class: "context-label",
      x: contextX,
      y: contextY + 6,
      "text-anchor": "middle",
      "data-phase": 1,
    });
    context.textContent = diagram.bridge;
    svg.append(context);
    stage.append(svg);

    function createSeqDemoToken(label, x, y, phaseIndex) {
      const width = Math.max(48, label.length * 8 + 22);
      const group = createSvgElement("g", {
        class: "seq-demo-input",
        transform: `translate(${x} ${y})`,
        "data-phase": phaseIndex,
      });

      group.append(
        createSvgElement("rect", { x: -width / 2, y: -16, width, height: 32, rx: 8 }),
        createSvgElement("text", { y: 5, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = label;
      return group;
    }

    function drawDemoSequenceLinks(steps, positions, y, phaseIndex, type) {
      steps.forEach((step, index) => {
        if (index === 0) {
          return;
        }

        const previous = steps[index - 1];
        const previousLabel = type === "source" ? previous.input : previous.output;
        const currentLabel = type === "source" ? step.input : step.output;
        const previousOffset = previous.omitted ? 14 : Math.max(24, previousLabel.length * 4 + 11);
        const currentOffset = step.omitted ? 14 : Math.max(24, currentLabel.length * 4 + 11);

        svg.append(
          createSvgElement("line", {
            class: `seq2seq-demo-link${previous.omitted || step.omitted ? " sequence-gap-link" : ""}`,
            x1: positions[index - 1] + previousOffset,
            y1: y,
            x2: positions[index] - currentOffset,
            y2: y,
            "data-phase": phaseIndex,
          })
        );
      });
    }

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];

      svg.querySelectorAll("[data-phase]").forEach((phase) => {
        phase.classList.toggle("is-active", Number(phase.dataset.phase) === state.activePhase);
      });
      caption.textContent = state.caption;
      buttons.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stateIndex);
      });
    }

    panel.states.forEach((state, stateIndex) => {
      const button = createElement("button", "demo-button", state.label);

      button.type = "button";
      button.addEventListener("click", () => activateState(stateIndex));
      buttons.append(button);
    });

    elements.demoView.replaceChildren(shell);
    activateState(panel.initialState || 0);
  }

  function renderDemoPanel(panel, architecture) {
    if (!elements.demoView) {
      return;
    }

    elements.demoView.classList.remove("is-content-view");

    if (!panel.states.length) {
      elements.demoView.replaceChildren(
        createElement("div", "demo-grid"),
        createElement("p", "", panel.placeholder)
      );
      return;
    }

    elements.demoView.classList.add("is-content-view");

    if (panel.type === "decision-boundary") {
      renderDecisionBoundaryDemo(panel);
      return;
    }

    if (panel.type === "sequence-state") {
      renderSequenceDemo(panel, architecture);
      return;
    }

    if (panel.type === "gate-flow") {
      renderGateDemo(panel, architecture);
      return;
    }

    if (panel.type === "encoder-decoder") {
      renderEncoderDecoderDemo(panel, architecture);
      return;
    }

    elements.demoView.replaceChildren(createElement("p", "", panel.placeholder));
  }

  function renderControlsPanel(panel) {
    if (!elements.controlsShell) {
      return;
    }

    elements.controlsShell.replaceChildren(
      ...panel.items.map((item) => {
        const button = createElement("button", "control-token", item);

        button.type = "button";
        button.disabled = true;
        return button;
      })
    );
  }

  function renderMetricsPanel(panel) {
    if (!elements.metricsView) {
      return;
    }

    if (!panel.points.length) {
      elements.metricsView.classList.remove("is-content-view");
      elements.metricsView.replaceChildren(
        createElement("span"),
        createElement("span"),
        createElement("span"),
        createElement("span"),
        createElement("p", "", panel.placeholder)
      );
      return;
    }

    const content = createElement("div", "evolution-notes");
    const title = createElement("h4", "", panel.title);
    const list = createElement("div", "note-list");

    panel.points.forEach((point) => {
      list.append(createElement("span", "note-chip", point));
    });

    content.append(title, list);
    elements.metricsView.classList.add("is-content-view");
    elements.metricsView.replaceChildren(content);
  }

  function renderInsightStrip(panels) {
    if (!elements.insightView) {
      return;
    }

    const pieces = createElement("section", "insight-group");
    const piecesTitle = createElement("h3", "", panels.controls.label);
    const piecesList = createElement("div", "note-list");
    const limits = createElement("section", "insight-group insight-group-wide");
    const limitsTitle = createElement("h3", "", panels.metrics.title || panels.metrics.label);
    const limitsList = createElement("div", "note-list");

    panels.controls.items.forEach((item) => {
      piecesList.append(createElement("span", "note-chip", item));
    });
    panels.metrics.points.forEach((point) => {
      limitsList.append(createElement("span", "note-chip", point));
    });

    pieces.append(piecesTitle, piecesList);
    limits.append(limitsTitle, limitsList);
    elements.insightView.replaceChildren(pieces, limits);
  }

  function createTimelineItem(model, position) {
    const button = document.createElement("button");
    const number = document.createElement("span");

    button.className = "timeline-item";
    button.type = "button";
    button.role = "tab";
    button.dataset.model = model.id;
    button.setAttribute("aria-label", `${pad(position + 1)} ${model.title}`);
    button.setAttribute("aria-selected", "false");

    number.textContent = pad(position + 1);
    button.append(number, document.createTextNode(model.title));

    button.addEventListener("click", () => {
      setActiveModel(model.id, true);
    });

    return button;
  }

  function renderTimeline() {
    if (!elements.timeline) {
      return;
    }

    elements.timeline.style.setProperty("--timeline-count", models.length);
    elements.timeline.replaceChildren(
      ...models.map((model, position) => createTimelineItem(model, position))
    );
  }

  function renderProjects() {
    if (!elements.qmlProjects) {
      return;
    }

    const projectCards = projects.map((project) => {
      const article = document.createElement("article");
      const label = document.createElement("div");
      const title = document.createElement("h3");
      const placeholderBlock = document.createElement("div");
      const placeholder = document.createElement("p");

      article.className = "project-card";
      label.className = "project-number";
      placeholderBlock.className = "placeholder-block";

      label.textContent = project.label;
      title.textContent = project.title;
      placeholder.textContent = project.placeholder;

      placeholderBlock.append(placeholder);
      article.append(label, title, placeholderBlock);

      return article;
    });

    elements.qmlProjects.replaceChildren(...projectCards);
  }

  function renderFormulaStrip(panel) {
    if (!elements.formulaStrip) {
      return;
    }

    if (!panel.formula) {
      elements.formulaStrip.replaceChildren();
      elements.formulaStrip.hidden = true;
      return;
    }

    const label = createElement("span", "formula-label", panel.label);
    const formula = createElement("div", "formula formula-inline");
    const terms = createElement("div", "term-list formula-terms");

    formula.innerHTML = panel.formulaMath || panel.formulaHtml || panel.formula;
    panel.terms.slice(0, 3).forEach((term) => {
      terms.append(createElement("span", "term-chip", term));
    });

    elements.formulaStrip.hidden = false;
    elements.formulaStrip.replaceChildren(label, formula, terms);
  }

  function renderModelBrief(model, panels) {
    if (!elements.modelBrief) {
      return;
    }

    const year = createElement("span", "model-year", model.year);
    const copy = createElement(
      "p",
      "",
      `${model.overview.what} ${model.overview.consists}`
    );

    elements.modelBrief.replaceChildren(year, copy);
    renderFormulaStrip(panels.math);
  }

  function setActiveModel(modelId, shouldUpdateHash = false) {
    const activeIndex = models.findIndex((model) => model.id === modelId);
    const activeModel = models[activeIndex];

    if (!activeModel) {
      return;
    }

    if (shouldUpdateHash) {
      history.replaceState(null, "", `#${modelId}`);
    }

    const panels = activeModel.panels;

    setText(elements.title, activeModel.title);
    renderModelBrief(activeModel, panels);
    setText(elements.model, activeModel.title);
    setText(elements.index, getDisplayIndex(activeIndex));
    setText(elements.mathLabel, panels.math.label);
    setText(elements.demoLabel, panels.demo.label);
    setText(elements.controlsLabel, panels.controls.label);
    setText(elements.metricsLabel, panels.metrics.label);

    renderArchitecturePanel(panels.architecture);
    renderMathPanel(panels.math);
    renderDemoPanel(panels.demo, panels.architecture);
    renderControlsPanel(panels.controls);
    renderMetricsPanel(panels.metrics);
    renderInsightStrip(panels);

    document.querySelectorAll(".timeline-item").forEach((item) => {
      const isActive = item.dataset.model === modelId;

      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
  }

  if (!models.length) {
    console.warn("No ML Evolution models were registered.");
    return;
  }

  renderTimeline();
  renderProjects();
  setActiveModel(models.some((model) => model.id === location.hash.slice(1)) ? location.hash.slice(1) : models[0].id);
})();
