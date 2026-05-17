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


// ===== AKTUALIZACJA LP =====

function aktualizujLP() {

    const rows =
        document.querySelectorAll(
            "#programBody tr"
        );

    rows.forEach((row, index) => {

        row.cells[0].innerText =
            index + 1;
    });
}


// ===== USUWANIE WIERSZA =====

function usunWiersz(btn) {

    const row =
        btn.parentElement.parentElement;

    row.remove();

    aktualizujLP();
}


// ===== DODAWANIE WIERSZA =====

function dodajWiersz() {

    const tbody =
        document.getElementById(
            "programBody"
        );

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


    // AKCJE

    const c5 = row.insertCell();


    // +

    const addBtn =
        document.createElement("button");

    addBtn.innerText = "+";

    addBtn.addEventListener(
        "click",
        dodajWiersz
    );

    c5.appendChild(addBtn);


    // -

    const delBtn =
        document.createElement("button");

    delBtn.innerText = "-";

    delBtn.style.marginLeft = "5px";

    delBtn.addEventListener(
        "click",
        () => usunWiersz(delBtn)
    );

    c5.appendChild(delBtn);
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
                document.getElementById(
                    `in${i}`
                ).value
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
                parseInt(
                    arg.slice(1)
                )
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

            const divVal =
                getVal(arg);

            if (divVal === 0) {

                alert(
                    "Dzielenie przez zero!"
                );

                running = false;

                return;
            }

            memory[0] = Math.floor(
                memory[0] / divVal
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

            if (!arg) {

                alert(
                    "WRITE wymaga argumentu!"
                );

                running = false;

                return;
            }

            if (outputIndex < 10) {

                document.getElementById(
                    `out${outputIndex}`
                ).value =
                    getVal(arg);

                outputIndex++;
            }

            break;


        case "JUMP":

            const jumpTarget =
                findLabel(arg);

            if (jumpTarget === -1) {

                alert(
                    "Nie znaleziono etykiety: "
                    + arg
                );

                running = false;

                return;
            }

            pc = jumpTarget;

            render();

            return;


        case "JGTZ":

            if (memory[0] > 0) {

                const gtzTarget =
                    findLabel(arg);

                if (gtzTarget === -1) {

                    alert(
                        "Nie znaleziono etykiety: "
                        + arg
                    );

                    running = false;

                    return;
                }

                pc = gtzTarget;

                render();

                return;
            }

            break;


        case "JZERO":

            if (memory[0] === 0) {

                const zeroTarget =
                    findLabel(arg);

                if (zeroTarget === -1) {

                    alert(
                        "Nie znaleziono etykiety: "
                        + arg
                    );

                    running = false;

                    return;
                }

                pc = zeroTarget;

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


        if (i === 0) {

            row.classList.add("acc");
        }
    }


    // PODŚWIETLENIE AKTUALNEJ LINII

    const rows =
        document.querySelectorAll(
            "#programBody tr"
        );

    rows.forEach((r, i) => {

        r.style.backgroundColor =
            (i === pc)
            ? "yellow"
            : "white";
    });
}


// ===== ZAPIS PROGRAMU =====

function saveProgram() {

    loadProgram();

    const name = prompt(
        "Podaj nazwę programu:"
    );

    if (!name) return;

    const data = JSON.stringify(
        program,
        null,
        2
    );

    const blob = new Blob(
        [data],
        { type: "text/plain" }
    );

    const a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download = `${name}.txt`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(a.href);
}


// ===== WCZYTAJ PROGRAM =====

function loadSavedProgram() {

    const inputFile =
        document.createElement("input");

    inputFile.type = "file";

    inputFile.accept = ".txt,.json";

    inputFile.onchange = e => {

        const file =
            e.target.files[0];

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload = event => {

            try {

                const data =
                    JSON.parse(
                        event.target.result
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
                        .value =
                            p.comment || "";
                });

                aktualizujLP();

            } catch {

                alert(
                    "Błędny plik programu!"
                );
            }
        };

        reader.readAsText(file);
    };

    inputFile.click();
}


// ===== PRZYCISKI =====

document.getElementById("runBtn")
    .addEventListener(
        "click",
        () => {

            if (running) return;

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
