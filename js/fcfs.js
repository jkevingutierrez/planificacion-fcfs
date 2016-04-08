(function() {
    'use strict';

    // Variables globales
    var colaListos = [];
    var colaBloqueados = [];
    var numeroProcesos = 0;
    var tiempoActual = 0;
    var tiempoLlegada = 0;
    var procesoActual = 0;

    var tiempoEspera = 5001;
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
        this.bloquedao = false;
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
        var tiempo = tiempoActual;

        if (tiempo > tiempoLlegada) {
            tiempoLlegada = tiempo;
        }

        proceso.nombre = nombre;
        proceso.rafaga = rafaga;
        proceso.llegada = tiempoLlegada++;
        proceso.finalizacion = rafaga;

        for (var index = 0; index < colaListosLength; index++) {
            proceso.finalizacion += colaListos[index].rafaga;
        };

        proceso.retorno = proceso.finalizacion - proceso.llegada;
        proceso.espera = proceso.retorno - proceso.rafaga;
        proceso.comienzo = proceso.espera + proceso.llegada;

        aggregar_proceso_a_listos(proceso);
        agregar_columna(proceso);
        pintar_proceso(proceso, colaListos.length);
        return proceso;
    }

    function crear_primer_proceso() {
        var nombreInicial = 'Proceso ' + (numeroProcesos++);
        var rafagaInicial = 8;
        return crear_proceso(nombreInicial, rafagaInicial);
    }

    function generar_proceso() {
        var nombre = 'Proceso ' + (numeroProcesos++);
        var rafaga = Math.floor((Math.random() * 10) + 1);
        return crear_proceso(nombre, rafaga);
    }

    function imprimir_cola_listos() {
        var colaListosLength = colaListos.length;
        for (var index = 0; index < colaListosLength; index++) {
            console.log(colaListos[index]);
        };
    }

    function agregar_columna(proceso) {
        var tabla = d3.select('#tabla_procesos');
        var tbody = tabla.select('tbody');

        var fila = tbody.append('tr')
            .attr('class', 'fila-proceso')
            .attr('id', 'proceso-' + (colaListos.length - 1));

        fila.append('td')
            .text(proceso.nombre);

        fila.append('td')
            .text(proceso.llegada);

        fila.append('td')
            .text(proceso.rafaga);

        fila.append('td')
            .text(proceso.comienzo);

        fila.append('td')
            .text(proceso.finalizacion);

        fila.append('td')
            .text(proceso.retorno);

        fila.append('td')
            .text(proceso.espera);

        fila.append('td')
            .html('<button type="button" class="btn btn-danger" title="Bloquear proceso"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button>')
            .on('click', function() {
                var filaActual = this.parentNode;
                var idProceso = filaActual.id.replace('proceso-', '');

                bloquear_proceso(idProceso, filaActual)
            });
    }

    function bloquear_proceso(idProceso, fila) {
        var tiempo = tiempoActual;
        var proceso = colaListos[idProceso];
        if (tiempo < proceso.finalizacion && tiempo >= proceso.comienzo) {
            d3.selectAll('.proceso-' + idProceso)
                .classed('bloqueado', true);

            d3.selectAll('.ejecucion.proceso-' + idProceso)
                .attr('width', (tiempo - proceso.comienzo) * 31);

            d3.selectAll('.texto-restante.proceso-' + idProceso)
                .attr('x', ((proceso.finalizacion) * 31) - 20)
                .text(proceso.finalizacion - tiempo);

            d3.selectAll('.texto-rafaga.proceso-' + idProceso)
                .text(tiempo - proceso.comienzo);

            proceso.nombre = proceso.nombre.replace('(Reanudado)', '');

            var rafagaTotal = proceso.rafaga;
            proceso.rafaga = proceso.finalizacion - tiempo;
            proceso.bloqueado = tiempo;
            aggregar_proceso_a_bloqueados(proceso);
            actualizar_tabla_bloqueados(proceso, rafagaTotal);

            var contenedor = document.getElementsByClassName('table-container')[1];
            contenedor.scrollTop = contenedor.scrollHeight;

            fila.remove();

        } else {
            swal({
                title: 'Error!',
                text: 'No se puede bloquear un proceso que no se encuentra en su sección critica',
                type: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    function actualizar_tabla_bloqueados(proceso, rafagaTotal) {
        var tabla = d3.select('#tabla_bloqueados');
        var tbody = tabla.select('tbody');

        var fila = tbody.append('tr')
            .attr('class', 'fila-bloqueado')
            .attr('id', 'proceso-' + (colaBloqueados.length - 1));

        fila.append('td')
            .text(proceso.nombre);

        fila.append('td')
            .text(proceso.bloqueado);

        fila.append('td')
            .text(rafagaTotal);

        fila.append('td')
            .html('<button type="button" class="btn btn-success" title="Reanudar proceso"><span class="glyphicon glyphicon-play" aria-hidden="true"></span></button>')
            .on('click', function() {
                var filaActual = this.parentNode;
                var idProceso = filaActual.id.replace('proceso-', '');
                var proceso = colaBloqueados[idProceso];

                proceso.nombre = proceso.nombre + ' (Reanudado)';

                crear_proceso(proceso.nombre, proceso.rafaga);
                filaActual.remove();
            });
    }

    function inicio() {
        crear_primer_proceso();

        for (var index = 0; index < procesosIniciales; index++) {
            generar_proceso();
        };

        window.setInterval(function () {
            generar_proceso();
        }, tiempoEspera);

        window.setInterval(function () {
            d3.select('.time')
                .text(++tiempoActual);
            var longitudCola = colaListos.length;
            for (var indexProceso = procesoActual; indexProceso < longitudCola; indexProceso++) {
                var procesoInterno = colaListos[indexProceso];
                var textoEnEjecucion = d3.select('.proceso-ejecucion');
                if (procesoInterno.comienzo <= tiempoActual && procesoInterno.finalizacion > tiempoActual) {
                    textoEnEjecucion.text(procesoInterno.nombre);

                    if (procesoInterno.bloqueado) {
                        textoEnEjecucion.text('');
                    }

                    d3.selectAll('.ejecutandose')
                        .classed('ejecutandose', false);

                    d3.select('.fila-proceso#proceso-' + indexProceso)
                        .classed('ejecutandose', true);

                    d3.selectAll('.ejecucion.proceso-' + indexProceso)
                        .classed('ejecutandose', true);

                    procesoActual = indexProceso;
                }
            }
        }, 1000);

        d3.select('.btn-add').on('click', function() {
            generar_proceso();
        });

        d3.selectAll('.ejecucion').on('click', function() {
            var idProceso = d3.select(this)
                .attr('class')
                .replace(/proceso-|ejecucion|ejecutandose| /gi, '');

            var fila = d3.select('#proceso-' + idProceso);

            bloquear_proceso(idProceso, fila);
        });
    }

    // Ejecución de funciones
    inicio();

})();
