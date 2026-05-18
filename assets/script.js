// script.js

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


// ===== SLEEP =====

function sleep(ms) {

    return new Promise(

        resolve => setTimeout(
            resolve,
            ms
        )
    );
}


// ===== ŚRODEK ELEMENTU =====

function getCenter(el) {

    const rect =
        el.getBoundingClientRect();

    return {

        x:
            rect.left +
            rect.width / 2,

        y:
            rect.top +
            rect.height / 2
    };
}


// ===== MEMORY ROW =====

function getMemoryRow(index) {

    return document.querySelectorAll(
        "#memoryBody tr"
    )[index];
}


// ===== ANIMACJA =====

async function animateValue(
    fromEl,
    toEl,
    value
) {

    const start =
        getCenter(fromEl);

    const end =
        getCenter(toEl);

    const fly =
        document.createElement("div");

    fly.className =
        "fly-value";

    fly.innerText = value;

    fly.style.left =
        start.x + "px";

    fly.style.top =
        start.y + "px";

    document.body.appendChild(fly);

    await sleep(30);

    fly.style.left =
        end.x + "px";

    fly.style.top =
        end.y + "px";

    await sleep(650);

    fly.remove();
}


// ===== PODŚWIETLENIA =====

function updateTapeHighlights() {

    for (let i = 0; i < 10; i++) {

        document.getElementById(
            `in${i}`
        ).classList.remove(
            "active-input"
        );

        document.getElementById(
            `out${i}`
        ).classList.remove(
            "active-output"
        );
    }

    if (inputIndex < 10) {

        document.getElementById(
            `in${inputIndex}`
        ).classList.add(
            "active-input"
        );
    }

    if (outputIndex < 10) {

        document.getElementById(
            `out${outputIndex}`
        ).classList.add(
            "active-output"
        );
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


// ===== USUŃ WIERSZ =====

function usunWiersz(btn) {

    const row =
        btn.parentElement.parentElement;

    row.remove();

    aktualizujLP();
}


// ===== DODAJ WIERSZ =====

function dodajWiersz() {

    const tbody =
        document.getElementById(
            "programBody"
        );

    const row =
        tbody.insertRow();

    const lp =
        tbody.rows.length;


    // LP

    const c0 =
        row.insertCell();

    c0.innerText = lp;


    // ETYKIETA

    const c1 =
        row.insertCell();

    c1.innerHTML =
        `<input type="text">`;


    // INSTRUKCJA

    const c2 =
        row.insertCell();

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

    const c3 =
        row.insertCell();

    c3.innerHTML =
        `<input type="text">`;


    // KOMENTARZ

    const c4 =
        row.insertCell();

    c4.innerHTML =
        `<input type="text">`;


    // AKCJE

    const c5 =
        row.insertCell();


    // +

    const addBtn =
        document.createElement(
            "button"
        );

    addBtn.innerText = "+";

    addBtn.addEventListener(
        "click",
        dodajWiersz
    );

    c5.appendChild(addBtn);


    // -

    const delBtn =
        document.createElement(
            "button"
        );

    delBtn.innerText = "-";

    delBtn.style.marginLeft =
        "5px";

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
        ) || 0;
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


// ===== STEP =====

async function step() {

    if (!running) return;

    if (pc >= program.length) {

        running = false;

        return;
    }

    const instr =
        program[pc].instr;

    const arg =
        program[pc].arg;


    // PROCESOR

    const instrBox =
        document.getElementById(
            "instr"
        );

    const argBox =
        document.getElementById(
            "arg"
        );

    instrBox.innerText = instr;

    argBox.innerText =
        arg || "-";

    instrBox.classList.add(
        "pulse"
    );

    argBox.classList.add(
        "pulse"
    );

    setTimeout(() => {

        instrBox.classList.remove(
            "pulse"
        );

        argBox.classList.remove(
            "pulse"
        );

    }, 500);

    await sleep(300);


    switch (instr) {


        // ===== LOAD =====

        case "LOAD":

            {

                const src =
                    parseInt(arg);

                const srcRow =
                    getMemoryRow(src);

                const accRow =
                    getMemoryRow(0);

                await animateValue(
                    srcRow,
                    accRow,
                    getVal(arg)
                );

                memory[0] =
                    getVal(arg);
            }

            break;


        // ===== STORE =====

        case "STORE":

            {

                const accRow =
                    getMemoryRow(0);

                const dstRow =
                    getMemoryRow(
                        parseInt(arg)
                    );

                await animateValue(
                    accRow,
                    dstRow,
                    memory[0]
                );

                memory[
                    parseInt(arg)
                ] = memory[0];
            }

            break;


        // ===== STORE^ =====

        case "STORE^":

            {

                const addr =
                    memory[
                        parseInt(arg)
                    ] || 0;

                const accRow =
                    getMemoryRow(0);

                const dstRow =
                    getMemoryRow(addr);

                await animateValue(
                    accRow,
                    dstRow,
                    memory[0]
                );

                memory[addr] =
                    memory[0];
            }

            break;


        // ===== ADD =====

        case "ADD":

            {

                const src =
                    parseInt(arg);

                const srcRow =
                    getMemoryRow(src);

                const accRow =
                    getMemoryRow(0);

                await animateValue(
                    srcRow,
                    accRow,
                    getVal(arg)
                );

                memory[0] +=
                    getVal(arg);
            }

            break;


        // ===== SUB =====

        case "SUB":

            {

                const src =
                    parseInt(arg);

                const srcRow =
                    getMemoryRow(src);

                const accRow =
                    getMemoryRow(0);

                await animateValue(
                    srcRow,
                    accRow,
                    getVal(arg)
                );

                memory[0] -=
                    getVal(arg);
            }

            break;


        // ===== MULT =====

        case "MULT":

            {

                const src =
                    parseInt(arg);

                const srcRow =
                    getMemoryRow(src);

                const accRow =
                    getMemoryRow(0);

                await animateValue(
                    srcRow,
                    accRow,
                    getVal(arg)
                );

                memory[0] *=
                    getVal(arg);
            }

            break;


        // ===== DIV =====

        case "DIV":

            {

                const divVal =
                    getVal(arg);

                if (divVal === 0) {

                    alert(
                        "Dzielenie przez zero!"
                    );

                    running = false;

                    return;
                }

                const src =
                    parseInt(arg);

                const srcRow =
                    getMemoryRow(src);

                const accRow =
                    getMemoryRow(0);

                await animateValue(
                    srcRow,
                    accRow,
                    divVal
                );

                memory[0] =
                    Math.floor(
                        memory[0] / divVal
                    );
            }

            break;


        // ===== READ =====

        case "READ":

            {

                const inEl =
                    document.getElementById(
                        `in${inputIndex}`
                    );

                const memRow =
                    getMemoryRow(
                        parseInt(arg)
                    );

                const value =
                    input[inputIndex] ?? 0;

                await animateValue(
                    inEl,
                    memRow,
                    value
                );

                memory[
                    parseInt(arg)
                ] = value;

                inputIndex++;
            }

            break;


        // ===== READ^ =====

        case "READ^":

            {

                const addr =
                    memory[
                        parseInt(arg)
                    ] || 0;

                const inEl =
                    document.getElementById(
                        `in${inputIndex}`
                    );

                const memRow =
                    getMemoryRow(addr);

                const value =
                    input[inputIndex] ?? 0;

                await animateValue(
                    inEl,
                    memRow,
                    value
                );

                memory[addr] =
                    value;

                inputIndex++;
            }

            break;


        // ===== WRITE =====

        case "WRITE":

            {

                if (!arg) {

                    alert(
                        "WRITE wymaga argumentu!"
                    );

                    running = false;

                    return;
                }

                const outEl =
                    document.getElementById(
                        `out${outputIndex}`
                    );

                let srcRow;


                // =5

                if (arg.startsWith("=")) {

                    srcRow =
                        getMemoryRow(0);

                } else if (
                    arg.startsWith("^")
                ) {

                    const addr =
                        memory[
                            parseInt(
                                arg.slice(1)
                            )
                        ] || 0;

                    srcRow =
                        getMemoryRow(addr);

                } else {

                    srcRow =
                        getMemoryRow(
                            parseInt(arg)
                        );
                }

                await animateValue(
                    srcRow,
                    outEl,
                    getVal(arg)
                );

                outEl.value =
                    getVal(arg);

                outputIndex++;
            }

            break;


        // ===== JUMP =====

        case "JUMP":

            {

                const target =
                    findLabel(arg);

                if (target === -1) {

                    alert(
                        "Nie znaleziono etykiety: "
                        + arg
                    );

                    running = false;

                    return;
                }

                pc = target;

                render();

                return;
            }


        // ===== JGTZ =====

        case "JGTZ":

            if (memory[0] > 0) {

                const target =
                    findLabel(arg);

                if (target === -1) {

                    alert(
                        "Nie znaleziono etykiety: "
                        + arg
                    );

                    running = false;

                    return;
                }

                pc = target;

                render();

                return;
            }

            break;


        // ===== JZERO =====

        case "JZERO":

            if (memory[0] === 0) {

                const target =
                    findLabel(arg);

                if (target === -1) {

                    alert(
                        "Nie znaleziono etykiety: "
                        + arg
                    );

                    running = false;

                    return;
                }

                pc = target;

                render();

                return;
            }

            break;


        // ===== HALT =====

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

    async function loop() {

        if (!running) return;

        await step();

        setTimeout(
            loop,
            300
        );
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

    document.getElementById(
        "instr"
    ).innerText = "-";

    document.getElementById(
        "arg"
    ).innerText = "-";
}


// ===== RENDER =====

function render() {

    const tbody =
        document.getElementById(
            "memoryBody"
        );

    tbody.innerHTML = "";


    for (let i = 0; i < 10; i++) {

        const row =
            tbody.insertRow();

        const c1 =
            row.insertCell();

        const c2 =
            row.insertCell();

        c1.innerText = i;

        c2.innerText = memory[i];


        if (i === 0) {

            row.classList.add(
                "acc"
            );
        }
    }


    // PODŚWIETLENIE LINII

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

    updateTapeHighlights();
}


// ===== ZAPIS PROGRAMU =====

function saveProgram() {

    loadProgram();

    const name = prompt(
        "Podaj nazwę programu:"
    );

    if (!name) return;

    const data =
        JSON.stringify(
            program,
            null,
            2
        );

    const blob =
        new Blob(

            [data],

            {
                type: "text/plain"
            }
        );

    const a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download =
        `${name}.txt`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(a.href);
}


// ===== WCZYTAJ PROGRAM =====

function loadSavedProgram() {

    const inputFile =
        document.createElement(
            "input"
        );

    inputFile.type = "file";

    inputFile.accept =
        ".txt,.json";

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

document.getElementById(
    "runBtn"
).addEventListener(

    "click",

    () => {

        if (!running) {

            loadProgram();

            running = true;
        }

        run();
    }
);


document.getElementById(
    "stepBtn"
).addEventListener(

    "click",

    async () => {

        if (!running) {

            loadProgram();

            running = true;
        }

        await step();
    }
);


document.getElementById(
    "resetBtn"
).addEventListener(
    "click",
    reset
);


document.getElementById(
    "saveBtn"
).addEventListener(
    "click",
    saveProgram
);


document.getElementById(
    "loadBtn"
).addEventListener(
    "click",
    loadSavedProgram
);


// ===== START =====

initMemory();

dodajWiersz();

render();
