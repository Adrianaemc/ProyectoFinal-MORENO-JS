// claves para el almacenamiento local
const SELECCION_SERVICIOS_KEY = "seleccionServicios";
const TOTAL_KEY = "total";

// funcion para guardar los servicios seleccionados y el total en localStorage
const guardarEnStorage = (seleccionServicios, total) => {
    const datos = {
        seleccionServicios,
        total
    };
    localStorage.setItem(SELECCION_SERVICIOS_KEY, JSON.stringify(seleccionServicios));
    localStorage.setItem(TOTAL_KEY, JSON.stringify(total));
}

// Recuperar los datos de los servicios seleccionados desde localStorage
const recuperarServiciosDesdeStorage = () => {
    const seleccionServicios = JSON.parse(localStorage.getItem(SELECCION_SERVICIOS_KEY));
    return seleccionServicios ? seleccionServicios : [];
}

// Recuperar el total de la cotización desde localStorage
const recuperarTotalDesdeStorage = () => {
    const total = JSON.parse(localStorage.getItem(TOTAL_KEY));
    return total ? total : 0;
}

// Exportar las funciones para que puedan ser utilizadas en otros archivos
export {
    guardarEnStorage,
    recuperarServiciosDesdeStorage,
    recuperarTotalDesdeStorage,
};