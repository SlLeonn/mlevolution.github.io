(function () {
  const namespace = (window.MLEvolution = window.MLEvolution || {});

  const defaultPanels = {
    architecture: {
      summary: "",
      diagram: null,
      placeholder: "Architecture placeholder",
    },
    math: {
      label: "Core form",
      formula: "",
      terms: [],
      note: "",
      placeholder: "Math placeholder",
    },
    demo: {
      label: "Interactive demo",
      type: "placeholder",
      title: "",
      description: "",
      states: [],
      placeholder: "Interactive demo placeholder",
    },
    controls: {
      label: "Future inputs",
      items: ["Start", "Reset", "Dataset", "Learning rate"],
    },
    metrics: {
      label: "Training chart",
      title: "",
      points: [],
      placeholder: "Metrics chart placeholder",
    },
  };

  namespace.models = namespace.models || [];
  namespace.projects = namespace.projects || [];

  namespace.createModel = function createModel(config) {
    const panels = config.panels || {};

    if (!config.id || !config.title || !Number.isFinite(config.order)) {
      throw new Error("Model files must define id, title, and numeric order.");
    }

    return {
      id: config.id,
      order: config.order,
      title: config.title,
      year: config.year || "TBD",
      overview: {
        what: "This module is ready for the next content pass.",
        consists: "Its architecture, math, and demo slots are already wired into the page.",
        ...config.overview,
      },
      panels: {
        architecture: {
          ...defaultPanels.architecture,
          ...panels.architecture,
        },
        math: {
          ...defaultPanels.math,
          ...panels.math,
        },
        demo: {
          ...defaultPanels.demo,
          ...panels.demo,
        },
        controls: {
          ...defaultPanels.controls,
          ...panels.controls,
        },
        metrics: {
          ...defaultPanels.metrics,
          ...panels.metrics,
        },
      },
    };
  };

  namespace.registerModel = function registerModel(model) {
    const duplicate = namespace.models.some((entry) => entry.id === model.id);

    if (duplicate) {
      throw new Error(`Duplicate model id: ${model.id}`);
    }

    namespace.models.push(model);
  };

  namespace.registerProject = function registerProject(project) {
    if (!project.id || !project.title || !project.label) {
      throw new Error("Project files must define id, title, and label.");
    }

    namespace.projects.push({
      placeholder: "QML project placeholder",
      ...project,
    });
  };
})();
