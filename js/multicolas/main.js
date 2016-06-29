var tiempo_actual = 0;
  //lista de colas por prioridad con 1: como mayor prioridad y 3: como la menor
var cola1 = [];
var cola2 = [];
var cola3 = [];

// Clase proceso
class Proceso{
  constructor(){
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

  agregar_proceso(nombre, rafaga) {
    var proceso = new Proceso();
    var tiempo = tiempoActual;
    var finalizacionAnterior = 0;

    if (tiempo > tiempoLlegada) {
        tiempoLlegada = tiempo;
    }

    proceso.nombre = nombre;
    proceso.rafaga = rafaga;
    proceso.llegada = tiempoLlegada++;

    if (typeof procesoAnterior === 'object') {
        finalizacionAnterior = procesoAnterior.finalizacion;
    }

    proceso.finalizacion = rafaga + finalizacionAnterior;

    proceso.retorno = proceso.finalizacion - proceso.llegada;
    if (proceso.retorno < 0) {
        proceso.retorno = 0;
    }
    proceso.espera = proceso.retorno - proceso.rafaga;
    if (proceso.espera < 0) {
        proceso.espera = 0;
    }
    proceso.comienzo = proceso.espera + proceso.llegada;

  }
}

var Multicolas = {};

//create library
Multicolas = (function (){


  //funcion para bajar el proceso de prioridad
  var bajar_proceso = function(cola, index){
    if (cola[index].proceso == 1){
      cola2.push(cola[index]);
      cola.splice(index, 1);
    }else if (cola[index].proceso == 2){
      cola3.push(cola[index]);
      cola.splice(index, 1);
    }
  }

  //funcion para subir el proceso de prioridad
  var subir_proceso = function(cola, index){
    if (cola[index].proceso == 3){
      cola2.push(cola[index]);
      cola.splice(index, 1);
    }else if (cola[index].proceso == 2){
      cola1.push(cola[index]);
      cola.splice(index, 1);
    }
  }

  //funciones publicas
  return{
    insertar_proceso: function(proceso){
                        if (proceso.rafaga < 6){
                          cola1.push(proceso);
                          proceso.cola = 1;
                        }else if((proceso.rafaga>5) && (proceso < 10)){
                          cola2.push(proceso);
                          proceso.cola = 2;
                        }else{
                          cola3.push(proceso);
                          proceso.cola = 3;
                        }
                      },
    evaluar_proceso: function(cola, index){
                       if (cola[index].rafaga<6){
                         this.subir_proceso(cola, index);
                       }else if (cola[index].tiempo_en_cola>8){
                         this.bajar_proceso(cola, index);
                       }
                     },
    recorrer_colas: function(){

                    },
  };
});
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
//---------------------------- ROUND ROBIN --------------------------------
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
var RoundRobin = {};
RoundRobin = (function() {
    'use strict';

    // Variables globales
    var cola1 = [];
    var colaBloqueados = [];
    var numeroProcesos = 0;
    var tiempoActual = 0;
    var tiempoLlegada = 0;
    var procesoActual = 0;
    var pausado = false;

    var timerValidarProceso = 0;
    var timerAgregarProceso = 0;

    var rect = {
        width: 18,
        height: 40
    };

    var constantes = {
        TIEMPOESPERA: 5001,
        PROCESOSINICIALES: 5,
        TIEMPOQUANTUM: 5,
        RAFAGARANDOM: 10
    };

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

    function Main() {}

    // Funciones
    function agregar_proceso_a_listos(proceso) {
        cola1.push(proceso);
    }

    function agregar_proceso_a_bloqueados(proceso) {
        colaBloqueados.push(proceso);
    }

    function crear_proceso(nombre, rafaga) {
        var proceso = new Proceso();
        var tiempo = tiempoActual;
        var procesoAnterior = cola1[cola1.length-1];
        var finalizacionAnterior = 0;

        if (tiempo > tiempoLlegada) {
            tiempoLlegada = tiempo;
        }

        proceso.nombre = nombre;
        proceso.rafaga = rafaga;
        proceso.llegada = tiempoLlegada++;

        if (typeof procesoAnterior === 'object') {
            finalizacionAnterior = procesoAnterior.finalizacion;
        }

        proceso.finalizacion = rafaga + finalizacionAnterior;

        proceso.retorno = proceso.finalizacion - proceso.llegada;
        if (proceso.retorno < 0) {
            proceso.retorno = 0;
        }
        proceso.espera = proceso.retorno - proceso.rafaga;
        if (proceso.espera < 0) {
            proceso.espera = 0;
        }
        proceso.comienzo = proceso.espera + proceso.llegada;

        agregar_proceso_a_listos(proceso);
        agregar_columna_tabla_listos(proceso);
        window.pintar_proceso(proceso, cola1.length);
    }

    function bloquear_proceso(idProceso, fila) {
        var tiempo = tiempoActual;
        var proceso = cola1[idProceso];
        if (tiempo < proceso.finalizacion && tiempo >= proceso.comienzo) {
            if (typeof fila !== 'object') {
                fila = d3.select('.fila-proceso#proceso-' + idProceso);
            }

            d3.selectAll('.proceso-' + idProceso)
                .classed('bloqueado', true);

            d3.select('.ejecucion.proceso-' + idProceso)
                .attr('width', (tiempo - proceso.comienzo) * rect.width);

            d3.select('.restante.proceso-' + idProceso)
                .attr('x', (tiempo) * rect.width)
                .attr('width', (proceso.finalizacion - tiempo) * rect.width);

            d3.select('.texto-restante.proceso-' + idProceso)
                .attr('x', ((tiempo) * rect.width) + 5)
                .text(proceso.finalizacion - tiempo);

            d3.select('.texto-rafaga.proceso-' + idProceso)
                .text(tiempo - proceso.comienzo);

            proceso.nombre = proceso.nombre.replace('(Reanudado)', '');

            var rafagaTotal = proceso.rafaga;
            proceso.rafaga = proceso.finalizacion - tiempo;
            proceso.rafagaFaltante = proceso.finalizacion - tiempo;
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

            cola1[idProceso].rafaga = tiempo - proceso.comienzo;
            actualizar_procesos(idProceso);

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

    function actualizar_procesos(idProceso) {
        var longitudCola = cola1.length;
        for (var i = (Number(idProceso) + 1); i < longitudCola; i++) {
            var procesoAnterior = cola1[i-1];
            var finalizacionAnterior = 0;

            if (typeof procesoAnterior === 'object') {
                finalizacionAnterior = procesoAnterior.finalizacion;
            }

            cola1[i].finalizacion = cola1[i].rafaga + finalizacionAnterior;

            cola1[i].retorno = cola1[i].finalizacion - cola1[i].llegada;
            if (cola1[i].retorno < 0) {
                cola1[i].retorno = 0;
            }
            cola1[i].espera = cola1[i].retorno - cola1[i].rafaga;
            if (cola1[i].espera < 0) {
                cola1[i].espera = 0;
            }
            cola1[i].comienzo = cola1[i].espera + cola1[i].llegada;

            actualizar_columna_tabla_listos(i, cola1[i]);
            actualizar_gantt(i, cola1[i]);
        }
    }

    function actualizar_columna_tabla_listos(id, proceso) {
        var tr = d3.select('#proceso-' + (id)).selectAll('td');
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

    function actualizar_gantt(id, proceso) {
        d3.select('.ejecucion.proceso-' + id)
            .attr('x', proceso.comienzo * rect.width)
            .attr("width", proceso.rafaga * rect.width);

        if (proceso.espera > 0) {
            d3.select('.espera.proceso-' + id)
                .attr("x", proceso.llegada * rect.width)
                .attr('width', proceso.espera * rect.width);

            d3.select('.texto-espera.proceso-' + id)
                .attr("x", (proceso.llegada * rect.width) + 5)
                .text(proceso.espera);
        } else {
            d3.select('.espera.proceso-' + id)
                .attr("x", proceso.llegada * rect.width)
                .attr('width', 0);

            d3.select('.texto-espera.proceso-' + id)
                .attr("x", (proceso.llegada * rect.width) + 5)
                .text('');
        }

        d3.select('.texto-rafaga.proceso-' + id)
            .attr("x", (proceso.comienzo * rect.width) + 5)
            .text(proceso.rafaga);
    }

    function crear_primer_proceso() {
        var nombreInicial = 'Proceso ' + (numeroProcesos++);
        var rafagaInicial = 8;
        crear_proceso(nombreInicial, rafagaInicial);
    }

    function generar_proceso() {
        var nombre = 'Proceso ' + (numeroProcesos++);
        var rafaga = Math.floor((Math.random() * constantes.RAFAGARANDOM) + 1);
        crear_proceso(nombre, rafaga);
    }

    function agregar_columna_tabla_listos(proceso) {
        var tabla = d3.select('#tabla_procesos');
        var tbody = tabla.select('tbody');

        var fila = tbody.append('tr')
            .attr('class', 'fila-proceso')
            .attr('id', 'proceso-' + (cola1.length - 1));

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
                if (!pausado) {
                    var filaActual = this.parentNode;
                    var idProceso = filaActual.id.replace('proceso-', '');

                    bloquear_proceso(idProceso, filaActual);
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

    function reanudar_proceso(idProceso, fila) {
        if (typeof fila !== 'object') {
            fila = d3.select('.fila-bloqueado#proceso-' + idProceso);
        }

        var proceso = new Proceso();

        proceso.rafaga = colaBloqueados[idProceso].rafagaFaltante;
        proceso.nombre = colaBloqueados[idProceso].nombre + ' (Reanudado)';

        crear_proceso(proceso.nombre, proceso.rafaga);
        if (fila) {
            fila.remove();
        }
    }

    function validar_proceso_en_ejecucion() {
        var tiempo = tiempoActual;
        var longitudCola = cola1.length;
        for (var indexProceso = procesoActual; indexProceso < longitudCola; indexProceso++) {
            var procesoInterno = cola1[indexProceso];

            if (procesoInterno.rafaga > constantes.TIEMPOQUANTUM && procesoInterno.comienzo + constantes.TIEMPOQUANTUM === tiempo) {
                var indexProcesoBloqueado = bloquear_proceso(indexProceso);
                reanudar_proceso(indexProcesoBloqueado);
            }

            if (procesoInterno.comienzo <= tiempo && procesoInterno.finalizacion > tiempo) {
                d3.selectAll('.ejecutandose')
                    .classed('ejecutandose', false);

                d3.select('.fila-proceso#proceso-' + indexProceso)
                    .classed('ejecutandose', true);

                d3.select('.ejecucion.proceso-' + indexProceso)
                    .classed('ejecutandose', true);

                procesoActual = indexProceso;

                d3.select('#proceso_ejecucion').text(procesoInterno.nombre);
                d3.select("#rafaga_proceso").text(procesoInterno.rafaga);
                d3.select('#tiempo_restante').text(procesoInterno.finalizacion - tiempo);
            }
        }
    }

    Main.prototype.ejecutar = function() {
        crear_primer_proceso();

        for (var index = 0; index < constantes.PROCESOSINICIALES; index++) {
            generar_proceso();
        }

        timerAgregarProceso = window.setInterval(function() {
            generar_proceso();
        }, constantes.TIEMPOESPERA);

        timerValidarProceso = window.setInterval(function() {
            d3.select('#tiempo_actual')
                .text(++tiempoActual);

            validar_proceso_en_ejecucion();

        }, 1000);

        d3.select('.btn-add').on('click', function() {
            generar_proceso();
        });

        var toggleBtn = d3.select('#toggle-play').on('click', function() {
            if (toggleBtn.classed('pause-btn')) {
                clearInterval(timerAgregarProceso);
                clearInterval(timerValidarProceso);
                toggleBtn.html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Reanudar ejecución')
                    .attr('class', 'btn btn-success play-btn');

                pausado = true;
            } else if (toggleBtn.classed('play-btn')) {
                timerAgregarProceso = window.setInterval(function() {
                    generar_proceso();
                }, constantes.TIEMPOESPERA);

                timerValidarProceso = window.setInterval(function() {
                    d3.select('#tiempo_actual')
                        .text(++tiempoActual);

                    validar_proceso_en_ejecucion();

                }, 1000);

                toggleBtn.html('<span class="glyphicon glyphicon-pause" aria-hidden="true"></span> Pausar ejecución')
                    .attr('class', 'btn btn-danger pause-btn');

                pausado = false;
            }
        });
    };

    // Ejecución de funciones
    var main = new Main();
    main.ejecutar();

})();
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
//---------------------------- SJF ----------------------------------------
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
var Sjf = {}
Sjf = (function() {
    'use strict';

    // Variables globales
    var cola2 = [];
    var colaBloqueados = [];
    var numeroProcesos = 0;
    var tiempoActual = 0;
    var tiempoLlegada = 0;
    var procesoActual = 0;
    var pausado = false;

    var timerValidarProceso = 0;
    var timerAgregarProceso = 0;

    var rect = {
        width: 18,
        height: 40
    };

    var constantes = {
        TIEMPOESPERA: 5001,
        PROCESOSINICIALES: 5,
        RAFAGARANDOM: 10
    };

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

    function Main() {}

    // Funciones
    function aggregar_proceso_a_listos(proceso) {
        cola2.push(proceso);
    }

    function agregar_proceso_a_bloqueados(proceso) {
        colaBloqueados.push(proceso);
    }

    function crear_proceso(nombre, rafaga) {
        var proceso = new Proceso();
        var tiempo = tiempoActual;
        var procesoAnterior = cola2[cola2.length-1];
        var finalizacionAnterior = 0;

        if (tiempo > tiempoLlegada) {
            tiempoLlegada = tiempo;
        }

        proceso.nombre = nombre;
        proceso.rafaga = rafaga;
        proceso.llegada = tiempoLlegada++;

        if (typeof procesoAnterior === 'object') {
            finalizacionAnterior = procesoAnterior.finalizacion;
        }

        proceso.finalizacion = rafaga + finalizacionAnterior;

        proceso.retorno = proceso.finalizacion - proceso.llegada;
        if (proceso.retorno < 0) {
            proceso.retorno = 0;
        }
        proceso.espera = proceso.retorno - proceso.rafaga;
        if (proceso.espera < 0) {
            proceso.espera = 0;
        }
        proceso.comienzo = proceso.espera + proceso.llegada;

        aggregar_proceso_a_listos(proceso);
    }

    function bloquear_proceso(idProceso, fila) {
        var tiempo = tiempoActual;
        var proceso = cola2[idProceso];
        if (tiempo < proceso.finalizacion && tiempo >= proceso.comienzo) {
            if (typeof fila !== 'object') {
                fila = d3.select('.fila-proceso#proceso-' + idProceso);
            }

            d3.selectAll('.proceso-' + idProceso)
                .classed('bloqueado', true);

            d3.select('.ejecucion.proceso-' + idProceso)
                .attr('width', (tiempo - proceso.comienzo) * rect.width);

            d3.select('.restante.proceso-' + idProceso)
                .attr('x', (tiempo) * rect.width)
                .attr('width', (proceso.finalizacion - tiempo) * rect.width);

            d3.select('.texto-restante.proceso-' + idProceso)
                .attr('x', ((tiempo) * rect.width) + 5)
                .text(proceso.finalizacion - tiempo);

            d3.select('.texto-rafaga.proceso-' + idProceso)
                .text(tiempo - proceso.comienzo);

            proceso.nombre = proceso.nombre.replace('(Reanudado)', '');

            var rafagaTotal = proceso.rafaga;
            proceso.rafaga = proceso.finalizacion - tiempo;
            proceso.rafagaFaltante = proceso.finalizacion - tiempo;
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

            cola2[idProceso].rafaga = tiempo - proceso.comienzo;
            actualizar_procesos(idProceso);

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

    function ordenar_lista() {
        var tiempo = tiempoActual;
        var cola2Iniciados = [];
        var cola2SinIniciar = [];
        var cola2Longitud = cola2.length;

        for (var index = 0; index < cola2Longitud; index++) {
            if (tiempo >= cola2[index].comienzo) {
                cola2Iniciados.push(cola2[index]);
            } else {
                cola2SinIniciar.push(cola2[index]);
            }
        }

        cola2 = cola2Iniciados.concat(cola2SinIniciar.sort(function(a, b) {
            return a.rafaga - b.rafaga;
        }));
    }

    function repintar_procesos() {

        ordenar_lista();

        d3.select('#tabla_procesos')
            .select('tbody')
            .html('');

        d3.select('.bar')
            .html('');

        var cola2Longitud = cola2.length;

        for (var i = 0; i < cola2Longitud; i++) {
            var proceso = cola2[i];
            var procesoAnterior = cola2[i-1];
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
                agregar_columna_tabla_listos(proceso, i);
            }

            window.pintar_proceso(proceso, i + 1);
        }
    }

    function actualizar_procesos(idProceso) {
        var longitudCola = cola2.length;
        for (var i = (Number(idProceso) + 1); i < longitudCola; i++) {
            var procesoAnterior = cola2[i-1];
            var finalizacionAnterior = 0;

            if (typeof procesoAnterior === 'object') {
                finalizacionAnterior = procesoAnterior.finalizacion;
            }

            cola2[i].finalizacion = cola2[i].rafaga + finalizacionAnterior;

            cola2[i].retorno = cola2[i].finalizacion - cola2[i].llegada;
            if (cola2[i].retorno < 0 ) {
                cola2[i].retorno = 0;
            }
            cola2[i].espera = cola2[i].retorno - cola2[i].rafaga;
            if (cola2[i].espera < 0 ) {
                cola2[i].espera = 0;
            }
            cola2[i].comienzo = cola2[i].espera + cola2[i].llegada;

            actualizar_columna_tabla_listos(i, cola2[i]);
            actualizar_gantt(i, cola2[i]);
        }
    }

    function actualizar_columna_tabla_listos(id, proceso) {
        var tr = d3.select('#proceso-' + (id)).selectAll('td');
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

    function actualizar_gantt(id, proceso) {
        d3.select('.ejecucion.proceso-' + id)
            .attr('x', proceso.comienzo * rect.width)
            .attr("width", proceso.rafaga * rect.width);

        if (proceso.espera > 0) {
            d3.select('.espera.proceso-' + id)
                .attr("x", proceso.llegada * rect.width)
                .attr('width', proceso.espera * rect.width);

            d3.select('.texto-espera.proceso-' + id)
                .attr("x", (proceso.llegada * rect.width) + 5)
                .text(proceso.espera);
        } else {
            d3.select('.espera.proceso-' + id)
                .attr("x", proceso.llegada * rect.width)
                .attr('width', 0);

            d3.select('.texto-espera.proceso-' + id)
                .attr("x", (proceso.llegada * rect.width) + 5)
                .text('');
        }

        d3.select('.texto-rafaga.proceso-' + id)
            .attr("x", (proceso.comienzo * rect.width) + 5)
            .text(proceso.rafaga);
    }

    function crear_primer_proceso() {
        var nombreInicial = 'Proceso ' + (numeroProcesos++);
        var rafagaInicial = 8;
        crear_proceso(nombreInicial, rafagaInicial);
    }

    function generar_proceso() {
        var nombre = 'Proceso ' + (numeroProcesos++);
        var rafaga = Math.floor((Math.random() * constantes.RAFAGARANDOM) + 1);
        crear_proceso(nombre, rafaga);

        repintar_procesos();
    }

    function agregar_columna_tabla_listos(proceso, longitud) {
        if (longitud !== 0 && !longitud) {
            longitud = cola2.length - 1;
        }

         var tbody = d3.select('#tabla_procesos')
            .select('tbody');

        var fila = tbody.append('tr')
            .attr('class', 'fila-proceso')
            .attr('id', 'proceso-' + longitud);

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
                if (!pausado) {
                    var filaActual = this.parentNode;
                    var idProceso = filaActual.id.replace('proceso-', '');

                    bloquear_proceso(idProceso, filaActual);
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

    function reanudar_proceso(idProceso, fila) {
        if (!fila) {
            fila = d3.select('.fila-bloqueado#proceso-' + idProceso);
        }

        var proceso = new Proceso();

        proceso.rafaga = colaBloqueados[idProceso].rafagaFaltante;
        proceso.nombre = colaBloqueados[idProceso].nombre + ' (Reanudado)';

        crear_proceso(proceso.nombre, proceso.rafaga);
        repintar_procesos();
        if (fila) {
            fila.remove();
        }
    }

    function validar_proceso_en_ejecucion() {
        var tiempo = tiempoActual;
        var longitudCola = cola2.length;
        for (var indexProceso = procesoActual; indexProceso < longitudCola; indexProceso++) {
            var procesoInterno = cola2[indexProceso];
            if (procesoInterno.comienzo <= tiempo && procesoInterno.finalizacion >= tiempo) {

                d3.selectAll('.ejecutandose')
                    .classed('ejecutandose', false);

                d3.select('.fila-proceso#proceso-' + indexProceso)
                    .classed('ejecutandose', true);

                d3.select('.ejecucion.proceso-' + indexProceso)
                    .classed('ejecutandose', true);

                procesoActual = indexProceso;

                d3.select('#proceso_ejecucion').text(procesoInterno.nombre);
                d3.select("#rafaga_proceso").text(procesoInterno.rafaga);
                d3.select('#tiempo_restante').text(procesoInterno.finalizacion - tiempo);
            }
        }
    }

    Main.prototype.ejecutar = function() {
        crear_primer_proceso();

        for (var index = 0; index < constantes.PROCESOSINICIALES; index++) {
            generar_proceso();
        }

        timerAgregarProceso = window.setInterval(function() {
            generar_proceso();
        }, constantes.TIEMPOESPERA);

        timerValidarProceso = window.setInterval(function() {
            d3.select('#tiempo_actual')
                .text(++tiempoActual);

            validar_proceso_en_ejecucion();

        }, 1000);

        d3.select('.btn-add').on('click', function() {
            generar_proceso();
        });

        var toggleBtn = d3.select('#toggle-play').on('click', function() {
            if (toggleBtn.classed('pause-btn')) {
                clearInterval(timerAgregarProceso);
                clearInterval(timerValidarProceso);
                toggleBtn.html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Reanudar ejecución')
                    .attr('class', 'btn btn-success play-btn');

                pausado = true;
            } else if (toggleBtn.classed('play-btn')) {
                timerAgregarProceso = window.setInterval(function() {
                    generar_proceso();
                }, constantes.TIEMPOESPERA);

                timerValidarProceso = window.setInterval(function() {
                    d3.select('#tiempo_actual')
                        .text(++tiempoActual);

                    validar_proceso_en_ejecucion();

                }, 1000);

                toggleBtn.html('<span class="glyphicon glyphicon-pause" aria-hidden="true"></span> Pausar ejecución')
                    .attr('class', 'btn btn-danger pause-btn');

                pausado = false;
            }
        });
    };

    // Ejecución de funciones
    var main = new Main();
    main.ejecutar();

})();
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
//---------------------------- ALGORITMO FCFS  ----------------------------
//-------------------------------------------------------------------------
//-------------------------------------------------------------------------
var Fcfs = {};
Fcfs = (function() {
    'use strict';

    // Variables globales
    var cola3 = [];
    var colaBloqueados = [];
    var numeroProcesos = 0;
    var tiempoActual = 0;
    var tiempoLlegada = 0;
    var procesoActual = 0;
    var pausado = false;

    var timerValidarProceso = 0;
    var timerAgregarProceso = 0;

    var rect = {
        width: 18,
        height: 40
    };

    var constantes = {
        TIEMPOESPERA: 5001,
        PROCESOSINICIALES: 5,
        RAFAGARANDOM: 10
    };

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

    function Main() {}

    // Funciones
    function agregar_proceso_a_listos(proceso) {
        cola3.push(proceso);
    }

    function agregar_proceso_a_bloqueados(proceso) {
        colaBloqueados.push(proceso);
    }

    function crear_proceso(nombre, rafaga) {
        var proceso = new Proceso();
        var tiempo = tiempoActual;
        var procesoAnterior = cola3[cola3.length-1];
        var finalizacionAnterior = 0;

        if (tiempo > tiempoLlegada) {
            tiempoLlegada = tiempo;
        }

        proceso.nombre = nombre;
        proceso.rafaga = rafaga;
        proceso.llegada = tiempoLlegada++;

        if (typeof procesoAnterior === 'object') {
            finalizacionAnterior = procesoAnterior.finalizacion;
        }

        proceso.finalizacion = rafaga + finalizacionAnterior;

        proceso.retorno = proceso.finalizacion - proceso.llegada;
        if (proceso.retorno < 0) {
            proceso.retorno = 0;
        }
        proceso.espera = proceso.retorno - proceso.rafaga;
        if (proceso.espera < 0) {
            proceso.espera = 0;
        }
        proceso.comienzo = proceso.espera + proceso.llegada;

        agregar_proceso_a_listos(proceso);
        agregar_columna_tabla_listos(proceso);
        window.pintar_proceso(proceso, cola3.length);
    }

    function bloquear_proceso(idProceso, fila) {
        var tiempo = tiempoActual;
        var proceso = cola3[idProceso];
        if (tiempo < proceso.finalizacion && tiempo >= proceso.comienzo) {
            if (typeof fila !== 'object') {
                fila = d3.select('.fila-proceso#proceso-' + idProceso);
            }

            d3.selectAll('.proceso-' + idProceso)
                .classed('bloqueado', true);

            d3.select('.ejecucion.proceso-' + idProceso)
                .attr('width', (tiempo - proceso.comienzo) * rect.width);

            d3.select('.restante.proceso-' + idProceso)
                .attr('x', (tiempo) * rect.width)
                .attr('width', (proceso.finalizacion - tiempo) * rect.width);

            d3.select('.texto-restante.proceso-' + idProceso)
                .attr('x', ((tiempo) * rect.width) + 5)
                .text(proceso.finalizacion - tiempo);

            d3.select('.texto-rafaga.proceso-' + idProceso)
                .text(tiempo - proceso.comienzo);

            proceso.nombre = proceso.nombre.replace('(Reanudado)', '');

            var rafagaTotal = proceso.rafaga;
            proceso.rafaga = proceso.finalizacion - tiempo;
            proceso.rafagaFaltante = proceso.finalizacion - tiempo;
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

            cola3[idProceso].rafaga = tiempo - proceso.comienzo;
            actualizar_procesos(idProceso);

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

    function actualizar_procesos(idProceso) {
        var longitudCola = cola3.length;
        for (var i = (Number(idProceso) + 1); i < longitudCola; i++) {
            var procesoAnterior = cola3[i-1];
            var finalizacionAnterior = 0;

            if (typeof procesoAnterior === 'object') {
                finalizacionAnterior = procesoAnterior.finalizacion;
            }

            cola3[i].finalizacion = cola3[i].rafaga + finalizacionAnterior;

            cola3[i].retorno = cola3[i].finalizacion - cola3[i].llegada;
            if (cola3[i].retorno < 0) {
                cola3[i].retorno = 0;
            }
            cola3[i].espera = cola3[i].retorno - cola3[i].rafaga;
            if (cola3[i].espera < 0) {
                cola3[i].espera = 0;
            }
            cola3[i].comienzo = cola3[i].espera + cola3[i].llegada;

            actualizar_columna_tabla_listos(i, cola3[i]);
            actualizar_gantt(i, cola3[i]);
        }
    }

    function actualizar_columna_tabla_listos(id, proceso) {
        var tr = d3.select('#proceso-' + (id)).selectAll('td');
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

    function actualizar_gantt(id, proceso) {
        d3.select('.ejecucion.proceso-' + id)
            .attr('x', proceso.comienzo * rect.width)
            .attr("width", proceso.rafaga * rect.width);

        if (proceso.espera > 0) {
            d3.select('.espera.proceso-' + id)
                .attr("x", proceso.llegada * rect.width)
                .attr('width', proceso.espera * rect.width);

            d3.select('.texto-espera.proceso-' + id)
                .attr("x", (proceso.llegada * rect.width) + 5)
                .text(proceso.espera);
        } else {
            d3.select('.espera.proceso-' + id)
                .attr("x", proceso.llegada * rect.width)
                .attr('width', 0);

            d3.select('.texto-espera.proceso-' + id)
                .attr("x", (proceso.llegada * rect.width) + 5)
                .text('');
        }

        d3.select('.texto-rafaga.proceso-' + id)
            .attr("x", (proceso.comienzo * rect.width) + 5)
            .text(proceso.rafaga);
    }

    function crear_primer_proceso() {
        var nombreInicial = 'Proceso ' + (numeroProcesos++);
        var rafagaInicial = 8;
        crear_proceso(nombreInicial, rafagaInicial);
    }

    function generar_proceso() {
        var nombre = 'Proceso ' + (numeroProcesos++);
        var rafaga = Math.floor((Math.random() * constantes.RAFAGARANDOM) + 1);
        crear_proceso(nombre, rafaga);
    }

    function agregar_columna_tabla_listos(proceso) {
        var tabla = d3.select('#tabla_procesos');
        var tbody = tabla.select('tbody');

        var fila = tbody.append('tr')
            .attr('class', 'fila-proceso')
            .attr('id', 'proceso-' + (cola3.length - 1));

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
                if (!pausado) {
                    var filaActual = this.parentNode;
                    var idProceso = filaActual.id.replace('proceso-', '');

                    bloquear_proceso(idProceso, filaActual);
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

    function reanudar_proceso(idProceso, fila) {
        if (typeof fila !== 'object') {
            fila = d3.select('.fila-bloqueado#proceso-' + idProceso);
        }

        var proceso = new Proceso();

        proceso.rafaga = colaBloqueados[idProceso].rafagaFaltante;
        proceso.nombre = colaBloqueados[idProceso].nombre + ' (Reanudado)';

        crear_proceso(proceso.nombre, proceso.rafaga);
        if (fila) {
            fila.remove();
        }
    }

    function validar_proceso_en_ejecucion() {
        var tiempo = tiempoActual;
        var longitudCola = cola3.length;
        for (var indexProceso = procesoActual; indexProceso < longitudCola; indexProceso++) {
            var procesoInterno = cola3[indexProceso];
            if (procesoInterno.comienzo <= tiempo && procesoInterno.finalizacion > tiempo) {
                d3.selectAll('.ejecutandose')
                    .classed('ejecutandose', false);

                d3.select('.fila-proceso#proceso-' + indexProceso)
                    .classed('ejecutandose', true);

                d3.select('.ejecucion.proceso-' + indexProceso)
                    .classed('ejecutandose', true);

                procesoActual = indexProceso;

                d3.select('#proceso_ejecucion').text(procesoInterno.nombre);
                d3.select("#rafaga_proceso").text(procesoInterno.rafaga);
                d3.select('#tiempo_restante').text(procesoInterno.finalizacion - tiempo);
            }
        }
    }

    Main.prototype.ejecutar = function() {
        crear_primer_proceso();

        for (var index = 0; index < constantes.PROCESOSINICIALES; index++) {
            generar_proceso();
        }

        timerAgregarProceso = window.setInterval(function() {
            generar_proceso();
        }, constantes.TIEMPOESPERA);

        timerValidarProceso = window.setInterval(function() {
            d3.select('#tiempo_actual')
                .text(++tiempoActual);

            validar_proceso_en_ejecucion();

        }, 1000);

        d3.select('.btn-add').on('click', function() {
            generar_proceso();
        });

        var toggleBtn = d3.select('#toggle-play').on('click', function() {
            if (toggleBtn.classed('pause-btn')) {
                clearInterval(timerAgregarProceso);
                clearInterval(timerValidarProceso);
                toggleBtn.html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Reanudar ejecución')
                    .attr('class', 'btn btn-success play-btn');

                pausado = true;
            } else if (toggleBtn.classed('play-btn')) {
                timerAgregarProceso = window.setInterval(function() {
                    generar_proceso();
                }, constantes.TIEMPOESPERA);

                timerValidarProceso = window.setInterval(function() {
                    d3.select('#tiempo_actual')
                        .text(++tiempoActual);

                    validar_proceso_en_ejecucion();

                }, 1000);

                toggleBtn.html('<span class="glyphicon glyphicon-pause" aria-hidden="true"></span> Pausar ejecución')
                    .attr('class', 'btn btn-danger pause-btn');

                pausado = false;
            }
        });
    };

    // Ejecución de funciones
    var main = new Main();
    main.ejecutar();

})();

