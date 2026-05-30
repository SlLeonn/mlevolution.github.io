const models = [
  { id: "perceptron", title: "Perceptron", index: "01 / 09" },
  { id: "mlp", title: "MLP", index: "02 / 09" },
  { id: "cnn", title: "CNN", index: "03 / 09" },
  { id: "rnn", title: "RNN", index: "04 / 09" },
  { id: "lstm-gru", title: "LSTM / GRU", index: "05 / 09" },
  { id: "seq2seq", title: "Seq2Seq", index: "06 / 09" },
  { id: "attention", title: "Attention", index: "07 / 09" },
  { id: "transformer", title: "Transformer", index: "08 / 09" },
  { id: "qml-bridge", title: "Quantum ML Bridge", index: "09 / 09" },
];

const titleNode = document.querySelector("[data-active-title]");
const modelNode = document.querySelector("[data-active-model]");
const indexNode = document.querySelector("[data-active-index]");
const timelineItems = document.querySelectorAll(".timeline-item");

function setActiveModel(modelId) {
  const activeModel = models.find((model) => model.id === modelId);

  if (!activeModel) {
    return;
  }

  titleNode.textContent = activeModel.title;
  modelNode.textContent = activeModel.title;
  indexNode.textContent = activeModel.index;

  timelineItems.forEach((item) => {
    const isActive = item.dataset.model === modelId;

    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });
}

timelineItems.forEach((item) => {
  item.addEventListener("click", () => {
    setActiveModel(item.dataset.model);
  });
});
