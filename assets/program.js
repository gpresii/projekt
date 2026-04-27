document.addEventListener("DOMContentLoaded", () => {
    const tabela = document.querySelector("#program_tabela tbody");
    const btn = document.getElementById("dodajwiersz");

    function dodajWiersz() {
        const nowyIndex = tabela.rows.length + 1;
        const wiersz = tabela.insertRow();

        const cellLP = wiersz.insertCell(0);
        cellLP.textContent = nowyIndex;

        const cellEtykieta = wiersz.insertCell(1);
        cellEtykieta.innerHTML = '<input type="text">';

        const cellInstrukcja = wiersz.insertCell(2);
        cellInstrukcja.innerHTML = `
            <select>
            <option value="load">LOAD</option>
            <option value="store">STORE</option>
            <option value="store^">STORE^</option>
            <option value="add">ADD</option>
            <option value="sub">SUB</option>
            <option value="mult">MULT</option>
            <option value="div">DIV</option>
            <option value="read">READ</option>
            <option value="read^">READ^</option>
            <option value="write">WRITE</option>
            <option value="jump">JUMP</option>
            <option value="jgtz">JGTZ</option>
            <option value="jzero">JZERO</option>
            <option value="halt">HALT</option>
            </select>
        `;

        const cellParametr = wiersz.insertCell(3);
        cellParametr.innerHTML = '<input type="text">';

        const cellKomentarz = wiersz.insertCell(4);
        cellKomentarz.innerHTML = '<input type="text">';

        const cellBtn = wiersz.insertCell(5);
        const plusBtn = document.createElement("button");
        plusBtn.textContent = "+";
        plusBtn.addEventListener("click", dodajWiersz);
        cellBtn.appendChild(plusBtn);
    }

    btn.addEventListener("click", dodajWiersz);

    dodajWiersz();
});