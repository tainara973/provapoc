const display = document.getElementById("display") || document.querySelector(".display");
const historyList = document.getElementById("history-list") || document.getElementById("history") || document.querySelector("#history ul") || document.querySelector(".history ul");

let current = "";
let previous = "";
let operator = null;

/* Atualiza o display (sempre exige string) */
function updateDisplay(value) {
  if (!display) return;
  display.textContent = String(value);
}

/* Adiciona item ao histórico (coloca no topo) */
function addToHistory(operation, result) {
  if (!historyList) return;
  const li = document.createElement("li");
  li.textContent = `${operation} = ${result}`;
  li.style.cursor = "pointer";
  li.addEventListener("click", () => {
    current = String(result);
    updateDisplay(current);
  });
  // Prepend se possível, senão append
  if (historyList.prepend) historyList.prepend(li);
  else historyList.insertBefore(li, historyList.firstChild);
}

/* Função de cálculo com validações */
function calculate() {
  if (!operator || current === "" || previous === "") return;
  const a = parseFloat(previous);
  const b = parseFloat(current);

  if (Number.isNaN(a) || Number.isNaN(b)) return;

  let result;
  switch (operator) {
    case "+":
      result = a + b;
      break;
    case "-":
      result = a - b;
      break;
    case "*":
    case "×":
      result = a * b;
      break;
    case "/":
    case "÷":
      result = b === 0 ? "Erro" : a / b;
      break;
    default:
      return;
  }

  addToHistory(`${previous} ${operator} ${current}`, result);
  updateDisplay(result);
  current = String(result);
  previous = "";
  operator = null;
}

/* Função para resetar tudo */
function clearAll() {
  current = "";
  previous = "";
  operator = null;
  updateDisplay("0");
}

/* Normaliza o valor do botão: usa data-value quando existir, senão o texto do botão */
function buttonValue(btn) {
  // pode ser undefined se não existir data-value
  const dv = btn.dataset ? btn.dataset.value : undefined;
  if (dv !== undefined) return dv;
  // fallback: texto visível do botão
  return (btn.textContent || btn.innerText || "").trim();
}

/* Gatilho dos botões: suporta botões com classe .btn ou qualquer button dentro do documento */
const buttons = Array.from(document.querySelectorAll("button"));

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const raw = buttonValue(btn);
    const value = raw === undefined ? "" : String(raw);

    // Alguns botões podem ter textos diferentes (ex: "AC", "C", "clear", "=", "÷", "×")
    // Normalizamos alguns casos:
    if (value === "" && btn.id) {
      // fallback para botões identificados por id (ex: clear, equals)
      if (btn.id.toLowerCase().includes("clear") || btn.id.toLowerCase().includes("ac")) {
        clearAll();
        return;
      }
      if (btn.id.toLowerCase().includes("equal") || btn.id.toLowerCase().includes("equals")) {
        calculate();
        return;
      }
    }

    // Normaliza símbolos comuns para os operadores usados no cálculo
    const normalized = value.replace("×", "*").replace("÷", "/").replace("−", "-");

    // Números e ponto decimal
    if (!isNaN(normalized) || normalized === ".") {
      // proteger contra múltiplos pontos
      if (normalized === "." && current.includes(".")) return;
      // evitar leading zeros estranhos: se current === "0" e digitou número (não '.'), substitui
      if (current === "0" && normalized !== ".") {
        current = normalized;
      } else {
        current += normalized;
      }
      updateDisplay(current || "0");
      return;
    }

    // Operadores
    if (["+","-","*","/"].includes(normalized)) {
      if (current === "") {
        // se já existe previous e operator, permite trocar o operador
        if (previous !== "" && operator !== null) {
          operator = normalized;
        }
        return;
      }
      // se já tinha previous e operator e o usuário entrou novo operador sem apertar '=' -> calcular encadeado
      if (previous !== "" && operator !== null && current !== "") {
        // calcula e usa o resultado como previous
        const a = parseFloat(previous);
        const b = parseFloat(current);
        if (!Number.isNaN(a) && !Number.isNaN(b)) {
          let interim;
          switch (operator) {
            case "+": interim = a + b; break;
            case "-": interim = a - b; break;
            case "*": interim = a * b; break;
            case "/": interim = b === 0 ? "Erro" : a / b; break;
          }
          previous = String(interim);
          updateDisplay(previous);
        }
      } else {
        previous = current;
      }
      current = "";
      operator = normalized;
      return;
    }

    // Igual - pode vir como "=" ou como botão com classe/id
    if (normalized === "=" || btn.classList.contains("equal") || btn.id.toLowerCase().includes("equals") || btn.id.toLowerCase().includes("equal")) {
      calculate();
      return;
    }

    // Clear / AC
    if (normalized.toUpperCase() === "AC" || normalized.toUpperCase() === "C" || btn.id.toLowerCase().includes("clear")) {
      clearAll();
      return;
    }

    // +/- toggler (se existir)
    if (normalized === "±" || normalized.toLowerCase() === "pm") {
      if (current === "") return;
      if (current.startsWith("-")) current = current.slice(1);
      else current = "-" + current;
      updateDisplay(current);
      return;
    }

    // % porcentagem: transforma o current em % (exa: 50 -> 0.5)
    if (normalized === "%") {
      if (current === "") return;
      const n = parseFloat(current);
      if (!Number.isNaN(n)) {
        current = String(n / 100);
        updateDisplay(current);
      }
      return;
    }

    // Se chegou aqui: botão não tratado (ignoramos)
  });
});

/* Inicializa display */
updateDisplay("0");