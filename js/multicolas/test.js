'use strict';

var numeroColas = 3;
var colasListos = [];
var colaBloqueados = [];
var numeroProcesos = 0;
var tiempoActual = 0;
var tiempoLlegada = 0;
var procesoActual = 0;
var pausado = false;
var tiempoEnvejecimiento = 10;
var procesosIniciales = 5;
var rafagaRandom = 10;

var tiempoQuantum = 5;

var procesoAnterior;

var timerAgregarProceso = 0;
var timerValidarProceso = 0;

for (var index = 0; index < numeroColas; index++) {
    colasListos.push([]);
}

// Clases
function Proceso() {
    this.nombre = 'Proceso';
    this.llegada = 0;
    this.rafaga = 0;
    this.comienzo = 0;
    this.finalizacion = 0;
    this.retorno = 0;
    this.espera = 0;
    this.prioridad = 0;
    this.bloqueado = false;
}

// Functions
function agregar_proceso_a_listos(proceso, cola) {
    cola.push(proceso);
}

function agregar_proceso_a_bloqueados(proceso) {
    colaBloqueados.push(proceso);
}

function actualizar_procesos(idProceso, cola, numeroCola) {
    var longitudCola = cola.length;
    for (var i = (Number(idProceso) + 1); i < longitudCola; i++) {
        cola[i].finalizacion = cola[i].rafaga + procesoAnterior.finalizacion;

        cola[i].retorno = cola[i].finalizacion - cola[i].llegada;
        if (cola[i].retorno < 0) {
            cola[i].retorno = 0;
        }
        cola[i].espera = cola[i].retorno - cola[i].rafaga;
        if (cola[i].espera < 0) {
            cola[i].espera = 0;
        }
        cola[i].comienzo = cola[i].espera + cola[i].llegada;

        actualizar_columna_tabla_listos(i, cola[i], numeroCola);
        // actualizar_gantt(i, cola1[i]);
    }
}

function actualizar_columna_tabla_listos(id, proceso, numeroCola) {
    var tr = d3.select('#proceso-' + id + '-' + numeroCola).selectAll('td');

    if (tr.node()) {
        var columnaComienzo = tr[0][3];
        var columnaFinalizacion = tr[0][4];
        var columnaRetorno = tr[0][5];
        var columnaEspera = tr[0][6];

        d3.select(columnaComienzo)
            .text(proceso.comienzo);

        d3.select(columnaFinalizacion)
            .text(proceso.finalizacion);

        d3.select(columnaRetorno)
            .text(proceso.retorno);

        d3.select(columnaEspera)
            .text(proceso.espera);
    }
}

function reanudar_proceso(idProceso, fila, prioridad, ignoreName) {
    if (typeof idProceso === 'string') {
        idProceso = idProceso.split('-')[0];
    }

    if (typeof fila !== 'object') {
        fila = d3.select('.fila-bloqueado#proceso-' + idProceso);
    }

    var proceso = new Proceso();

    proceso.rafaga = colaBloqueados[idProceso].rafagaFaltante;
    proceso.nombre = colaBloqueados[idProceso].nombre + ' (Reanudado)';
    proceso.prioridad = (prioridad) ? prioridad : colaBloqueados[idProceso].prioridad;

    if (ignoreName) {
        proceso.nombre = proceso.nombre.replace('(Reanudado)', '');
    }

    var nuevoProceso = crear_proceso(proceso.nombre, proceso.rafaga, proceso.prioridad);
    if (fila) {
        fila.remove();
    }

    repintar_procesos();

    return nuevoProceso;
}

function bloquear_proceso(idProceso, fila, cola, numeroCola, ignoreTime) {
    if (typeof idProceso === 'string') {
        idProceso = idProceso.split('-')[0];
    }

    var tiempo = tiempoActual;
    var proceso = cola[idProceso];
    if ((tiempo < proceso.finalizacion && tiempo >= proceso.comienzo) || ignoreTime) {
        if (typeof fila !== 'object') {
            fila = d3.select('.fila-proceso#proceso-' + idProceso);
        }

        // d3.selectAll('.proceso-' + idProceso)
        //     .classed('bloqueado', true);

        // d3.select('.ejecucion.proceso-' + idProceso)
        //     .attr('width', (tiempo - proceso.comienzo) * rect.width);

        // d3.select('.restante.proceso-' + idProceso)
        //     .attr('x', (tiempo) * rect.width)
        //     .attr('width', (proceso.finalizacion - tiempo) * rect.width);

        // d3.select('.texto-restante.proceso-' + idProceso)
        //     .attr('x', ((tiempo) * rect.width) + 5)
        //     .text(proceso.finalizacion - tiempo);

        d3.select('.texto-rafaga.proceso-' + idProceso)
            .text(tiempo - proceso.comienzo);

        proceso.nombre = proceso.nombre.replace('(Reanudado)', '');

        var rafagaTotal = proceso.rafaga;
        proceso.rafaga = ignoreTime ? rafagaTotal : proceso.finalizacion - tiempo;
        proceso.rafagaFaltante = ignoreTime ? rafagaTotal : proceso.finalizacion - tiempo;
        proceso.finalizacionTotal = proceso.finalizacion;

        proceso.bloqueado = tiempo;
        proceso.finalizacion = tiempo;
        agregar_proceso_a_bloqueados(proceso);
        agregar_columna_tabla_bloqueados(proceso, rafagaTotal);

        var contenedor = document.getElementsByClassName('table-container')[1];
        contenedor.scrollTop = contenedor.scrollHeight;

        if (fila) {
            fila.remove();
        }

        cola[idProceso].rafaga = tiempo - proceso.comienzo;
        actualizar_procesos(idProceso, cola, numeroCola);

        return (colaBloqueados.length - 1);

    } else {
        swal({
            title: 'Error!',
            text: 'No se puede bloquear un proceso que no se encuentra en su sección critica',
            type: 'error',
            confirmButtonText: 'OK'
        });
    }
}

function agregar_columna_tabla_bloqueados(proceso, rafagaTotal) {
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
            if (!pausado) {
                var filaActual = this.parentNode;
                var idProceso = filaActual.id.replace('proceso-', '');

                reanudar_proceso(idProceso, filaActual);


            } else {
                swal({
                    title: 'Error!',
                    text: 'Reanude la ejecución para reanudar un proceso',
                    type: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
}

function agregar_columna_tabla_listos(proceso, cola, numeroCola, longitud) {
    if (longitud !== 0 && !longitud) {
        longitud = cola.length - 1;
    }

    var tabla = d3.select('#tabla_procesos-' + numeroCola);
    var tbody = tabla.select('tbody');

    var fila = tbody.append('tr')
        .attr('class', 'fila-proceso')
        .attr('id', 'proceso-' + longitud + '-' + numeroCola);

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
        .text(proceso.prioridad);

    fila.append('td')
        .html('<button type="button" class="btn btn-danger" title="Bloquear proceso"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button>')
        .on('click', function() {
            if (!pausado) {
                var filaActual = this.parentNode;
                var idProceso = filaActual.id.replace('proceso-', '');

                bloquear_proceso(idProceso, filaActual, cola, numeroCola);
            } else {
                swal({
                    title: 'Error!',
                    text: 'Reanude la ejecución para bloquear un proceso',
                    type: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
}

function crear_proceso(nombre, rafaga, prioridad) {

    if (!procesoAnterior) {
        procesoAnterior = {
            finalizacion: 0
        };
    }

    var proceso = new Proceso();
    var tiempo = tiempoActual;

    if (tiempo > tiempoLlegada) {
        tiempoLlegada = tiempo;
    }

    proceso.nombre = nombre;
    proceso.rafaga = rafaga;
    proceso.llegada = tiempoLlegada++;

    var cola = [];
    var numeroCola = 0;

    if (rafaga <= 3) {
        proceso.prioridad = 1;
        cola = colasListos[0];
        numeroCola = 1;
    } else if (rafaga > 3 && rafaga <= 6) {
        proceso.prioridad = 2;
        cola = colasListos[1];
        numeroCola = 2;
    } else if (rafaga > 6) {
        proceso.prioridad = 3;
        cola = colasListos[2];
        numeroCola = 3;
    }

    if (prioridad) {
        proceso.prioridad = prioridad;
        cola = colasListos[prioridad-1];
        numeroCola = prioridad;
    }

    proceso.finalizacion = rafaga + procesoAnterior.finalizacion;

    proceso.retorno = proceso.finalizacion - proceso.llegada;
    if (proceso.retorno < 0) {
        proceso.retorno = 0;
    }
    proceso.espera = proceso.retorno - proceso.rafaga;
    if (proceso.espera < 0) {
        proceso.espera = 0;
    }
    proceso.comienzo = proceso.espera + proceso.llegada;

    agregar_proceso_a_listos(proceso, cola);
    agregar_columna_tabla_listos(proceso, cola, numeroCola);

    // window.pintar_proceso(proceso, cola1.length);
}

function ordenar_sjf(cola, i) {
    var tiempo = tiempoActual;
    var colaIniciados = [];
    var colaSinIniciar = [];
    var colaLongitud = cola.length;

    for (var index = 0; index < colaLongitud; index++) {
        if (tiempo >= cola[index].comienzo) {
            colaIniciados.push(cola[index]);
        } else {
            colaSinIniciar.push(cola[index]);
        }
    }

    colasListos[i] = colaIniciados.concat(colaSinIniciar.sort(function(a, b) {
        return a.rafaga - b.rafaga;
    }));

}

function ordenar_listas() {
    for (var index = 0; index < colasListos.length; index++) {
        if (index === 1) {
            ordenar_sjf(colasListos[index], index);
        }
    }
}

function repintar_procesos() {

    ordenar_listas();

    for (var index = 0; index < colasListos.length; index++) {
        var cola = colasListos[index];
        d3.select('#tabla_procesos-' + (index + 1) )
                .select('tbody')
                .html('');

        d3.select('.bar')
            .html('');

        var colaLongitud = cola.length;
        var procesoAnterior;

        for (var i = 0; i < colaLongitud; i++) {
            var proceso = cola[i];
            var finalizacionAnterior = 0;

            if (typeof procesoAnterior === 'object') {
                finalizacionAnterior = procesoAnterior.finalizacion;
            }

            proceso.finalizacion = proceso.rafaga + finalizacionAnterior;

            proceso.retorno = proceso.finalizacion - proceso.llegada;
            if (proceso.retorno < 0) {
                proceso.retorno = 0;
            }
            proceso.espera = proceso.retorno - proceso.rafaga;
            if (proceso.espera < 0) {
                proceso.espera = 0;
            }
            proceso.comienzo = proceso.espera + proceso.llegada;

            if (proceso.bloqueado === false) {
                agregar_columna_tabla_listos(proceso, cola, (index + 1), i);
            }

            procesoAnterior = proceso;
        }
    }

}

function crear_primer_proceso() {
    var nombreInicial = 'Proceso ' + (numeroProcesos++);
    var rafagaInicial = 3;
    crear_proceso(nombreInicial, rafagaInicial);
}

function generar_proceso() {
    var nombre = 'Proceso ' + (numeroProcesos++);
    var rafaga = Math.floor(Math.random() * (10)) + 1;

    crear_proceso(nombre, rafaga, undefined);

    repintar_procesos();
}

function validar_proceso_en_ejecucion() {
    var tiempo = tiempoActual;
    for (var indexCola = 0; indexCola < colasListos.length; indexCola++) {
        var cola = colasListos[indexCola];
        var longitudCola = cola.length;
        for (var indexProceso = 0; indexProceso < longitudCola; indexProceso++) {
            var procesoInterno = cola[indexProceso];
            var indexProcesoBloqueado;

            if (procesoInterno.comienzo <= tiempo && procesoInterno.finalizacion > tiempo) {
                d3.selectAll('.ejecutandose')
                    .classed('ejecutandose', false);

                d3.select('.fila-proceso#proceso-' + indexProceso + '-' + (indexCola + 1))
                    .classed('ejecutandose', true);

                d3.select('.ejecucion.proceso-' + indexProceso)
                    .classed('ejecutandose', true);

                procesoActual = indexProceso;

                d3.select('#proceso_ejecucion').text(procesoInterno.nombre);
                d3.select('#cola_ejecucion').text(procesoInterno.prioridad);
                d3.select("#rafaga_proceso").text(procesoInterno.rafaga);
                d3.select('#tiempo_restante').text(procesoInterno.finalizacion - tiempo);
            }

            if (procesoInterno.finalizacion === tiempo) {
                procesoAnterior = procesoInterno;
            }

            if ((tiempo - procesoInterno.llegada) > tiempoEnvejecimiento && procesoInterno.comienzo > tiempo && typeof procesoInterno.bloqueado !== 'number') {
                procesoInterno.prioridad--;
                indexProcesoBloqueado = bloquear_proceso(indexProceso, undefined, cola, (indexCola + 1), true);
                reanudar_proceso(indexProcesoBloqueado, undefined, (procesoInterno.prioridad), true);
            }

            // Round robin para la cola 3
            if (procesoInterno.rafaga > tiempoQuantum && procesoInterno.comienzo + tiempoQuantum === tiempo && indexCola === 2 && procesoInterno.prioridad === 3 && procesoActual === indexProceso) {
                indexProcesoBloqueado = bloquear_proceso(indexProceso, undefined, cola, (indexCola + 1));
                reanudar_proceso(indexProcesoBloqueado);
            }
        }
    }
}

function ejecutar() {
    crear_primer_proceso();

    for (var index = 0; index < procesosIniciales; index++) {
        generar_proceso();
    }

    timerAgregarProceso = window.setInterval(function() {
        generar_proceso(procesoAnterior);
    }, 5001);

    d3.select('.btn-add').on('click', function() {
        generar_proceso();
    });

    timerValidarProceso = window.setInterval(function() {
        d3.select('#tiempo_actual')
            .text(++tiempoActual);

        validar_proceso_en_ejecucion();

    }, 1000);

}

ejecutar();
