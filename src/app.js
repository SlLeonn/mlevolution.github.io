(function () {
  const namespace = window.MLEvolution || {};
  const models = [...(namespace.models || [])].sort((a, b) => a.order - b.order);
  const projects = namespace.projects || [];
  const svgNamespace = "http://www.w3.org/2000/svg";

  const elements = {
    timeline: document.querySelector("[data-timeline]"),
    title: document.querySelector("[data-active-title]"),
    modelBrief: document.querySelector("[data-model-brief]"),
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
        x,
        y: startY + yGap * nodeIndex,
      }));
    });

    nodeMap.slice(0, -1).forEach((layer, layerIndex) => {
      layer.forEach((fromNode) => {
        nodeMap[layerIndex + 1].forEach((toNode) => {
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
          class: "network-node",
          transform: `translate(${node.x} ${node.y})`,
          "data-layer": layerIndex,
        });

        group.append(
          createSvgElement("circle", { r: 18 }),
          createSvgElement("text", { y: 5, "text-anchor": "middle" })
        );
        group.querySelector("text").textContent = node.label;
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
      caption.textContent = `${layers[layerIndex].label}: ${layers[layerIndex].nodes.join(", ")}`;
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

  function renderSequenceArchitecture(panel) {
    const diagram = panel.diagram;
    const shell = createElement("div", "sequence-architecture");
    const svg = createSvgElement("svg", {
      class: "sequence-svg",
      viewBox: "0 0 640 260",
      role: "img",
      "aria-label": panel.summary,
    });
    const controls = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", panel.summary);
    const tokens = diagram.tokens;
    const tokenGap = 500 / (tokens.length - 1);

    svg.append(
      createSvgElement("path", {
        class: "sequence-ribbon",
        d: "M 76 132 C 180 54, 304 54, 412 132 S 536 210, 592 132",
      }),
      createSvgElement("path", {
        class: "sequence-ribbon-muted",
        d: "M 120 86 C 106 44, 178 44, 164 86",
      })
    );

    tokens.forEach((token, index) => {
      const x = 70 + tokenGap * index;
      const y = index % 2 === 0 ? 132 : 92;
      const group = createSvgElement("g", {
        class: "sequence-node",
        transform: `translate(${x} ${y})`,
        "data-step": index,
      });

      group.append(
        createSvgElement("circle", { r: 26 }),
        createSvgElement("text", { y: 5, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = token;
      svg.append(group);

      const button = createElement("button", "diagram-button", token);
      button.type = "button";
      button.addEventListener("click", () => activateStep(index));
      controls.append(button);
    });

    const cell = createSvgElement("text", {
      class: "flow-label",
      x: 320,
      y: 222,
      "text-anchor": "middle",
    });
    cell.textContent = diagram.cell;
    svg.append(cell);

    function activateStep(stepIndex) {
      svg.querySelectorAll(".sequence-node").forEach((node) => {
        const nodeStep = Number(node.dataset.step);
        node.classList.toggle("is-active", nodeStep <= stepIndex);
        node.classList.toggle("is-current", nodeStep === stepIndex);
      });
      controls.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === stepIndex);
      });
      caption.textContent = `${diagram.output} carries context after step ${stepIndex + 1}.`;
    }

    shell.append(svg, controls, caption);
    elements.architectureView.replaceChildren(shell);
    activateStep(0);
  }

  function renderGateArchitecture(panel) {
    const diagram = panel.diagram;
    const shell = createElement("div", "gate-architecture");
    const svg = createSvgElement("svg", {
      class: "gate-svg",
      viewBox: "0 0 640 260",
      role: "img",
      "aria-label": panel.summary,
    });
    const gates = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", panel.summary);

    svg.append(
      createSvgElement("path", {
        class: "memory-stream",
        d: "M 70 130 C 180 58, 300 58, 420 130 S 548 202, 590 130",
      }),
      createSvgElement("text", {
        class: "flow-label",
        x: 320,
        y: 45,
        "text-anchor": "middle",
      })
    );
    svg.querySelector("text").textContent = diagram.memory;

    diagram.gates.forEach((gate, index) => {
      const x = 170 + index * 150;
      const group = createSvgElement("g", {
        class: "gate-node",
        transform: `translate(${x} 130)`,
        "data-gate": index,
      });
      const button = createElement("button", "diagram-button", gate);

      group.append(
        createSvgElement("circle", { r: 34 }),
        createSvgElement("path", { class: "gate-spark", d: "M -13 0 L -3 10 L 15 -13" }),
        createSvgElement("text", { y: 62, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = gate;
      svg.append(group);
      button.type = "button";
      button.addEventListener("click", () => activateGate(index));
      gates.append(button);
    });

    function activateGate(gateIndex) {
      svg.querySelectorAll(".gate-node").forEach((gate) => {
        gate.classList.toggle("is-active", Number(gate.dataset.gate) === gateIndex);
      });
      gates.querySelectorAll("button").forEach((button, buttonIndex) => {
        button.classList.toggle("is-active", buttonIndex === gateIndex);
      });
      caption.textContent = `${diagram.gates[gateIndex]} gate controls how memory moves forward.`;
    }

    shell.append(svg, gates, caption);
    elements.architectureView.replaceChildren(shell);
    activateGate(0);
  }

  function renderSeq2SeqArchitecture(panel) {
    const diagram = panel.diagram;
    const shell = createElement("div", "seq2seq-architecture");
    const svg = createSvgElement("svg", {
      class: "seq2seq-svg",
      viewBox: "0 0 640 260",
      role: "img",
      "aria-label": panel.summary,
    });
    const controls = createElement("div", "diagram-controls");
    const caption = createElement("p", "diagram-caption", panel.summary);

    svg.append(
      createSvgElement("path", {
        class: "encoder-flow",
        d: "M 78 84 C 148 42, 218 58, 284 126",
        "data-phase": 0,
      }),
      createSvgElement("path", {
        class: "decoder-flow",
        d: "M 356 126 C 424 58, 500 42, 566 84",
        "data-phase": 2,
      }),
      createSvgElement("circle", { class: "context-orbit", cx: 320, cy: 130, r: 38, "data-phase": 1 })
    );

    diagram.source.forEach((token, index) => {
      svg.append(createSeqNode(token, 70 + index * 54, 84 + (index % 2) * 42, "source"));
    });
    diagram.target.forEach((token, index) => {
      svg.append(createSeqNode(token, 420 + index * 48, 84 + (index % 2) * 42, "target"));
    });

    const context = createSvgElement("text", {
      class: "context-label",
      x: 320,
      y: 136,
      "text-anchor": "middle",
      "data-phase": 1,
    });
    context.textContent = diagram.bridge;
    svg.append(context);

    ["Encoder", "Context", "Decoder"].forEach((label, phaseIndex) => {
      const button = createElement("button", "diagram-button", label);

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
      caption.textContent = ["Encoder reads x_1...x_T.", "Context z carries the compressed source.", "Decoder writes y_1...y_S."][
        phaseIndex
      ];
    }

    shell.append(svg, controls, caption);
    elements.architectureView.replaceChildren(shell);
    activatePhase(1);
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

    formula.innerHTML = panel.formulaHtml || panel.formula;

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
    const region = createSvgElement("path", { class: "boundary-region" });
    const path = createSvgElement("path", { class: "boundary-line" });
    const pointGroup = createSvgElement("g", { class: "point-group" });

    svg.append(
      createSvgElement("rect", { class: "boundary-plane", x: 0, y: 0, width: 100, height: 100 }),
      region,
      path,
      pointGroup
    );
    stage.append(svg);

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];

      region.setAttribute("d", state.regionPath || "");
      path.setAttribute("d", state.path);
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
    activateState(0);
  }

  function renderSequenceDemo(panel, architecture) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const tokens = architecture.diagram.tokens || [];
    const svg = createSvgElement("svg", {
      class: "sequence-demo-svg",
      viewBox: "0 0 640 190",
      role: "img",
      "aria-label": panel.title,
    });
    const activeRibbon = createSvgElement("path", {
      class: "sequence-active-ribbon",
      d: "M 78 96 C 180 34, 302 34, 406 96 S 536 158, 592 96",
    });

    svg.append(
      createSvgElement("path", {
        class: "sequence-ribbon",
        d: "M 78 96 C 180 34, 302 34, 406 96 S 536 158, 592 96",
      }),
      activeRibbon
    );

    tokens.forEach((token, index) => {
      const x = 76 + (500 / (tokens.length - 1)) * index;
      const y = index % 2 === 0 ? 96 : 66;
      const node = createSeqNode(token, x, y, "source");

      node.dataset.step = String(index);
      svg.append(node);
    });

    stage.append(svg);

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];

      svg.querySelectorAll(".seq-node").forEach((token) => {
        const tokenIndex = Number(token.dataset.step);
        token.classList.toggle("is-active", tokenIndex <= state.activeStep);
        token.classList.toggle("is-current", tokenIndex === state.activeStep);
      });
      activeRibbon.style.strokeDashoffset = String(260 - state.activeStep * 82);
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
    activateState(0);
  }

  function renderGateDemo(panel, architecture) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const gates = architecture.diagram.gates || [];
    const svg = createSvgElement("svg", {
      class: "gate-demo-svg",
      viewBox: "0 0 640 190",
      role: "img",
      "aria-label": panel.title,
    });

    svg.append(
      createSvgElement("path", {
        class: "memory-stream",
        d: "M 62 94 C 180 28, 318 28, 440 94 S 558 160, 592 94",
      }),
      createSvgElement("path", {
        class: "gate-flow-line",
        d: "M 130 142 C 238 106, 390 106, 506 142",
      })
    );

    gates.forEach((gate, index) => {
      const group = createSvgElement("g", {
        class: "gate-node",
        transform: `translate(${170 + index * 150} 94)`,
        "data-gate": index,
      });

      group.append(
        createSvgElement("circle", { r: 30 }),
        createSvgElement("text", { y: 5, "text-anchor": "middle" })
      );
      group.querySelector("text").textContent = gate;
      svg.append(group);
    });

    stage.append(svg);

    function activateState(stateIndex) {
      const state = panel.states[stateIndex];

      svg.querySelectorAll(".gate-node").forEach((gate, gateIndex) => {
        gate.classList.toggle("is-active", gateIndex === state.activeGate);
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
    activateState(0);
  }

  function renderEncoderDecoderDemo(panel, architecture) {
    const { shell, stage, buttons, caption } = createDemoShell(panel);
    const diagram = architecture.diagram;
    const svg = createSvgElement("svg", {
      class: "seq2seq-demo-svg",
      viewBox: "0 0 640 210",
      role: "img",
      "aria-label": panel.title,
    });

    svg.append(
      createSvgElement("path", {
        class: "encoder-flow",
        d: "M 80 74 C 154 30, 226 48, 288 104",
        "data-phase": 0,
      }),
      createSvgElement("path", {
        class: "context-pulse",
        d: "M 292 104 C 312 88, 332 88, 352 104",
        "data-phase": 1,
      }),
      createSvgElement("path", {
        class: "decoder-flow",
        d: "M 352 104 C 422 48, 502 30, 566 74",
        "data-phase": 2,
      }),
      createSvgElement("circle", { class: "context-orbit", cx: 320, cy: 108, r: 34, "data-phase": 1 })
    );

    diagram.source.forEach((token, index) => {
      svg.append(createSeqNode(token, 76 + index * 54, 74 + (index % 2) * 42, "source"));
    });
    diagram.target.forEach((token, index) => {
      svg.append(createSeqNode(token, 420 + index * 48, 74 + (index % 2) * 42, "target"));
    });

    const context = createSvgElement("text", {
      class: "context-label",
      x: 320,
      y: 114,
      "text-anchor": "middle",
      "data-phase": 1,
    });
    context.textContent = "z";
    svg.append(context);
    stage.append(svg);

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
    activateState(0);
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
      setActiveModel(model.id);
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

  function renderModelBrief(model) {
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
  }

  function setActiveModel(modelId) {
    const activeIndex = models.findIndex((model) => model.id === modelId);
    const activeModel = models[activeIndex];

    if (!activeModel) {
      return;
    }

    const panels = activeModel.panels;

    setText(elements.title, activeModel.title);
    renderModelBrief(activeModel);
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
  setActiveModel(models[0].id);
})();
