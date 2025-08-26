const inputLimite = document.getElementById("limite");
const inputParrafo = document.getElementById("parrafo");
const inputPalabra = document.getElementById("palabra");
const botonGenerar = document.getElementById("generar");
const salida = document.getElementById("salida");

function crearWorker(fn) {
  const blob = new Blob(["onmessage = " + fn.toString()], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  URL.revokeObjectURL(url); 
  return worker;
}

function workerPrimos(e) {
  const limite = e.data;
  let primos = [];
  let esPrimo = new Array(limite + 1).fill(true);
  esPrimo[0] = esPrimo[1] = false;

  for (let i = 2; i * i <= limite; i++) {
    if (esPrimo[i]) {
      for (let j = i * i; j <= limite; j += i) {
        esPrimo[j] = false;
      }
    }
  }

  for (let i = 2; i <= limite; i++) {
    if (esPrimo[i]) primos.push(i);
  }

  postMessage(primos.join(", "));
}

function workerBusqueda(e) {
  const { parrafo, palabra } = e.data;
  let palabras = parrafo.toLowerCase().split(/\W+/).filter(p => p.length > 0);
  palabras.sort();

  let izquierda = 0, derecha = palabras.length - 1;
  let encontrado = false;

  while (izquierda <= derecha) {
    let medio = Math.floor((izquierda + derecha) / 2);
    if (palabras[medio] === palabra.toLowerCase()) {
      encontrado = true;
      break;
    } else if (palabras[medio] < palabra.toLowerCase()) {
      izquierda = medio + 1;
    } else {
      derecha = medio - 1;
    }
  }

  postMessage(encontrado ? `La palabra "${palabra}" SÍ se encuentra en el párrafo.` : `La palabra "${palabra}" NO se encuentra en el párrafo.`);
}

botonGenerar.addEventListener("click", () => {
  salida.innerHTML = "<p>Procesando...</p>";

  const limite = parseInt(inputLimite.value);
  const parrafo = inputParrafo.value;
  const palabra = inputPalabra.value.trim();

  if (isNaN(limite) || limite <= 1) {
    salida.innerHTML = "<p>Ingresa un número mayor a 1 para primos.</p>";
    return;
  }

  if (palabra === "") {
    salida.innerHTML = "<p>Ingresa una palabra válida.</p>";
    return;
  }

  const wPrimos = crearWorker(workerPrimos);
  const wBusqueda = crearWorker(workerBusqueda);

  wPrimos.onmessage = (e) => {
    salida.innerHTML += `<p><b>Primos:</b> ${e.data}</p>`;
  };

  wBusqueda.onmessage = (e) => {
    salida.innerHTML += `<p><b>Búsqueda:</b> ${e.data}</p>`;
  };

  wPrimos.postMessage(limite);
  wBusqueda.postMessage({ parrafo, palabra });
});