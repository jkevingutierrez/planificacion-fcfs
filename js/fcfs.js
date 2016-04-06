(function() {
    'use strict';

    // Variables globales
    var colaListos = [];

    // Clases
    function Proceso() {
        this.nombre = 'Proceso';
        this.llegada = 0;
        this.rafaga = 0;
        this.comienzo = 0;
        this.finalizacion = 0;
        this.retorno = 0;
        this.espera = 0;
    };

    // Funciones
    function aggregar_proceso_a_listos(proceso) {
        colaListos.push(proceso);
    }

    function crear_proceso(nombre, rafaga) {
        var proceso = new Proceso();
        var colaListosLength = colaListos.length;

        proceso.nombre = nombre;
        proceso.rafaga = rafaga;
        proceso.llegada = colaListosLength;
        proceso.finalizacion = rafaga;

        for (var index = 0; index < colaListosLength; index++) {
            proceso.finalizacion += colaListos[index].rafaga;
        };

        proceso.retorno = proceso.finalizacion - proceso.llegada;
        proceso.espera = proceso.retorno - proceso.rafaga;
        proceso.comienzo = proceso.espera + proceso.llegada;

        aggregar_proceso_a_listos(proceso);
        return proceso;
    }

    function crear_primer_proceso() {
        var nombre = 'Proceso A';
        var rafaga = 8;
        return crear_proceso(nombre, rafaga);
    }

    function generar_proceso() {
        var nombre = 'Proceso ' + colaListos.length;
        var rafaga = Math.floor((Math.random() * 10) + 1);
        return crear_proceso(nombre, rafaga);
    }

    function imprimir_colaListos() {
        var colaListosLength = colaListos.length;
        for (var index = 0; index < colaListosLength; index++) {
            console.log(colaListos[index]);
        };
    }

    function aggregar_columna(proceso) {
        var tabla = document.getElementById('tabla_procesos');
        var tbody = tabla.getElementsByTagName('tbody')[0];

        var fila = document.createElement('tr');
        fila.classList.add('fila-proceso');
        fila.classList.add('proceso-' + (colaListos.length - 1));

        var columnaNombre = document.createElement('td');
        columnaNombre.innerText = proceso.nombre;
        fila.appendChild(columnaNombre);

        var columnaLlegada = document.createElement('td');
        columnaLlegada.innerText = proceso.llegada;
        fila.appendChild(columnaLlegada);

        var columnaRafaga = document.createElement('td');
        columnaRafaga.innerText = proceso.rafaga;
        fila.appendChild(columnaRafaga);

        var columnaComienzo = document.createElement('td');
        columnaComienzo.innerText = proceso.comienzo;
        fila.appendChild(columnaComienzo);

        var columnaFinalizacion = document.createElement('td');
        columnaFinalizacion.innerText = proceso.finalizacion;
        fila.appendChild(columnaFinalizacion);

        var columnaRetorno = document.createElement('td');
        columnaRetorno.innerText = proceso.retorno;
        fila.appendChild(columnaRetorno);

        var columnaEspera = document.createElement('td');
        columnaEspera.innerText = proceso.espera;
        fila.appendChild(columnaEspera);

        tbody.appendChild(fila);
    }

    function inicio() {

        var proceso = crear_primer_proceso();
        var tiempoEspera = 5000;
        var procesosIniciales = 5;

        aggregar_columna(proceso);

        for (var index = 0; index < procesosIniciales; index++) {
            proceso = generar_proceso();
            aggregar_columna(proceso);
        };

        imprimir_colaListos();

        window.setInterval(function () {
            var proceso = generar_proceso();
            aggregar_columna(proceso);
        }, tiempoEspera);
    }

    // Ejecución de funciones
    inicio();
})();