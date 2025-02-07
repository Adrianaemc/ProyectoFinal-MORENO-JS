import {
    guardarEnStorage,
    recuperarServiciosDesdeStorage,
    recuperarTotalDesdeStorage
} from './utils/storage.js';

import { SERVICIOS, DESCUENTOS } from './constantes.js';

let seleccionServicios = [];
let totalSinDescuento = 0;
let totalConDescuento = 0;
let nombreSolicitante = "";

// Cargar servicios desde el archivo JSON
function cargarServiciosDesdeJSON() {
    fetch('./data/servicios.json')
        .then(response => response.json())
        .then(data => {
            SERVICIOS.length = 0;  // Vaciar el array
            SERVICIOS.push(...data.servicios);  // Agregar los servicios cargados
            mostrarServicios();  // Llamar a la función para mostrar los servicios
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error al cargar los servicios',
                text: 'Hubo un problema al cargar los servicios, por favor intenta más tarde.'
            });
        });
}

// Mostrar los servicios en el DOM
// Mostrar los servicios en el DOM
function mostrarServicios() {
    const contenedorServicios = document.getElementById("servicios");
    contenedorServicios.innerHTML = ""; // Limpiar contenido previo

    SERVICIOS.forEach(servicio => {
        const div = document.createElement("div");
        div.classList.add("servicio");
        div.innerHTML = `
            <label>
                ${servicio.nombre} - $${servicio.precio}
                <input type="number" id="cantidad-${servicio.id}" class="cantidad-servicio" min="0" value="0" />
            </label>
        `;
        contenedorServicios.appendChild(div);

        // Añadir la clase 'visible' para mostrar con animación
        setTimeout(() => {
            div.classList.add("visible");
        }, 10);  // Añadir un pequeño retraso para que la animación se vea
    });
}


// Mostrar descuentos en el DOM
function mostrarDescuentos() {
    const descuentoSelect = document.getElementById("descuento");
    DESCUENTOS.forEach(descuento => {
        const option = document.createElement("option");
        option.value = descuento.valor;
        option.textContent = descuento.nombre;
        descuentoSelect.appendChild(option);
    });
}

// Capturar descuento desde el DOM
function aplicarDescuento(total) {
    const descuentoSelect = document.getElementById("descuento");
    const descuento = parseInt(descuentoSelect.value);

    let descuentoAplicado = 0;

    if (descuento === 20) {
        descuentoAplicado = total * 0.20;
    } else if (descuento === 10) {
        descuentoAplicado = total * 0.10;
    }

    return descuentoAplicado;
}

function finalizarCotizacion() {
    const cantidadInputs = document.querySelectorAll(".cantidad-servicio");
    seleccionServicios = [];
    totalSinDescuento = 0; // Reiniciar total sin descuento
    totalConDescuento = 0; // Reiniciar total con descuento

    // Obtener el nombre del solicitante
    nombreSolicitante = document.getElementById("nombre").value;
    if (!nombreSolicitante) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor ingrese su nombre.'
        });
        return;
    }

    cantidadInputs.forEach(input => {
        const servicioId = input.id.replace("cantidad-", "");
        const cantidad = parseInt(input.value);

        if (cantidad > 0) {
            const servicioSeleccionado = SERVICIOS.find(servicio => servicio.id == servicioId);
            seleccionServicios.push({ ...servicioSeleccionado, cantidad });
            totalSinDescuento += servicioSeleccionado.precio * cantidad;
        }
    });

    if (seleccionServicios.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No seleccionaste ningún servicio.'
        });
        return;
    }

    // Confirmación antes de finalizar cotización
    Swal.fire({
        title: '¿Estás seguro?',
        text: `Revisa tu cotización antes de continuar. Total sin descuentos: $${totalSinDescuento.toFixed(2)}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Finalizar',
        cancelButtonText: 'Editar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Calcular descuento y continuar
            const descuentoAplicado = aplicarDescuento(totalSinDescuento);
            totalConDescuento = totalSinDescuento - descuentoAplicado;

            // Guardar en Storage
            guardarEnStorage(seleccionServicios, totalConDescuento);

            // Mostrar resumen
            mostrarResumen(totalSinDescuento, totalConDescuento);
        }
    });
}

// Mostrar resumen de la cotización
function mostrarResumen(totalSinDescuento, totalConDescuento) {
    const resultado = document.getElementById("resultado");
    resultado.innerHTML = `
        <h2>Resumen de la Cotización</h2>
        <p><strong>Nombre del solicitante:</strong> ${nombreSolicitante}</p>
        <ul>
            ${seleccionServicios.map(servicio =>
        `<li>${servicio.nombre} - ${servicio.cantidad} unidad(es) - $${servicio.precio * servicio.cantidad}</li>`).join("")}
        </ul>
        <p>Total sin descuentos: <strong>$${totalSinDescuento.toFixed(2)}</strong></p>
        <p>Total a pagar (con descuento): <strong>$${totalConDescuento.toFixed(2)}</strong></p>
    `;
}

// Recuperar datos desde localStorage al cargar la página
function recuperarDesdeStorage() {
    seleccionServicios = recuperarServiciosDesdeStorage();
    totalConDescuento = recuperarTotalDesdeStorage();

    if (seleccionServicios.length > 0) {
        mostrarResumen(totalSinDescuento, totalConDescuento);
    }
}

// Limpiar pantalla para una nueva cotización
function nuevaCotizacion() {
    // Limpiar los campos
    document.getElementById("nombre").value = "";
    const cantidadInputs = document.querySelectorAll(".cantidad-servicio");
    cantidadInputs.forEach(input => input.value = 0);

    // Limpiar el resumen de la cotización
    document.getElementById("resultado").innerHTML = "";
}

// Asegurarse de que el DOM esté completamente cargado antes de agregar los event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Llamar a la función para cargar los servicios desde el archivo JSON
    cargarServiciosDesdeJSON();

    // Agregar los event listeners a los botones
    document.getElementById("finalizar").addEventListener("click", finalizarCotizacion);
    document.getElementById("nueva-cotizacion").addEventListener("click", nuevaCotizacion);

    // Recuperar los datos desde localStorage (si existen) y mostrar los servicios y descuentos
    recuperarDesdeStorage();
    mostrarDescuentos();
});
