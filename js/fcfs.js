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
        var nombreInicial = 'Proceso 0';
        var rafagaInicial = 8;
        return crear_proceso(nombreInicial, rafagaInicial);
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
        var tabla = d3.select('#tabla_procesos');
        var tbody = tabla.select('tbody');

        var fila = tbody.append('tr')
            .attr('class', 'fila-proceso proceso-' + (colaListos.length - 1));

        fila.append('td')
            .html(proceso.nombre);

        fila.append('td')
            .html(proceso.llegada);

        fila.append('td')
            .html(proceso.rafaga);

        fila.append('td')
            .html(proceso.comienzo);

        fila.append('td')
            .html(proceso.finalizacion);

        fila.append('td')
            .html(proceso.retorno);

        fila.append('td')
            .html(proceso.espera);

        var contenedor = document.getElementsByClassName('table-container')[0];
        contenedor.scrollTop = contenedor.scrollHeight;
    }

    function inicio() {
        var tiempoEspera = 5000;
        var procesosIniciales = 5;

        var proceso = crear_primer_proceso();
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
