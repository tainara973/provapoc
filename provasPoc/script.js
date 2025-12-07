const display = document.getElementById("display");
const historyList = document.getElementById("history-list");

let current = "";
let previous = "";
let operator = "";

document.querySelectorAll(".num").forEach(btn => {
    btn.addEventListener("click", () => {
        current += btn.dataset.value;
        updateDisplay(current);
    });
});

document.querySelectorAll(".op").forEach(btn => {
    btn.addEventListener("click", () => {
        if (current === "") return;

        previous = current;
        operator = btn.dataset.value;
        current = "";
    });
});

document.getElementById("clear").addEventListener("click", () => {
    current = "";
    previous = "";
    operator = "";
    updateDisplay("0");
});

document.getElementById("equals").addEventListener("click", () => {
    if (!current || !previous || !operator) return;

    const a = parseFloat(previous);
    const b = parseFloat(current);
    let result = 0;

    switch(operator) {
        case "+": result = a + b; break;
        case "-": result = a - b; break;
        case "*": result = a * b; break;
        case "/": result = b !== 0 ? a / b : "Erro"; break;
    }

    updateDisplay(result);
    addHistory(`${previous} ${operator} ${current} = ${result}`);

    current = result.toString();
    previous = "";
    operator = "";
});

function updateDisplay(text) {
    display.textContent = text;
}

function addHistory(text) {
    const li = document.createElement("li");
    li.textContent = text;
    historyList.appendChild(li);
}
