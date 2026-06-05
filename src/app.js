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
      viewBox: "0 0 1040 450",
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
      createSvgElement("text", { class: "flow-label seq-section-label", x: 280, y: 42, "text-anchor": "middle", "data-phase": 0 }),
      createSvgElement("text", { class: "flow-label seq-section-label", x: 808, y: 42, "text-anchor": "middle", "data-phase": 2 }),
      createSvgElement("rect", { class: "embedding-bar", x: 60, y: 338, width: 440, height: 30, rx: 8, "data-phase": 0 }),
      createSvgElement("rect", { class: "embedding-bar", x: 590, y: 78, width: 430, height: 30, rx: 8, "data-phase": 2 }),
      createSvgElement("text", { class: "seq-bar-label", x: 280, y: 358, "text-anchor": "middle", "data-phase": 0 }),
      createSvgElement("text", { class: "seq-bar-label", x: 805, y: 98, "text-anchor": "middle", "data-phase": 2 }),
      createSvgElement("text", { class: "seq-helper-label", x: 280, y: 426, "text-anchor": "middle", "data-phase": 0 }),
      createSvgElement("text", { class: "seq-helper-label", x: 805, y: 356, "text-anchor": "middle", "data-phase": 2 })
    );
    svg.querySelectorAll(".seq-section-label")[0].textContent = "ENCODER";
    svg.querySelectorAll(".seq-section-label")[1].textContent = "DECODER";
    svg.querySelectorAll(".seq-bar-label")[0].textContent = "source embeddings";
    svg.querySelectorAll(".seq-bar-label")[1].textContent = "output distribution";
    svg.querySelectorAll(".seq-helper-label")[0].textContent = "source positions";
    svg.querySelectorAll(".seq-helper-label")[1].textContent = "previous target input";

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
    const contextLabel = createSvgElement("text", {
      class: "context-caption",
      x: contextX,
      y: cellY + 58,
      "text-anchor": "middle",
      "data-phase": 1,
    });
    contextLabel.textContent = "fixed context";
    svg.append(
      createSvgElement("line", { class: "seq-arrow", x1: finalEncoderX + cellOffset, y1: cellY, x2: contextX - contextRadius, y2: cellY, "data-phase": 1 }),
      context,
      contextLabel,
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

  function renderQmlBridgeArchitecture(panel) {
    const diagram = panel.diagram || {};
    const stages = diagram.stages || [];
    const shell = createElement("div", "qml-bridge-view");
    const intro = createElement("p", "diagram-caption", panel.summary);
    const flow = createElement("div", "qml-flow-map");
    const controls = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", stages[0]?.caption || panel.summary);
    const projectLaunch = createElement("section", "qml-project-launch");
    const projectIntro = createElement("p", "diagram-caption", "Choose a QML project to open its own workspace.");
    const projectButtons = createElement("div", "qml-project-buttons");

    stages.forEach((stage, index) => {
      const card = createElement("article", "qml-flow-card");
      const number = createElement("span", "qml-flow-number", pad(index + 1));
      const title = createElement("h4", "", stage.title);
      const label = createElement("p", "", stage.label);
      const button = createElement("button", "diagram-button", stage.label);

      card.dataset.stage = index;
      button.type = "button";
      button.addEventListener("click", () => activateStage(index));
      card.append(number, title, label);
      flow.append(card);
      controls.append(button);
    });

    projects.forEach((project) => {
      const button = createElement("button", "qml-project-button");
      const title = createElement("strong", "", project.title);

      button.type = "button";
      button.setAttribute("aria-label", `Open ${project.title}`);
      button.addEventListener("click", () => {
        setActiveProject(project.id, true);
        scrollToWorkspace();
      });
      button.append(title);
      projectButtons.append(button);
    });

    function activateStage(stageIndex) {
      flow.querySelectorAll("[data-stage]").forEach((item) => {
        item.classList.toggle("is-active", Number(item.dataset.stage) === stageIndex);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stageIndex);
      });
      caption.textContent = stages[stageIndex].caption;
    }

    projectLaunch.append(projectIntro, projectButtons);
    shell.append(intro, flow, controls, caption, projectLaunch);
    elements.architectureView.replaceChildren(shell);
    activateStage(0);
  }

  function renderQmlProjectArchitecture(panel) {
    const projectId = panel.diagram?.projectId;
    const project = projects.find((entry) => entry.id === projectId);
    const shell = createElement("div", "qml-project-detail-view");
    const back = createElement("button", "diagram-button project-back", "Back to QML Bridge");

    back.type = "button";
    back.addEventListener("click", () => {
      setActiveModel("qml-bridge", true);
      scrollToWorkspace();
    });

    if (!project) {
      shell.append(back, createElement("p", "diagram-caption", "Project not found."));
      elements.architectureView.replaceChildren(shell);
      return;
    }

    const kicker = createElement("span", "project-kicker", project.kicker || "QML project");
    const title = createElement("h3", "", project.title);
    const architecture = project.architecture || null;
    const summary = createElement(
      "p",
      "project-summary",
      architecture?.summary || project.summary || project.placeholder
    );
    const relation = createElement(
      "p",
      "project-relation",
      architecture?.relation || project.relation || "Classical connection placeholder"
    );

    shell.append(back, kicker, title, summary, relation);

    if (architecture) {
      const flow = createElement("div", "project-flow-strip");
      const cards = createElement("div", "project-analogy-grid");

      (architecture.flow || []).forEach((step, index) => {
        const item = createElement("article", "project-flow-step");
        const number = createElement("span", "qml-flow-number", pad(index + 1));
        const stepTitle = createElement("h4", "", step.label);
        const detail = createElement("p", "", step.detail);
        const notation = createElement("span", "project-notation");

        notation.innerHTML = step.notationHtml || step.notation || "";
        item.append(number, stepTitle, notation, detail);
        flow.append(item);
      });

      (architecture.cards || []).forEach((card) => {
        const item = createElement("article", "project-info-card");
        const cardTitle = createElement("h4", "", card.title);
        const copy = createElement("p", "", card.copy);

        item.append(cardTitle, copy);
        cards.append(item);
      });

      shell.append(flow, cards);

      if (architecture.snapshot) {
        const snapshot = createElement("aside", "project-snapshot");

        snapshot.append(
          createElement("span", "project-kicker", architecture.snapshot.kicker),
          createElement("h4", "", architecture.snapshot.title)
        );
        architecture.snapshot.points.forEach((point) => {
          snapshot.append(createElement("p", "", point));
        });
        shell.append(snapshot);
      }
    } else {
      const placeholder = createElement("div", "placeholder-block");

      placeholder.append(createElement("p", "", project.placeholder || "Project architecture placeholder"));
      shell.append(placeholder);
    }

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

    if (panel.diagram.type === "qml-bridge") {
      renderQmlBridgeArchitecture(panel);
      return;
    }

    if (panel.diagram.type === "qml-project-detail") {
      renderQmlProjectArchitecture(panel);
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
    const sourceX = spreadPositions(diagram.sourceSteps.length, 78, 286);
    const targetX = spreadPositions(diagram.targetSteps.length, 462, 654);
    const tokenY = 88;
    const contextX = 372;
    const contextY = 130;
    const svg = createSvgElement("svg", {
      class: "seq2seq-demo-svg",
      viewBox: "0 0 720 260",
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
      createSvgElement("text", { class: "flow-label seq-section-label", x: 182, y: 34, "text-anchor": "middle", "data-phase": 0 }),
      createSvgElement("text", { class: "flow-label seq-section-label", x: contextX, y: 34, "text-anchor": "middle", "data-phase": 1 }),
      createSvgElement("text", { class: "flow-label seq-section-label", x: 558, y: 34, "text-anchor": "middle", "data-phase": 2 }),
      createSvgElement("path", {
        class: "encoder-flow",
        d: "M 84 150 C 150 190, 248 184, 320 132",
        "data-phase": 0,
      }),
      createSvgElement("path", {
        class: "context-pulse",
        d: "M 328 130 C 346 108, 398 108, 416 130",
        "data-phase": 1,
      }),
      createSvgElement("path", {
        class: "decoder-flow",
        d: "M 420 132 C 486 184, 584 190, 650 150",
        "data-phase": 2,
      }),
      createSvgElement("circle", { class: "context-orbit", cx: contextX, cy: contextY, r: 34, "data-phase": 1 })
    );
    svg.querySelectorAll(".seq-section-label")[0].textContent = "SOURCE";
    svg.querySelectorAll(".seq-section-label")[1].textContent = "CONTEXT";
    svg.querySelectorAll(".seq-section-label")[2].textContent = "TARGET";

    diagram.sourceSteps.forEach((step, index) => {
      if (step.omitted) {
        svg.append(createSeqDemoToken("...", sourceX[index], tokenY, 0, true));
        return;
      }

      svg.append(createSeqDemoToken(step.input, sourceX[index], tokenY, 0));
    });
    diagram.targetSteps.forEach((step, index) => {
      if (step.omitted) {
        svg.append(createSeqDemoToken("...", targetX[index], tokenY, 2, true));
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
    const sourceHint = createSvgElement("text", {
      class: "seq-helper-label",
      x: 182,
      y: 224,
      "text-anchor": "middle",
      "data-phase": 0,
    });
    const targetHint = createSvgElement("text", {
      class: "seq-helper-label",
      x: 558,
      y: 224,
      "text-anchor": "middle",
      "data-phase": 2,
    });
    const contextHint = createSvgElement("text", {
      class: "seq-helper-label",
      x: contextX,
      y: 178,
      "text-anchor": "middle",
      "data-phase": 1,
    });
    sourceHint.textContent = "encode all source tokens";
    targetHint.textContent = "generate target tokens";
    contextHint.textContent = "fixed source summary";
    svg.append(context, sourceHint, targetHint, contextHint);
    stage.append(svg);

    function createSeqDemoToken(label, x, y, phaseIndex, omitted = false) {
      const width = Math.max(48, label.length * 8 + 22);
      const group = createSvgElement("g", {
        class: `seq-demo-input${omitted ? " seq-demo-gap-token" : ""}`,
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

  function renderQmlFlowDemo(panel) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const visual = createElement("div", "qml-demo-visual");
    const visualHeader = createElement("div", "qml-demo-visual-header");
    const visualNumber = createElement("span", "qml-flow-number");
    const visualTitle = createElement("h4");
    const graphicSlot = createElement("div", "qml-demo-graphic-slot");
    const graphicLabel = createElement("span", "qml-demo-graphic-label");

    visualHeader.append(visualNumber, visualTitle);
    graphicSlot.append(graphicLabel);
    visual.append(visualHeader, graphicSlot);

    function makeDemoSvg(className, label, viewBox = "0 0 760 300") {
      return createSvgElement("svg", {
        class: `qml-flow-svg ${className}`,
        viewBox,
        role: "img",
        "aria-label": label,
      });
    }

    function appendSvgText(parent, text, attrs = {}) {
      const node = createSvgElement("text", attrs);

      node.textContent = text;
      parent.append(node);
      return node;
    }

    function appendArrow(svg, x1, y1, x2, y2, className = "qml-flow-arrow") {
      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

      svg.append(
        createSvgElement("line", {
          class: className,
          x1,
          y1,
          x2,
          y2,
        }),
        createSvgElement("path", {
          class: `${className}-head`,
          d: "M 0 0 L -8 -4 L -8 4 Z",
          transform: `translate(${x2} ${y2}) rotate(${angle})`,
        })
      );
    }

    function appendCurvedArrow(svg, d, headX, headY, angle, className = "qml-flow-arrow") {
      svg.append(
        createSvgElement("path", {
          class: className,
          d,
          fill: "none",
        }),
        createSvgElement("path", {
          class: `${className}-head`,
          d: "M 0 0 L -8 -4 L -8 4 Z",
          transform: `translate(${headX} ${headY}) rotate(${angle})`,
        })
      );
    }

    function appendBox(svg, { x, y, width, height, label, className = "qml-flow-box", sublabel = "" }) {
      const group = createSvgElement("g", { class: className, transform: `translate(${x} ${y})` });

      group.append(
        createSvgElement("rect", { width, height, rx: 8 }),
        createSvgElement("text", { x: width / 2, y: height / 2 + (sublabel ? -2 : 5), "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = label;

      if (sublabel) {
        appendSvgText(group, sublabel, {
          class: "qml-flow-small-text",
          x: width / 2,
          y: height / 2 + 18,
          "text-anchor": "middle",
        });
      }

      svg.append(group);
      return group;
    }

    function renderBridgeDataGraphic() {
      const svg = makeDemoSvg("qml-flow-bridge-data", "Classical data and loss target");
      const matrixX = 76;
      const matrixY = 102;
      const cell = 28;
      const gap = 6;
      const rows = 4;
      const cols = 5;

      appendSvgText(svg, "Classical ML setup", { class: "qml-flow-title", x: 42, y: 36 });
      appendSvgText(svg, "Feature table X", { class: "qml-flow-formula", x: 178, y: 66, "text-anchor": "middle" });
      appendSvgText(svg, "Labels y", { class: "qml-flow-formula", x: 354, y: 66, "text-anchor": "middle" });

      ["f_1", "f_2", "f_3", "...", "f_p"].forEach((label, index) => {
        const x = matrixX + index * (cell + gap) + cell / 2;

        appendSvgText(svg, label, {
          class: "qml-flow-small-text",
          x,
          y: matrixY - 12,
          "text-anchor": "middle",
        });
      });

      for (let row = 0; row < rows; row += 1) {
        appendSvgText(svg, ["x_1", "x_2", "...", "x_N"][row], {
          class: "qml-flow-small-text",
          x: matrixX - 24,
          y: matrixY + row * (cell + gap) + 18,
          "text-anchor": "middle",
        });

        for (let col = 0; col < cols; col += 1) {
          svg.append(
            createSvgElement("rect", {
              class: "qml-matrix-cell",
              x: matrixX + col * (cell + gap),
              y: matrixY + row * (cell + gap),
              width: cell,
              height: cell,
              rx: 4,
            })
          );
        }
      }

      ["y_1", "y_2", "...", "y_N"].forEach((value, index) => {
        const y = matrixY + index * (cell + gap);

        svg.append(createSvgElement("rect", { class: "qml-label-cell", x: 336, y, width: 40, height: cell, rx: 5 }));
        appendSvgText(svg, String(value), {
          class: "qml-flow-small-text",
          x: 356,
          y: y + 18,
          "text-anchor": "middle",
        });
      });

      appendBox(svg, { x: 452, y: 94, width: 122, height: 58, label: "QML model", sublabel: "prediction" });
      appendBox(svg, { x: 622, y: 94, width: 102, height: 58, label: "loss", sublabel: "L(y_hat, y)" });
      appendBox(svg, { x: 622, y: 190, width: 102, height: 58, label: "metrics", sublabel: "evaluate" });

      appendCurvedArrow(svg, "M 250 122 C 304 76, 394 78, 450 116", 450, 116, 18);
      appendArrow(svg, 574, 123, 620, 123);
      appendCurvedArrow(svg, "M 378 116 C 446 64, 560 72, 620 112", 620, 112, 24);
      appendArrow(svg, 673, 154, 673, 188);
      appendSvgText(svg, "features, labels, loss, and metrics remain classical", {
        class: "qml-flow-note",
        x: 380,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderBridgeEncodeGraphic() {
      const svg = makeDemoSvg("qml-flow-bridge-encode", "Feature map encoding");
      const qubits = [
        { label: "|0⟩", y: 122, gate: "R(φ₁(x))" },
        { label: "|0⟩", y: 172, gate: "R(φ₂(x))" },
        { label: "|0⟩", y: 232, gate: "R(φ_q(x))" },
      ];

      appendSvgText(svg, "Feature map", { class: "qml-flow-title", x: 42, y: 36 });
      appendSvgText(svg, "|ψ(x)⟩ = Uφ(x)|0⟩^{⊗ n_q}", {
        class: "qml-flow-formula",
        x: 382,
        y: 36,
        "text-anchor": "middle",
      });
      appendBox(svg, { x: 54, y: 126, width: 108, height: 56, label: "x ∈ R^p", sublabel: "features" });
      appendSvgText(svg, "Uφ(x)", { class: "qml-flow-formula", x: 390, y: 82, "text-anchor": "middle" });
      svg.append(createSvgElement("rect", { class: "qml-feature-map-frame", x: 230, y: 88, width: 320, height: 172, rx: 12 }));
      appendBox(svg, { x: 602, y: 126, width: 118, height: 56, label: "|ψ(x)⟩", sublabel: "encoded state" });
      appendArrow(svg, 162, 154, 228, 154);

      qubits.forEach((qubit, index) => {
        const inputLabel = createSvgElement("text", { class: "qml-flow-small-text", x: 250, y: qubit.y + 4 });
        const gateLabel = createSvgElement("text", { class: "qml-flow-text", x: 390, y: qubit.y + 5, "text-anchor": "middle" });

        inputLabel.textContent = qubit.label;
        gateLabel.textContent = qubit.gate;
        svg.append(
          inputLabel,
          createSvgElement("line", { class: "qml-qubit-line", x1: 284, y1: qubit.y, x2: 528, y2: qubit.y }),
          createSvgElement("rect", { class: "qml-gate qml-data-gate", x: 334, y: qubit.y - 18, width: 112, height: 36, rx: 7 }),
          gateLabel
        );
      });

      [195, 202, 209].forEach((y) => {
        svg.append(createSvgElement("circle", { class: "qml-ellipsis-dot", cx: 390, cy: y, r: 2.8 }));
      });
      appendCurvedArrow(svg, "M 528 122 C 556 122, 572 134, 600 142", 600, 142, 18);
      appendCurvedArrow(svg, "M 528 172 C 556 172, 574 156, 600 154", 600, 154, 0);
      appendCurvedArrow(svg, "M 528 232 C 556 232, 572 178, 600 166", 600, 166, -24);
      appendSvgText(svg, "all qubit lines together form one encoded quantum state", {
        class: "qml-flow-note",
        x: 380,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderBridgeCircuitGraphic() {
      const svg = makeDemoSvg("qml-flow-bridge-circuit", "Parameterized quantum circuit");
      const ys = [122, 172, 232];

      appendSvgText(svg, "Trainable circuit core", { class: "qml-flow-title", x: 42, y: 36 });
      appendSvgText(svg, "|ψ(x, θ)⟩ = Uθ|ψ(x)⟩", {
        class: "qml-flow-formula",
        x: 410,
        y: 36,
        "text-anchor": "middle",
      });
      appendBox(svg, { x: 42, y: 128, width: 120, height: 56, label: "|ψ(x)⟩", sublabel: "encoded" });
      appendBox(svg, { x: 236, y: 44, width: 104, height: 42, label: "θ", sublabel: "parameters" });
      appendSvgText(svg, "Uθ", { class: "qml-flow-formula", x: 390, y: 82, "text-anchor": "middle" });
      svg.append(createSvgElement("rect", { class: "qml-feature-map-frame", x: 226, y: 92, width: 328, height: 168, rx: 12 }));
      appendBox(svg, { x: 606, y: 128, width: 124, height: 56, label: "|ψ(x, θ)⟩", sublabel: "trained state" });
      appendArrow(svg, 162, 156, 224, 156);
      appendCurvedArrow(svg, "M 340 66 C 360 72, 364 92, 364 104", 364, 104, 88, "qml-control-arrow");

      ys.forEach((y, index) => {
        const wireLabel = createSvgElement("text", { class: "qml-flow-small-text", x: 248, y: y + 4 });
        const gateLabel = createSvgElement("text", { class: "qml-flow-text", x: 374, y: y + 5, "text-anchor": "middle" });

        wireLabel.textContent = ["q₁", "q₂", "qₖ"][index];
        gateLabel.textContent = ["R(θ₁)", "R(θ₂)", "R(θₖ)"][index];
        svg.append(
          wireLabel,
          createSvgElement("line", { class: "qml-qubit-line", x1: 276, y1: y, x2: 528, y2: y }),
          createSvgElement("rect", { class: "qml-gate qml-train-gate", x: 324, y: y - 18, width: 100, height: 36, rx: 7 }),
          gateLabel
        );
      });

      [194, 202, 210].forEach((y) => {
        svg.append(createSvgElement("circle", { class: "qml-ellipsis-dot", cx: 374, cy: y, r: 2.8 }));
      });
      svg.append(
        createSvgElement("line", { class: "qml-entangle-line", x1: 470, y1: ys[0], x2: 470, y2: ys[1] }),
        createSvgElement("circle", { class: "qml-control", cx: 470, cy: ys[0], r: 5 }),
        createSvgElement("circle", { class: "qml-target", cx: 470, cy: ys[1], r: 10 }),
        createSvgElement("line", { class: "qml-target-cross", x1: 460, y1: ys[1], x2: 480, y2: ys[1] }),
        createSvgElement("line", { class: "qml-target-cross", x1: 470, y1: ys[1] - 10, x2: 470, y2: ys[1] + 10 }),
        createSvgElement("line", { class: "qml-entangle-line", x1: 508, y1: ys[1], x2: 508, y2: ys[2] }),
        createSvgElement("circle", { class: "qml-control", cx: 508, cy: ys[1], r: 5 }),
        createSvgElement("circle", { class: "qml-target", cx: 508, cy: ys[2], r: 10 }),
        createSvgElement("line", { class: "qml-target-cross", x1: 498, y1: ys[2], x2: 518, y2: ys[2] }),
        createSvgElement("line", { class: "qml-target-cross", x1: 508, y1: ys[2] - 10, x2: 508, y2: ys[2] + 10 })
      );

      appendCurvedArrow(svg, "M 528 122 C 558 122, 574 136, 604 144", 604, 144, 16);
      appendCurvedArrow(svg, "M 528 172 C 558 172, 574 158, 604 156", 604, 156, 0);
      appendCurvedArrow(svg, "M 528 232 C 558 232, 574 178, 604 168", 604, 168, -24);
      appendSvgText(svg, "trainable gates and entangling links transform the encoded state", {
        class: "qml-flow-note",
        x: 380,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderBridgeMeasureGraphic() {
      const svg = makeDemoSvg("qml-flow-bridge-measure", "Measurement returns classical values");
      const observables = [
        { label: "M₁", value: "z₁", x: 274, barHeight: 28 },
        { label: "M₂", value: "z₂", x: 380, barHeight: 42 },
        { label: "Mₘ", value: "zₘ", x: 500, barHeight: 34 },
      ];

      appendSvgText(svg, "Measurement", { class: "qml-flow-title", x: 42, y: 36 });
      appendSvgText(svg, "zᵢ = ⟨ψ|Mᵢ|ψ⟩", {
        class: "qml-flow-formula",
        x: 382,
        y: 36,
        "text-anchor": "middle",
      });
      appendBox(svg, { x: 42, y: 128, width: 140, height: 56, label: "|ψ(x, θ)⟩", sublabel: "model state" });
      appendSvgText(svg, "observe M₁ ... Mₘ", { class: "qml-flow-formula", x: 404, y: 82, "text-anchor": "middle" });
      svg.append(createSvgElement("rect", { class: "qml-feature-map-frame", x: 236, y: 92, width: 332, height: 168, rx: 12 }));
      appendBox(svg, { x: 620, y: 128, width: 118, height: 56, label: "z(x, θ)", sublabel: "classical vector" });
      appendArrow(svg, 182, 156, 234, 156);

      observables.forEach((item) => {
        appendBox(svg, { x: item.x, y: 112, width: 68, height: 44, label: item.label, className: "qml-flow-box qml-measure-box" });
        appendArrow(svg, item.x + 34, 158, item.x + 34, 182);
        svg.append(
          createSvgElement("rect", { class: "qml-measure-track", x: item.x + 12, y: 190, width: 44, height: 44, rx: 7 }),
          createSvgElement("rect", {
            class: "qml-measure-bar",
            x: item.x + 20,
            y: 224 - item.barHeight,
            width: 28,
            height: item.barHeight,
            rx: 5,
          })
        );
        appendSvgText(svg, item.value, {
          class: "qml-flow-small-text",
          x: item.x + 34,
          y: 248,
          "text-anchor": "middle",
        });
      });

      [466, 474, 482].forEach((x) => {
        svg.append(createSvgElement("circle", { class: "qml-ellipsis-dot", cx: x, cy: 134, r: 2.7 }));
        svg.append(createSvgElement("circle", { class: "qml-ellipsis-dot", cx: x, cy: 212, r: 2.7 }));
      });
      appendCurvedArrow(svg, "M 330 218 C 398 284, 560 262, 618 168", 618, 168, -58);
      appendCurvedArrow(svg, "M 436 218 C 496 254, 582 220, 618 156", 618, 156, -54);
      appendCurvedArrow(svg, "M 556 218 C 586 202, 600 166, 618 144", 618, 144, -50);
      appendSvgText(svg, "observables become numeric features the classical code can use", {
        class: "qml-flow-note",
        x: 380,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderBridgeUpdateGraphic() {
      const svg = makeDemoSvg("qml-flow-bridge-update", "Classical optimizer update loop");

      appendSvgText(svg, "Classical optimization loop", { class: "qml-flow-title", x: 42, y: 36 });
      appendSvgText(svg, "θ ← θ − η ∇θ L", {
        class: "qml-flow-formula",
        x: 410,
        y: 36,
        "text-anchor": "middle",
      });
      appendBox(svg, { x: 50, y: 96, width: 116, height: 58, label: "Uθ circuit", sublabel: "evaluate" });
      appendBox(svg, { x: 216, y: 96, width: 108, height: 58, label: "z(x, θ)", sublabel: "output" });
      appendBox(svg, { x: 374, y: 96, width: 108, height: 58, label: "L(θ; y)", sublabel: "loss" });
      appendBox(svg, { x: 538, y: 96, width: 126, height: 58, label: "optimizer", sublabel: "classical" });
      appendBox(svg, { x: 548, y: 184, width: 106, height: 48, label: "θ", sublabel: "updated" });

      appendArrow(svg, 166, 125, 214, 125);
      appendArrow(svg, 324, 125, 372, 125);
      appendArrow(svg, 482, 125, 536, 125);
      appendArrow(svg, 601, 154, 601, 182);
      appendCurvedArrow(svg, "M 548 210 C 430 264, 214 262, 110 156", 110, 156, -144, "qml-feedback-loop");
      appendSvgText(svg, "updated θ returns to the circuit for the next evaluation", {
        class: "qml-flow-small-text",
        x: 338,
        y: 204,
        "text-anchor": "middle",
      });
      appendSvgText(svg, "the optimizer is classical; the circuit is evaluated inside the loop", {
        class: "qml-flow-note",
        x: 380,
        y: 292,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderFeatureMatrixGraphic() {
      const svg = makeDemoSvg("qml-flow-feature-matrix", "Classical feature matrix");
      const startX = 112;
      const startY = 78;
      const cell = 28;
      const rows = 5;
      const cols = 8;

      appendSvgText(svg, "Classical dataset", { class: "qml-flow-title", x: 42, y: 36 });
      appendSvgText(svg, "X in R^(N x p)", { class: "qml-flow-formula", x: 340, y: 36, "text-anchor": "middle" });
      appendSvgText(svg, "y in {0,1}^N", { class: "qml-flow-formula", x: 628, y: 36, "text-anchor": "middle" });

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          svg.append(
            createSvgElement("rect", {
              class: `qml-matrix-cell${row === 2 ? " is-highlighted" : ""}${col >= 5 ? " is-muted" : ""}`,
              x: startX + col * cell,
              y: startY + row * cell,
              width: cell - 3,
              height: cell - 3,
              rx: 4,
            })
          );
        }
        appendSvgText(svg, row === 2 ? "x_n" : `x_${row + 1}`, {
          class: "qml-flow-small-text",
          x: 74,
          y: startY + row * cell + 17,
        });
      }

      ["feature 1", "feature 2", "...", "feature p"].forEach((label, index) => {
        appendSvgText(svg, label, {
          class: "qml-flow-small-text",
          x: [112, 170, 252, 306][index],
          y: 242,
          "text-anchor": "middle",
        });
      });

      [0, 1, 0, 1, 0].forEach((value, index) => {
        const y = startY + index * cell;

        svg.append(createSvgElement("rect", { class: "qml-label-cell", x: 600, y, width: 34, height: 25, rx: 5 }));
        appendSvgText(svg, String(value), {
          class: "qml-flow-text",
          x: 617,
          y: y + 17,
          "text-anchor": "middle",
        });
      });

      appendArrow(svg, 384, 148, 584, 148);
      appendSvgText(svg, "samples stay classical before encoding", {
        class: "qml-flow-note",
        x: 384,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderSelectScaleGraphic() {
      const svg = makeDemoSvg("qml-flow-select-scale", "Feature selection and angular scaling");
      const xs = [74, 112, 150, 188, 226, 264, 302, 340];
      const selected = new Set([1, 3, 6]);
      const angleHeights = [64, 96, 44, 78];

      appendSvgText(svg, "Select q features", { class: "qml-flow-title", x: 46, y: 34 });
      appendSvgText(svg, "S: R^p -> R^q", { class: "qml-flow-formula", x: 244, y: 64, "text-anchor": "middle" });
      appendSvgText(svg, "Scale to angles", { class: "qml-flow-title", x: 520, y: 34 });
      appendSvgText(svg, "A: R^q -> [-pi, pi]^q", { class: "qml-flow-formula", x: 626, y: 64, "text-anchor": "middle" });

      xs.forEach((x, index) => {
        svg.append(
          createSvgElement("rect", {
            class: `qml-feature-chip${selected.has(index) ? " is-selected" : ""}`,
            x,
            y: 116,
            width: 28,
            height: 68,
            rx: 6,
          })
        );
        appendSvgText(svg, index === 7 ? "p" : String(index + 1), {
          class: "qml-flow-small-text",
          x: x + 14,
          y: 206,
          "text-anchor": "middle",
        });
      });

      appendBox(svg, { x: 392, y: 118, width: 70, height: 62, label: "S", sublabel: "select" });
      appendArrow(svg, 356, 150, 390, 150);
      appendArrow(svg, 462, 150, 506, 150);

      angleHeights.forEach((height, index) => {
        const x = 532 + index * 44;
        const y = 198 - height;

        svg.append(
          createSvgElement("line", { class: "qml-angle-axis", x1: x + 14, y1: 86, x2: x + 14, y2: 206 }),
          createSvgElement("rect", { class: "qml-angle-bar", x, y, width: 28, height, rx: 5 })
        );
        appendSvgText(svg, `q${index + 1}`, {
          class: "qml-flow-small-text",
          x: x + 14,
          y: 226,
          "text-anchor": "middle",
        });
      });

      appendSvgText(svg, "x^q = A(S(x))", {
        class: "qml-flow-note",
        x: 620,
        y: 248,
        "text-anchor": "middle",
      });

      appendSvgText(svg, "selected values become valid gate angles", {
        class: "qml-flow-note",
        x: 386,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderDruMapGraphic() {
      const svg = makeDemoSvg("qml-flow-dru-map", "DataReuploading feature map");
      const blocks = [
        { label: "x^q", sublabel: "angles", x: 50, y: 125, width: 76, height: 54 },
        { label: "U_enc(x)", sublabel: "encode", x: 170, y: 88, width: 104, height: 54 },
        { label: "U_train(theta_1)", sublabel: "weights", x: 170, y: 174, width: 128, height: 54 },
        { label: "U_enc(x)", sublabel: "reupload", x: 354, y: 88, width: 104, height: 54 },
        { label: "U_train(theta_l)", sublabel: "weights", x: 354, y: 174, width: 128, height: 54 },
        { label: "...", sublabel: "L layers", x: 526, y: 125, width: 70, height: 54 },
        { label: "z(x)", sublabel: "measure", x: 648, y: 125, width: 76, height: 54 },
      ];

      appendSvgText(svg, "DRU feature map", { class: "qml-flow-title", x: 42, y: 36 });
      appendSvgText(svg, "phi_theta: R^q -> R^m", {
        class: "qml-flow-formula",
        x: 380,
        y: 36,
        "text-anchor": "middle",
      });

      blocks.forEach((block, index) => {
        appendBox(svg, {
          ...block,
          className: `qml-flow-box${index === 0 || index === blocks.length - 1 ? " is-terminal" : ""}`,
        });
      });

      [
        [126, 152, 170, 115],
        [126, 152, 170, 201],
        [298, 201, 354, 201],
        [274, 115, 354, 115],
        [482, 201, 526, 152],
        [458, 115, 526, 152],
        [596, 152, 648, 152],
      ].forEach(([x1, y1, x2, y2]) => appendArrow(svg, x1, y1, x2, y2));

      appendSvgText(svg, "the same classical input is injected again between trainable blocks", {
        class: "qml-flow-note",
        x: 380,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderConcatenateGraphic() {
      const svg = makeDemoSvg("qml-flow-concat", "Feature concatenation");

      appendSvgText(svg, "Augment the classical table", { class: "qml-flow-title", x: 42, y: 36 });
      appendBox(svg, { x: 82, y: 106, width: 148, height: 70, label: "x", sublabel: "original features" });
      appendBox(svg, { x: 82, y: 194, width: 148, height: 70, label: "z(x)", sublabel: "DRU measurements" });
      appendBox(svg, { x: 342, y: 144, width: 150, height: 78, label: "u = [x; z(x)]", sublabel: "hybrid vector" });

      for (let index = 0; index < 7; index += 1) {
        svg.append(
          createSvgElement("rect", {
            class: `qml-table-column${index >= 4 ? " is-quantum" : ""}`,
            x: 588 + index * 18,
            y: 98,
            width: 14,
            height: 132,
            rx: 3,
          })
        );
      }
      appendSvgText(svg, "augmented feature table", {
        class: "qml-flow-text",
        x: 650,
        y: 258,
        "text-anchor": "middle",
      });

      appendArrow(svg, 230, 141, 340, 172);
      appendArrow(svg, 230, 229, 340, 194);
      appendArrow(svg, 492, 183, 570, 164);
      appendSvgText(svg, "after measurement, z(x) is ordinary numeric data", {
        class: "qml-flow-note",
        x: 380,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderClassicalLearnerGraphic() {
      const svg = makeDemoSvg("qml-flow-learner", "Classical learner over hybrid features");

      appendSvgText(svg, "Classical decision stage", { class: "qml-flow-title", x: 42, y: 36 });
      appendBox(svg, { x: 54, y: 134, width: 92, height: 58, label: "u", sublabel: "[x; z]" });
      appendBox(svg, { x: 210, y: 94, width: 126, height: 58, label: "a^T z + b", sublabel: "direct head" });
      appendBox(svg, { x: 210, y: 178, width: 126, height: 58, label: "sum f_m(u)", sublabel: "ensemble head" });
      appendBox(svg, { x: 424, y: 134, width: 100, height: 58, label: "h", sublabel: "logit" });
      appendBox(svg, { x: 610, y: 134, width: 100, height: 58, label: "p = sigma(h)", sublabel: "probability" });

      appendArrow(svg, 146, 163, 208, 123);
      appendArrow(svg, 146, 163, 208, 207);
      appendArrow(svg, 336, 123, 422, 163);
      appendArrow(svg, 336, 207, 422, 163);
      appendArrow(svg, 524, 163, 608, 163);

      appendSvgText(svg, "the learner is classical; DRU supplies the measured representation", {
        class: "qml-flow-note",
        x: 380,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderControlsGraphic() {
      const svg = makeDemoSvg("qml-flow-controls", "Feature-map controls");
      const items = [
        { label: "[x]", sublabel: "baseline" },
        { label: "[x; PCA(x)]", sublabel: "linear" },
        { label: "[x; Poly(x)]", sublabel: "deterministic nonlinear" },
        { label: "[x; RBF(x)]", sublabel: "random nonlinear" },
        { label: "[x; DRU_0(x)]", sublabel: "untrained DRU" },
        { label: "[x; DRU_theta(x)]", sublabel: "trained DRU" },
      ];

      appendSvgText(svg, "Compare feature maps fairly", { class: "qml-flow-title", x: 42, y: 36 });
      items.forEach((item, index) => {
        const x = 62 + (index % 3) * 222;
        const y = 84 + Math.floor(index / 3) * 98;

        appendBox(svg, {
          x,
          y,
          width: 170,
          height: 66,
          label: item.label,
          sublabel: item.sublabel,
          className: `qml-flow-box${index === 5 ? " is-terminal" : ""}`,
        });
      });

      appendSvgText(svg, "a DRU gain is meaningful only when it beats strong classical feature controls", {
        class: "qml-flow-note",
        x: 380,
        y: 278,
        "text-anchor": "middle",
      });

      return svg;
    }

    function renderFlowGraphic(state) {
      const graphicRenderers = {
        "bridge-data": renderBridgeDataGraphic,
        "bridge-encode": renderBridgeEncodeGraphic,
        "bridge-circuit": renderBridgeCircuitGraphic,
        "bridge-measure": renderBridgeMeasureGraphic,
        "bridge-update": renderBridgeUpdateGraphic,
        "feature-matrix": renderFeatureMatrixGraphic,
        "select-scale": renderSelectScaleGraphic,
        "dru-map": renderDruMapGraphic,
        "concat-features": renderConcatenateGraphic,
        "classical-learner": renderClassicalLearnerGraphic,
        "feature-controls": renderControlsGraphic,
      };
      const renderer = graphicRenderers[state.graphic];

      if (!renderer) {
        graphicLabel.textContent = state.graphicPlaceholder || `${state.label} graphic slot`;
        graphicSlot.replaceChildren(graphicLabel);
        return;
      }

      graphicSlot.replaceChildren(renderer());
    }

    panel.states.forEach((state, index) => {
      const button = createElement("button", "demo-button", state.label);

      button.type = "button";
      button.addEventListener("click", () => activateState(index));
      buttons.append(button);
    });

    stage.append(visual);

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];

      buttons.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stateIndex);
      });

      visualNumber.textContent = pad(stateIndex + 1);
      visualTitle.textContent = state.label;
      renderFlowGraphic(state);
      graphicSlot.dataset.stage = String(state.activeStage);
      caption.textContent = state.viewNote || "Graphic slot reserved for this step.";
    }

    elements.demoView.replaceChildren(shell);
    activateState(panel.initialState || 0);
  }

  function renderAttentionWeightsDemo(panel) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const tokens = panel.tokens || ["x1", "x2", "x3", "x4"];
    const svg = createSvgElement("svg", {
      class: "attention-demo-svg",
      viewBox: "0 0 720 250",
      role: "img",
      "aria-label": panel.title,
    });
    const positions = spreadPositions(tokens.length, 92, 628);
    const queryGroup = createSvgElement("g", { class: "attention-demo-query" });
    const arcGroup = createSvgElement("g", { class: "attention-demo-arcs" });
    const tokenGroup = createSvgElement("g", { class: "attention-demo-tokens" });
    const barGroup = createSvgElement("g", { class: "attention-demo-bars" });

    tokens.forEach((token, index) => {
      const x = positions[index];
      const node = createSvgElement("g", {
        class: "attention-demo-token",
        transform: `translate(${x} 82)`,
        "data-token": index,
      });

      node.append(
        createSvgElement("rect", { x: -34, y: -22, width: 68, height: 44, rx: 9 }),
        createSvgElement("text", { y: 5, "text-anchor": "middle" })
      );
      node.querySelector("text").textContent = token;
      tokenGroup.append(node);

      const bar = createSvgElement("g", {
        class: "attention-weight-bar",
        transform: `translate(${x - 28} 170)`,
        "data-token": index,
      });
      bar.append(
        createSvgElement("rect", { class: "attention-weight-track", width: 56, height: 12, rx: 6 }),
        createSvgElement("rect", { class: "attention-weight-fill", width: 0, height: 12, rx: 6 }),
        createSvgElement("text", { x: 28, y: 34, "text-anchor": "middle" })
      );
      bar.querySelector("text").textContent = "0.00";
      barGroup.append(bar);
    });

    svg.append(
      createSvgElement("text", { class: "attention-demo-label", x: 360, y: 34, "text-anchor": "middle" }),
      arcGroup,
      tokenGroup,
      barGroup,
      queryGroup
    );
    svg.querySelector(".attention-demo-label").textContent = "softmax(QK^T) chooses how strongly the query reads each value";
    stage.append(svg);

    function drawQuery(queryIndex, weights) {
      const queryX = positions[queryIndex];

      queryGroup.replaceChildren(
        createSvgElement("circle", { class: "attention-query-ring", cx: queryX, cy: 82, r: 35 }),
        createSvgElement("text", { class: "attention-query-label", x: queryX, y: 136, "text-anchor": "middle" })
      );
      queryGroup.querySelector("text").textContent = "query";

      arcGroup.replaceChildren(
        ...weights.map((weight, index) => {
          const x = positions[index];
          const lift = 58 + Math.abs(index - queryIndex) * 16;

          return createSvgElement("path", {
            class: "attention-demo-arc",
            d: `M ${queryX} 66 C ${(queryX + x) / 2} ${66 - lift}, ${(queryX + x) / 2} ${66 - lift}, ${x} 66`,
            "data-token": index,
            "stroke-width": 1.5 + weight * 8,
            opacity: 0.22 + weight * 0.78,
          });
        })
      );

      svg.querySelectorAll(".attention-demo-token").forEach((token) => {
        const index = Number(token.dataset.token);

        token.classList.toggle("is-query", index === queryIndex);
        token.classList.toggle("is-strong", weights[index] >= 0.3);
      });

      svg.querySelectorAll(".attention-weight-bar").forEach((bar) => {
        const index = Number(bar.dataset.token);
        const weight = weights[index] || 0;

        bar.querySelector(".attention-weight-fill").setAttribute("width", String(56 * weight));
        bar.querySelector("text").textContent = weight.toFixed(2);
        bar.classList.toggle("is-strong", weight >= 0.3);
      });
    }

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];

      drawQuery(state.queryIndex, state.weights);
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

  function renderTransformerBlockDemo(panel) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const svg = createSvgElement("svg", {
      class: "transformer-demo-svg",
      viewBox: "0 0 720 260",
      role: "img",
      "aria-label": panel.title,
    });
    const blocks = [
      { key: "input", label: "X + P", x: 48, y: 104, width: 92, height: 54 },
      { key: "attention", label: "MHA", x: 190, y: 60, width: 108, height: 54 },
      { key: "norm1", label: "Add + Norm", x: 354, y: 60, width: 116, height: 54 },
      { key: "ffn", label: "FFN", x: 190, y: 166, width: 108, height: 54 },
      { key: "norm2", label: "Add + Norm", x: 354, y: 166, width: 116, height: 54 },
      { key: "output", label: "H_(l+1)", x: 548, y: 104, width: 112, height: 54 },
    ];

    blocks.forEach((block, index) => {
      const group = createSvgElement("g", {
        class: "transformer-demo-block",
        transform: `translate(${block.x} ${block.y})`,
        "data-stage": index,
      });

      group.append(
        createSvgElement("rect", { width: block.width, height: block.height, rx: 9 }),
        createSvgElement("text", { x: block.width / 2, y: block.height / 2 + 5, "text-anchor": "middle" })
      );
      setSvgMathText(group.querySelector("text"), block.label);
      svg.append(group);
    });

    [
      { d: "M 140 131 C 166 132, 170 87, 190 87", stage: 1 },
      { d: "M 298 87 L 354 87", stage: 2 },
      { d: "M 412 114 C 412 138, 314 152, 244 166", stage: 3 },
      { d: "M 298 193 L 354 193", stage: 4 },
      { d: "M 470 193 C 516 186, 520 142, 548 131", stage: 5 },
      { d: "M 140 131 C 230 138, 446 138, 548 131", stage: 6 },
    ].forEach((flow) => {
      svg.append(createSvgElement("path", { class: "transformer-demo-flow", d: flow.d, "data-stage": flow.stage }));
    });

    svg.append(
      createSvgElement("text", { class: "transformer-demo-note", x: 360, y: 36, "text-anchor": "middle" }),
      createSvgElement("text", { class: "transformer-demo-note", x: 360, y: 244, "text-anchor": "middle" })
    );
    svg.querySelectorAll(".transformer-demo-note")[0].textContent = "attention mixes tokens";
    svg.querySelectorAll(".transformer-demo-note")[1].textContent = "residual paths keep information moving";
    stage.append(svg);

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];

      svg.querySelectorAll("[data-stage]").forEach((item) => {
        const itemStage = Number(item.dataset.stage);

        item.classList.toggle("is-active", state.activeStages.includes(itemStage));
        item.classList.toggle("is-primary", itemStage === state.primaryStage);
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

    if (panel.type === "qml-flow") {
      renderQmlFlowDemo(panel);
      return;
    }

    if (panel.type === "attention-weights") {
      renderAttentionWeightsDemo(panel);
      return;
    }

    if (panel.type === "transformer-block") {
      renderTransformerBlockDemo(panel);
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

    const metricsPanel = elements.metricsView.closest(".metrics-panel");

    if (metricsPanel) {
      metricsPanel.classList.toggle("is-wide", Boolean(panel.isWide));
    }

    if (panel.snapshot) {
      const content = createElement("div", "project-final-snapshot");
      const header = createElement("div", "project-final-header");
      const cards = createElement("div", "project-analogy-grid project-application-grid");
      const detail = createElement("section", "project-application-detail");
      const list = createElement("div", "note-list");
      const snapshotCards = panel.snapshot.cards || [];

      header.append(
        createElement("span", "project-kicker", panel.snapshot.kicker || panel.label),
        createElement("h4", "", panel.snapshot.title || panel.title)
      );

      if (panel.snapshot.intro) {
        header.append(createElement("p", "", panel.snapshot.intro));
      }

      function renderDruCircuitGraphic() {
        const svg = createSvgElement("svg", {
          class: "dru-circuit-svg",
          viewBox: "0 0 920 360",
          role: "img",
          "aria-label": "DataReuploading circuit diagram",
        });
        const qubits = [
          { label: "q0", y: 86 },
          { label: "q1", y: 122 },
          { label: "q2", y: 158 },
          { label: "q3", y: 194 },
          { label: "q4", y: 230 },
          { label: "q5", y: 266 },
        ];
        const layerX = [318, 492, 666];

        svg.append(
          createSvgElement("text", { class: "dru-circuit-title", x: 70, y: 38 }),
          createSvgElement("text", { class: "dru-circuit-title", x: 316, y: 38 }),
          createSvgElement("text", { class: "dru-circuit-title", x: 704, y: 38 })
        );
        svg.querySelectorAll(".dru-circuit-title")[0].textContent = "selected classical inputs";
        svg.querySelectorAll(".dru-circuit-title")[1].textContent = "L reuploading layers";
        svg.querySelectorAll(".dru-circuit-title")[2].textContent = "measured features";

        svg.append(
          createSvgElement("rect", { class: "dru-circuit-stage", x: 52, y: 58, width: 172, height: 248, rx: 10 }),
          createSvgElement("rect", { class: "dru-circuit-stage", x: 262, y: 58, width: 474, height: 248, rx: 10 }),
          createSvgElement("rect", { class: "dru-circuit-stage", x: 770, y: 58, width: 104, height: 248, rx: 10 })
        );

        qubits.forEach((qubit, index) => {
          svg.append(
            createSvgElement("text", { class: "dru-circuit-label", x: 72, y: qubit.y + 5 }),
            createSvgElement("line", {
              class: "dru-qubit-line",
              x1: 132,
              y1: qubit.y,
              x2: 822,
              y2: qubit.y,
            }),
            createSvgElement("rect", { class: "dru-input-node", x: 96, y: qubit.y - 13, width: 52, height: 26, rx: 7 }),
            createSvgElement("text", { class: "dru-input-text", x: 122, y: qubit.y + 5, "text-anchor": "middle" })
          );
          svg.querySelectorAll(".dru-circuit-label")[index].textContent = qubit.label;
          svg.querySelectorAll(".dru-input-text")[index].textContent = `x${index}`;
        });

        layerX.forEach((x, layerIndex) => {
          svg.append(createSvgElement("text", { class: "dru-layer-label", x: x + 54, y: 72, "text-anchor": "middle" }));
          svg.querySelectorAll(".dru-layer-label")[layerIndex].textContent = `layer ${layerIndex + 1}`;

          qubits.forEach((qubit) => {
            const local = createSvgElement("g", { transform: `translate(${x} ${qubit.y - 14})` });

            local.append(
              createSvgElement("rect", { class: "dru-gate dru-data-gate", width: 58, height: 28, rx: 6 }),
              createSvgElement("text", { class: "dru-gate-text", x: 29, y: 18, "text-anchor": "middle" }),
              createSvgElement("rect", { class: "dru-gate dru-weight-gate", x: 66, width: 44, height: 28, rx: 6 }),
              createSvgElement("text", { class: "dru-gate-text", x: 88, y: 18, "text-anchor": "middle" })
            );
            local.querySelectorAll(".dru-gate-text")[0].textContent = "Rot(x)";
            local.querySelectorAll(".dru-gate-text")[1].textContent = "Rot(w)";
            svg.append(local);
          });

          qubits.slice(0, -1).forEach((qubit, index) => {
            const next = qubits[index + 1];
            const cx = x + 130;

            svg.append(
              createSvgElement("line", { class: "dru-entangle-line", x1: cx, y1: qubit.y, x2: cx, y2: next.y }),
              createSvgElement("circle", { class: "dru-control", cx, cy: qubit.y, r: 4 }),
              createSvgElement("circle", { class: "dru-target", cx, cy: next.y, r: 8 }),
              createSvgElement("line", { class: "dru-target-cross", x1: cx - 6, y1: next.y, x2: cx + 6, y2: next.y }),
              createSvgElement("line", { class: "dru-target-cross", x1: cx, y1: next.y - 6, x2: cx, y2: next.y + 6 })
            );
          });

          svg.append(
            createSvgElement("path", {
              class: "dru-ring-link",
              d: `M ${x + 130} ${qubits[5].y} C ${x + 164} 314, ${x + 164} 46, ${x + 130} ${qubits[0].y}`,
            })
          );
        });

        qubits.forEach((qubit, index) => {
          svg.append(
            createSvgElement("rect", { class: "dru-measure-node", x: 792, y: qubit.y - 13, width: 46, height: 26, rx: 7 }),
            createSvgElement("text", { class: "dru-input-text", x: 815, y: qubit.y + 5, "text-anchor": "middle" })
          );
          svg.querySelectorAll(".dru-input-text")[qubits.length + index].textContent = index < 3 ? "<Z>" : "<ZZ>";
        });

        svg.append(createSvgElement("text", { class: "dru-circuit-note", x: 460, y: 330, "text-anchor": "middle" }));
        svg.querySelector(".dru-circuit-note").textContent =
          "Rot(x) reuploads selected data; Rot(w) is trainable; CNOT links create ring interactions before measurement.";

        return svg;
      }

      function renderSnapshotDetail(card, index) {
        const title = createElement("h4", "", card.detailTitle || card.title);
        const intro = createElement("p", "", card.detailCopy || card.copy);
        const equations = createElement("div", "project-detail-equations");

        (card.detailEquations || []).forEach((entry) => {
          const equationCard = createElement("article", "math-step");
          const meta = createElement("span", "math-step-meta", entry.meta || "");
          const equationTitle = createElement("h4", "", entry.title || "");
          const equation = createElement("div", "step-equation");
          const copy = createElement("p", "", entry.copy || "");

          equation.innerHTML = entry.equationHtml || "";
          equationCard.append(meta, equationTitle, equation, copy);
          equations.append(equationCard);
        });

        detail.replaceChildren(title, intro);

        if (card.graphic === "dru-circuit") {
          const graphic = createElement("div", "project-detail-graphic");

          graphic.append(renderDruCircuitGraphic());
          detail.append(graphic);
        }

        if (card.graphicPlaceholder && card.graphic !== "dru-circuit") {
          const placeholder = createElement("div", "qml-demo-graphic-slot project-detail-placeholder");

          placeholder.append(createElement("span", "qml-demo-graphic-label", card.graphicPlaceholder));
          detail.append(placeholder);
        }

        if (card.detailEquations && card.detailEquations.length) {
          detail.append(equations);
        }

        cards.querySelectorAll("button").forEach((button, buttonIndex) => {
          button.classList.toggle("is-active", buttonIndex === index);
          button.setAttribute("aria-pressed", String(buttonIndex === index));
        });
      }

      snapshotCards.forEach((card, index) => {
        const item = createElement("button", "project-info-card project-application-button");
        const cardTitle = createElement("h4", "", card.title);
        const copy = createElement("p", "", card.copy);

        item.type = "button";
        item.setAttribute("aria-pressed", "false");
        item.addEventListener("click", () => renderSnapshotDetail(card, index));
        item.append(cardTitle);
        if (card.equationHtml) {
          const equation = createElement("div", "step-equation");

          equation.innerHTML = card.equationHtml;
          item.append(equation);
        }
        item.append(copy);
        cards.append(item);
      });

      if (panel.snapshot.formulaHtml) {
        const formula = createElement("div", "formula formula-hero");

        formula.innerHTML = panel.snapshot.formulaHtml;
        content.append(header, cards, detail, formula);
      } else {
        content.append(header, cards, detail);
      }

      (panel.points || []).forEach((point) => {
        list.append(createElement("span", "note-chip", point));
      });

      if (panel.points && panel.points.length) {
        content.append(list);
      }

      elements.metricsView.classList.add("is-content-view");
      elements.metricsView.replaceChildren(content);
      if (snapshotCards.length) {
        renderSnapshotDetail(snapshotCards[0], 0);
      }
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

  function getModelFromHash() {
    const modelId = location.hash.slice(1);

    return models.some((model) => model.id === modelId) ? modelId : "";
  }

  function getProjectHash(projectId) {
    return `qml-project-${projectId}`;
  }

  function getProjectFromHash() {
    const hash = location.hash.slice(1);
    const prefix = "qml-project-";

    if (!hash.startsWith(prefix)) {
      return "";
    }

    const projectId = hash.slice(prefix.length);
    return projects.some((project) => project.id === projectId) ? projectId : "";
  }

  function scrollToWorkspace(behavior = "smooth") {
    const workspace = document.getElementById("workspace");

    if (!workspace) {
      return;
    }

    const headerOffset = 88;
    const top = workspace.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior,
    });
  }

  function scrollToWorkspaceAfterLoad() {
    const run = () => {
      requestAnimationFrame(() => scrollToWorkspace("auto"));
      window.setTimeout(() => scrollToWorkspace("auto"), 80);
    };

    if (document.readyState === "complete") {
      run();
      return;
    }

    window.addEventListener("load", run, { once: true });
  }

  function bindModelLinks() {
    document.querySelectorAll("[data-model-link]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const modelId = link.dataset.modelLink;

        if (!modelId) {
          return;
        }

        event.preventDefault();
        setActiveModel(modelId, true);
        scrollToWorkspace();
      });
    });

    window.addEventListener("hashchange", () => {
      const projectId = getProjectFromHash();
      const modelId = getModelFromHash();

      if (projectId) {
        setActiveProject(projectId);
        scrollToWorkspace();
        return;
      }

      if (!modelId) {
        return;
      }

      setActiveModel(modelId);
      scrollToWorkspace();
    });
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

  function createProjectPanels(project) {
    const panels = project.panels || {};

    return {
      architecture: {
        summary: project.summary || project.placeholder || "QML project workspace.",
        diagram: {
          type: "qml-project-detail",
          projectId: project.id,
        },
        ...panels.architecture,
      },
      math: {
        label: project.mathLabel || "Project math",
        formula: "",
        terms: [],
        note: "",
        placeholder: project.mathPlaceholder || "Project math placeholder",
        ...panels.math,
      },
      demo: {
        label: project.demoLabel || "Project interactive view",
        type: "placeholder",
        title: project.demoTitle || "Project interactive view",
        description: project.demoDescription || "Interactive project view placeholder.",
        states: [],
        placeholder: project.demoPlaceholder || "Project interactive view placeholder",
        ...panels.demo,
      },
      controls: {
        label: project.controlsLabel || "Project sections",
        items: project.sections || ["Architecture", "Math", "Experiment"],
        ...panels.controls,
      },
      metrics: {
        label: project.metricsLabel || "Project status",
        title: project.metricsTitle || "Next content pass",
        points: project.points || ["Architecture pending", "Math pending", "Interactive demo pending"],
        placeholder: "Project status placeholder",
        ...panels.metrics,
      },
    };
  }

  function setActiveProject(projectId, shouldUpdateHash = false) {
    const project = projects.find((entry) => entry.id === projectId);

    if (!project) {
      return;
    }

    if (shouldUpdateHash) {
      history.replaceState(null, "", `#${getProjectHash(project.id)}`);
    }

    const panels = createProjectPanels(project);

    setText(elements.title, project.title);
    renderModelBrief(
      {
        year: project.year || project.label,
        overview: {
          what: project.summary || project.placeholder || "QML project workspace.",
          consists: project.relation || "Project-specific content will be added here.",
        },
      },
      panels
    );
    setText(elements.model, project.title);
    setText(elements.index, project.label);
    setText(elements.mathLabel, panels.math.label);
    setText(elements.demoLabel, panels.demo.label);
    setText(elements.controlsLabel, panels.controls.label);
    setText(elements.metricsLabel, panels.metrics.label);

    const back = createElement("button", "diagram-button project-header-back", "Back to QML Bridge");
    back.type = "button";
    back.addEventListener("click", () => {
      setActiveModel("qml-bridge", true);
      scrollToWorkspace();
    });
    elements.index.replaceChildren(back);

    renderArchitecturePanel(panels.architecture);
    renderMathPanel(panels.math);
    renderDemoPanel(panels.demo, panels.architecture);
    renderControlsPanel(panels.controls);
    renderMetricsPanel(panels.metrics);
    renderInsightStrip(panels);

    document.querySelectorAll(".timeline-item").forEach((item) => {
      const isQmlBridge = item.dataset.model === "qml-bridge";

      item.classList.toggle("is-active", isQmlBridge);
      item.setAttribute("aria-selected", String(isQmlBridge));
    });
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
  bindModelLinks();

  const initialProjectId = getProjectFromHash();
  const initialModelId = getModelFromHash();

  if (initialProjectId) {
    setActiveProject(initialProjectId);
    scrollToWorkspaceAfterLoad();
  } else {
    setActiveModel(initialModelId || models[0].id);

    if (initialModelId) {
      scrollToWorkspaceAfterLoad();
    }
  }
})();
