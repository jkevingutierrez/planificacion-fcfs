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

    function inicio() {
        crear_primer_proceso();

        for (var index = 0; index <= 5; index++) {
            generar_proceso();
        };

        imprimir_colaListos();

        window.setInterval(function () {
            var proceso = generar_proceso();
            console.log(proceso);
        }, 5000);
    }

    // Ejecución de funciones
    inicio();
})();