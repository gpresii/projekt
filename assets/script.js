
// ====== STAN ======
let memory = [];
let pc = 0;
let program = [];
let input = [];
let inputIndex = 0;
let output = [];
let outputIndex = 0;
let running = false;

// ====== INICJALIZACJA ======
function initMemory() {
  memory = [];
  for (let i = 0; i < 10; i++) {
    memory[i] = 0;
  }
}

function initInputTable() {
  const row = document.getElementById("inputRow");
  row.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const cell = document.createElement("td");
    cell.contentEditable = true;
    row.appendChild(cell);
  }
}

function initProgramTable() {
  const tbody = document.getElementById("programBody");
  tbody.innerHTML = "";

  const instructions = [
    "LOAD",
    "STORE",
    "ADD",
    "SUB",
    "MULT",
    "DIV",
    "READ",
    "WRITE",
    "JUMP",
    "HALT"
  ];

  for (let i = 0; i < 10; i++) {
    const row = tbody.insertRow();

    const c0 = row.insertCell();
    c0.innerText = i;

    const c1 = row.insertCell();
    c1.contentEditable = true;
    c1.innerText = "opis";

    const c2 = row.insertCell();
    c2.contentEditable = true;
    c2.innerText = instructions[i];

    const c3 = row.insertCell();
    c3.contentEditable = true;
    c3.innerText = (instructions[i] === "WRITE" || instructions[i] === "HALT") ? "" : "=0";
  }
}

// ====== WCZYTYWANIE ======
function loadProgram() {
  const rows = document.querySelectorAll("#programBody tr");
  program = [];

  rows.forEach(r => {
    const c = r.cells;
    program.push({
      label: c[1].innerText.trim(),
      instr: c[2].innerText.trim().toUpperCase(),
      arg: c[3].innerText.trim()
    });
  });

  input = [];
  const cells = document.querySelectorAll("#inputRow td");

  cells.forEach(td => {
    const val = td.innerText.trim();
    if (val !== "") input.push(parseInt(val));
  });

  inputIndex = 0;
}

// ====== OPERANDY ======
function getVal(a) {
  if (!a) return 0;

  if (a.startsWith("=")) return parseInt(a.slice(1));

  if (a.startsWith("^")) {
    const addr = memory[parseInt(a.slice(1))] || 0;
    return memory[addr] || 0;
  }

  return memory[parseInt(a)] || 0;
}

// ====== KROK ======
function step() {
  if (pc >= program.length || !running) return;

  const { instr, arg } = program[pc];

  document.getElementById("instr").innerText = instr;
  document.getElementById("arg").innerText = arg || "-";

  switch (instr) {

    case "LOAD":
      memory[0] = getVal(arg);
      break;

    case "STORE":
      memory[parseInt(arg)] = memory[0];
      break;

    case "ADD":
      memory[0] += getVal(arg);
      break;

    case "SUB":
      memory[0] -= getVal(arg);
      break;

    case "MULT":
      memory[0] *= getVal(arg);
      break;

    case "DIV":
      memory[0] = Math.floor(memory[0] / getVal(arg));
      break;

    case "READ":
      memory[parseInt(arg)] = input[inputIndex++] ?? 0;
      break;

    case "WRITE":
      output[outputIndex++] = memory[0];
      break;

    case "JUMP":
      pc = findLabel(arg);
      render();
      return;

    case "JGTZ":
      if (memory[0] > 0) {
        pc = findLabel(arg);
        render();
        return;
      }
      break;

    case "JZERO":
      if (memory[0] === 0) {
        pc = findLabel(arg);
        render();
        return;
      }
      break;

    case "HALT":
      running = false; // 🔥 zatrzymanie programu
      return;
  }

  pc++;
  render();
}

// ====== LABEL ======
function findLabel(label) {
  return program.findIndex(p => p.label === label);
}

// ====== RUN ======
function run() {
  loadProgram();
  running = true;

  function loop() {
    if (!running) return;
    step();
    setTimeout(loop, 300);
  }

  loop();
}

// ====== RESET ======
function reset() {
  running = false; // 🔥 kluczowa poprawka

  pc = 0;
  output = [];
  outputIndex = 0;

  initMemory();
  render();
}

// ====== RENDER ======
function render() {
  const tbody = document.querySelector("#memory tbody");
  tbody.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const row = tbody.insertRow();

    const c1 = row.insertCell();
    const c2 = row.insertCell();

    c1.innerText = i;
    c2.innerText = memory[i];

    if (i === 0) row.classList.add("acc");
  }

  const out = document.getElementById("outputTape");
  out.innerHTML = "";

  for (let i = 0; i < output.length; i++) {
    out.innerHTML += `[${i + 1}: ${output[i]}] `;
  }
}

// ====== START ======
initMemory();
initInputTable();
initProgramTable();
render();