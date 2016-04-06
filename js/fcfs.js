(function() {
    'use strict';

    // Variables globales
    var colaListos = [];
    var colaBloqueados = [];
    var tiempoActual = 0;
    var tiempoEspera = 5000;
    var numeroProcesos = 0;
    var procesosIniciales = 5;

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

    function aggregar_proceso_a_bloqueados(proceso) {
        colaBloqueados.push(proceso);
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
        pintar_proceso(proceso.espera, proceso.comienzo, proceso.llegada, proceso.finalizacion, proceso.rafaga);
        return proceso;
    }

    function crear_primer_proceso() {
        var nombreInicial = 'Proceso 0';
        var rafagaInicial = 8;
        return crear_proceso(nombreInicial, rafagaInicial);
    }

    function generar_proceso() {
        var nombre = 'Proceso ' + (++numeroProcesos);
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

        fila.append('td')
            .html('<button type="button" class="btn btn-danger"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button>')
            .on('click', function() {
                var tiempo = tiempoActual
                var filaActual = this.parentNode;
                var className = filaActual.className;
                var indexProceso = className.replace('fila-proceso proceso-', '');
                var proceso = colaListos[indexProceso];

                if (tiempo < proceso.finalizacion) {
                    if (proceso.nombre.indexOf('(Reanudado)') !== -1) {
                        proceso.nombre = proceso.nombre.slice(0, proceso.nombre.indexOf('(Reanudado)') - 1);
                    }

                    if (tiempo > proceso.comienzo) {
                        proceso.rafaga = proceso.finalizacion - tiempo;
                    }

                    proceso.bloqueado = tiempo;
                    aggregar_proceso_a_bloqueados(proceso);
                    actualizar_tabla_bloqueados(proceso);
                    fila.remove();

                    var contenedor = document.getElementsByClassName('table-container')[1];
                    contenedor.scrollTop = contenedor.scrollHeight;
                } else {
                    swal({
                        title: "Error!",
                        text: "No se puede bloquear un proceso cuyo tiempo de finalización sea menor al tiempo actual",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                }
            });

        var contenedor = document.getElementsByClassName('table-container')[0];
        contenedor.scrollTop = contenedor.scrollHeight;
    }

    function actualizar_tabla_bloqueados(proceso) {
        var tabla = d3.select('#tabla_bloqueados');
        var tbody = tabla.select('tbody');

        var fila = tbody.append('tr')
            .attr('class', 'fila-proceso proceso-' + (colaBloqueados.length - 1));

        fila.append('td')
            .html(proceso.nombre);

        fila.append('td')
            .html(proceso.bloqueado);

        fila.append('td')
            .html('<button type="button" class="btn btn-success"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button>')
            .on('click', function() {
                var filaActual = this.parentNode;
                var className = filaActual.className;
                var indexProceso = className.substr(className.length - 1);
                var proceso = colaBloqueados[indexProceso];

                if (proceso.nombre.indexOf('Reanudado') === -1) {
                    proceso.nombre = proceso.nombre + ' (Reanudado)';
                }

                var procesoActualizado = crear_proceso(proceso.nombre, proceso.rafaga);

                aggregar_columna(procesoActualizado);
                filaActual.remove();
            });

        var contenedor = document.getElementsByClassName('table-container')[0];
        contenedor.scrollTop = contenedor.scrollHeight;
    }

    function inicio() {
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

        window.setInterval(function () {
            d3.select('.time').html(++tiempoActual);
        }, 1000);
    }

    // Ejecución de funciones
    inicio();

    d3.select('.btn-add').on('click', function() {
        var proceso = generar_proceso();
        aggregar_columna(proceso);
    });

})();
