function Proceso(){ 
	this.nombre= "X";
	this.llegada= 0;
	this.rafaga= 0;
	this.comienzo = 0;
	this.finalizacion = this.rafaga;
	this.retorno = this.finalizacion - this.llegada;
	this.espera = this.retorno - this.rafaga;
};

var cola = [];

function primer_proceso(){
	var procesoA = new Proceso();
	procesoA.nombre = "A";
	procesoA.rafaga = 8;
	procesoA.finalizacion = procesoA.rafaga;
	procesoA.retorno = procesoA.finalizacion - procesoA.llegada;
	procesoA.espera = procesoA.retorno - procesoA.rafaga;
	add_process(procesoA);
	return procesoA;

}
function random_proceso(){
	var procesoX = new Proceso();
	procesoX.llegada = cola.length;
	procesoX.nombre = cola.length;
	procesoX.rafaga = (Math.floor(Math.random()*10)+1);
	procesoX.finalizacion = (Math.floor(Math.random()*10)+1);
	tam = cola.length;
	for (var i = 0; i < tam; i++) {
		console.log("----------------------------");
		console.log(cola[i].rafaga);
		console.log("----------------------------");
		procesoX.finalizacion = cola[i].rafaga + procesoX.finalizacion;
	};
	procesoX.retorno = procesoX.finalizacion - procesoX.llegada;
	procesoX.espera = procesoX.retorno - procesoX.rafaga;
	add_process(procesoX);
}

function add_process(proceso){
	cola.push(proceso);
}

function inicio(){
	primer_proceso();
	for (var i = 0; i <= 5; i++) {
		random_proceso();
	};
	for (var i = 0; i < cola.length; i++) {
		console.log(cola[i]);
	};
	
}