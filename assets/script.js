// ===== STAN =====

let memory = [];
let pc = 0;
let running = false;

let program = [];

let input = [];
let inputIndex = 0;

let outputIndex = 0;


// ===== INICJALIZACJA =====

function initMemory() {

    memory = [];

    for (let i = 0; i < 10; i++) {
        memory[i] = 0;
    }
}


// ===== DODAWANIE WIERSZA =====

function dodajWiersz() {

    const tbody =
        document.getElementById("programBody");

    const row = tbody.insertRow();

    const lp = tbody.rows.length;

    // LP

    const c0 = row.insertCell();

    c0.innerText = lp;


    // ETYKIETA

    const c1 = row.insertCell();

    c1.innerHTML = `
        <input type="text">
    `;


    // INSTRUKCJA

    const c2 = row.insertCell();

    c2.innerHTML = `
        <select>
            <option value="LOAD">LOAD</option>
            <option value="STORE">STORE</option>
            <option value="STORE^">STORE^</option>
            <option value="ADD">ADD</option>
            <option value="SUB">SUB</option>
            <option value="MULT">MULT</option>
            <option value="DIV">DIV</option>
            <option value="READ">READ</option>
            <option value="READ^">READ^</option>
            <option value="WRITE">WRITE</option>
            <option value="JUMP">JUMP</option>
            <option value="JGTZ">JGTZ</option>
            <option value="JZERO">JZERO</option>
            <option value="HALT">HALT</option>
        </select>
    `;


    // PARAMETR

    const c3 = row.insertCell();

    c3.innerHTML = `
        <input type="text">
    `;


    // KOMENTARZ

    const c4 = row.insertCell();

    c4.innerHTML = `
        <input type="text">
    `;


    // +

    const c5 = row.insertCell();

    const btn = document.createElement("button");

    btn.innerText = "+";

    btn.addEventListener(
        "click",
        dodajWiersz
    );

    c5.appendChild(btn);

}


// ===== ŁADOWANIE PROGRAMU =====

function loadProgram() {

    program = [];

    const rows =
        document.querySelectorAll(
            "#programBody tr"
        );

    rows.forEach(row => {

        const cells = row.cells;

        program.push({

            label:
                cells[1]
                .querySelector("input")
                .value,

            instr:
                cells[2]
                .querySelector("select")
                .value
                .toUpperCase(),

            arg:
                cells[3]
                .querySelector("input")
                .value,

            comment:
                cells[4]
                .querySelector("input")
                .value

        });

    });


    // INPUT

    input = [];

    for (let i = 0; i < 10; i++) {

        input.push(

            parseInt(
                document.getElementById(`in${i}`).value
            ) || 0

        );

    }

    inputIndex = 0;
}


// ===== OPERAND =====

function getVal(arg) {

    if (!arg) return 0;

    // =5

    if (arg.startsWith("=")) {

        return parseInt(
            arg.slice(1)
        );

    }

    // ^2

    if (arg.startsWith("^")) {

        const addr =
            memory[
                parseInt(arg.slice(1))
            ] || 0;

        return memory[addr] || 0;
    }

    // 2

    return memory[
        parseInt(arg)
    ] || 0;
}


// ===== LABEL =====

function findLabel(label) {

    return program.findIndex(
        p => p.label === label
    );

}


// ===== KROK =====

function step() {

    if (!running) return;

    if (pc >= program.length) {

        running = false;

        return;
    }

    const instr =
        program[pc].instr;

    const arg =
        program[pc].arg;


    document.getElementById("instr")
        .innerText = instr;

    document.getElementById("arg")
        .innerText = arg || "-";


    switch (instr) {

        case "LOAD":

            memory[0] =
                getVal(arg);

            break;


        case "STORE":

            memory[
                parseInt(arg)
            ] = memory[0];

            break;


        case "STORE^":

            const storeAddr =
                memory[
                    parseInt(arg)
                ] || 0;

            memory[storeAddr] =
                memory[0];

            break;


        case "ADD":

            memory[0] +=
                getVal(arg);

            break;


        case "SUB":

            memory[0] -=
                getVal(arg);

            break;


        case "MULT":

            memory[0] *=
                getVal(arg);

            break;


        case "DIV":

            memory[0] = Math.floor(
                memory[0] /
                getVal(arg)
            );

            break;


        case "READ":

            memory[
                parseInt(arg)
            ] =
                input[inputIndex++] ?? 0;

            break;


        case "READ^":

            const readAddr =
                memory[
                    parseInt(arg)
                ] || 0;

            memory[readAddr] =
                input[inputIndex++] ?? 0;

            break;


        case "WRITE":

            if (outputIndex < 10) {

                document.getElementById(
                    `out${outputIndex}`
                ).value = memory[0];

                outputIndex++;
            }

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

            running = false;

            render();

            return;
    }

    pc++;

    render();
}


// ===== RUN =====

function run() {

    function loop() {

        if (!running) return;

        step();

        setTimeout(loop, 300);
    }

    loop();
}


// ===== RESET =====

function reset() {

    running = false;

    pc = 0;

    inputIndex = 0;

    outputIndex = 0;

    initMemory();


    // RESET OUTPUT

    for (let i = 0; i < 10; i++) {

        document.getElementById(
            `out${i}`
        ).value = "";

    }

    render();

    document.getElementById("instr")
        .innerText = "-";

    document.getElementById("arg")
        .innerText = "-";
}


// ===== RENDER =====

function render() {

    const tbody =
        document.getElementById(
            "memoryBody"
        );

    tbody.innerHTML = "";


    for (let i = 0; i < 10; i++) {

        const row = tbody.insertRow();

        const c1 = row.insertCell();

        const c2 = row.insertCell();

        c1.innerText = i;

        c2.innerText = memory[i];


        // AKUMULATOR

        if (i === 0) {

            row.classList.add("acc");

        }

    }

}


// ===== ZAPIS PROGRAMU =====

function saveProgram() {

    loadProgram();

    const name = prompt(
        "Podaj nazwę programu:"
    );

    if (!name) return;


    localStorage.setItem(

        `ram_${name}`,

        JSON.stringify(program)

    );

    alert("Program zapisany.");

}


// ===== WCZYTAJ PROGRAM =====

function loadSavedProgram() {

    const keys =
        Object.keys(localStorage)
        .filter(
            k => k.startsWith("ram_")
        );


    if (keys.length === 0) {

        alert(
            "Brak zapisanych programów."
        );

        return;
    }


    let list =
        "Zapisane programy:\n\n";


    keys.forEach((k, i) => {

        list +=
            `${i + 1}. `
            + k.replace("ram_", "")
            + "\n";

    });


    const nr = prompt(
        list +
        "\nPodaj numer programu:"
    );


    const key =
        keys[parseInt(nr) - 1];


    if (!key) return;


    const data = JSON.parse(
        localStorage.getItem(key)
    );


    const tbody =
        document.getElementById(
            "programBody"
        );


    tbody.innerHTML = "";


    data.forEach(p => {

        dodajWiersz();

        const row =
            tbody.rows[
                tbody.rows.length - 1
            ];


        row.cells[1]
            .querySelector("input")
            .value = p.label;


        row.cells[2]
            .querySelector("select")
            .value = p.instr;


        row.cells[3]
            .querySelector("input")
            .value = p.arg;


        row.cells[4]
            .querySelector("input")
            .value = p.comment || "";

    });

}


// ===== PRZYCISKI =====

document.getElementById("runBtn")
    .addEventListener(
        "click",
        () => {

            loadProgram();

            running = true;

            run();

        }
    );


document.getElementById("stepBtn")
    .addEventListener(
        "click",
        () => {

            if (!running) {

                loadProgram();

                running = true;

            }

            step();

        }
    );


document.getElementById("resetBtn")
    .addEventListener(
        "click",
        reset
    );


document.getElementById("saveBtn")
    .addEventListener(
        "click",
        saveProgram
    );


document.getElementById("loadBtn")
    .addEventListener(
        "click",
        loadSavedProgram
    );


// ===== START =====

initMemory();

dodajWiersz();

render();
