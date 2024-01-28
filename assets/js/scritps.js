/* ----------  Codigo Conversor ---------- */





/* ----------  Realizar Conversion ---------- */

/* ----------  Codigo Conversor ---------- */

/* ----------  Codigo Conversor ---------- */

/* ----------  Recoger API con divisas de mi indicador.cl ---------- */
async function getApiDivisas() {
    try {
        const resApiDivisas = await fetch("https://mindicador.cl/api");
        const dataApiDivisas = await resApiDivisas.json();
        return dataApiDivisas;
    } catch (e) {
        alert("Problemas de conectividad con fuente de datos, intente más tarde");
    }
}
// Función para formatear la fecha para obtener dias anteriores
function formatDate(date) {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}-${mes}-${anio}`;
}

// Función para obtener los datos de los últimos 10 días
async function getUltimos10DiasData(divisa) {
    const ultimos10DiasData = [];
    for (let i = 9; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaFormatted = formatDate(fecha);
        try {
            const resUltimos10Dias = await fetch(`https://mindicador.cl/api/${divisa}/${fechaFormatted}`);
            const dataDia = await resUltimos10Dias.json();
            const valor = dataDia.serie[0].valor;
            ultimos10DiasData.push({
                x: fechaFormatted,
                y: valor
            });
        } catch (error) {
            console.error("Error al obtener datos para la fecha");
        }
    }

    return ultimos10DiasData;
}

// Función para mostrar el gráfico
function mostrarGrafico(data) {
    const ctx = document.getElementById('graficoDivisas').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Últimos 10 días',
                data: data,
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 1,
                pointRadius: 5,
                pointBackgroundColor: 'rgba(255, 0, 0, 1)', 
                pointBorderColor: 'rgba(255, 0, 0, 1)',
                pointHoverRadius: 8,
            }]
        },
        options: {
            scales: {
                x: [{
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                }],
                y: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Valor'
                    }
                }]
            }
        }
    });
}



// Proceso para conversión de pesos a divisa de acuerdo a select indicado tipo de divisa
document.getElementById('botonConversion').addEventListener('click', async function () {
    const inputValorPesos = parseFloat(document.getElementById('inputValorPesos').value);
    const selectorDivisa = document.getElementById('selectorDivisa');
    const selectedDivisa = selectorDivisa.options[selectorDivisa.selectedIndex].value;

    // Verificando que el input no esté vacío
    if (isNaN(inputValorPesos) || selectedDivisa === '') {
        alert('Por favor, ingrese un valor válido y seleccione una divisa.');
        return;
    }

    const dataApiDivisas = await getApiDivisas();

    if (dataApiDivisas) {
        const valorDivisa = dataApiDivisas[selectedDivisa.toLowerCase()].valor;
        const resultadoConversion = inputValorPesos / valorDivisa;

        // Mostrar el tipo de divisa en el resultado
        const tipoDivisa = selectedDivisa.toUpperCase();
        document.getElementById('resultadoConversión').textContent = `(${tipoDivisa}): ${resultadoConversion.toFixed(2)}`;

        const ultimos10DiasData = await getUltimos10DiasData(selectedDivisa.toLowerCase());
        actualizarGrafico(ultimos10DiasData);
    }
});


// Función para actualizar el gráfico al seleccionar una nueva divisa
function actualizarGrafico(data) {
    const existingChart = Chart.getChart('graficoDivisas');
    if (existingChart) {
        existingChart.destroy();
    }
    mostrarGrafico(data);
}
