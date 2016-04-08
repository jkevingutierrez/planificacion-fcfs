"use strict";

var width = 960,
    height = 500;

var y = d3.scale.linear()
    .domain([0, 9])
    .range([height, 0]);

var x = d3.scale.linear()
    .domain([0, 31])
    .range([0, width]);

var xAxis = d3.svg.axis()
    .scale(x)
    .tickSize(height)
    .orient("top");

var yAxis = d3.svg.axis()
    .scale(y)
    .tickSize(width)
    .orient("right")
    .tickFormat("");

var svg = d3.select("svg")
    .attr("width", 0)
    .attr("height", 0)
    .append("g")
    .attr("transform", "translate(0, 30)");

var gy = svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(5, 0)")
    .call(yAxis);

var gx = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(5, " + height + ")")
    .call(xAxis);

var bar = svg.append("g")
    .attr("class", "bar")
    .attr("transform", "translate(5, " + (height - 55.5) + ")");

function pintar_proceso(proceso, length) {
	d3.select("svg").attr("height", Number(d3.select("svg").attr("height")) + 61);+
	d3.select("svg").attr("width", Number(d3.select("svg").attr("width")) + (31 * proceso.rafaga) + 5);

    yAxis.tickSize(d3.select("svg").attr("width"));
    gy.call(yAxis);

    bar.append("rect")
	    .attr("class", "restante proceso-" + (length - 1))
	    .attr("x", proceso.llegada * 31)//x=5-->155
	    .attr("y", -(height - ( 55.5 * length)))
	    .attr("width", proceso.retorno * 31)
	    .attr("height", 55.5);

	bar.append("rect")
	    .attr("class", "espera proceso-" + (length - 1))
	    .attr("x", proceso.llegada * 31) //x=5-->155
	    .attr("y", -(height - (55.5 * length)))
	    .attr("width", proceso.espera * 31)
	    .attr("height", 55.5);

	bar.append("rect")
	    .attr("class", "ejecucion proceso-" + (length - 1))
	    .attr("x", proceso.comienzo * 31)//x=5-->155
	    .attr("y", -(height - ( 55.5 * length)))
	    .attr("width", proceso.rafaga * 31)
	    .attr("height", 55.5)

    bar.append("text")
        .attr("class", 'texto-nombre proceso-' + (length - 1))
	    .attr("x", (proceso.llegada * 31) + 40)
	    .attr("y", -(height - (55.5 * length)) + 30)
	    .text(proceso.nombre);

    var textoEspera = bar.append("text")
        .attr("class", 'texto-espera proceso-' + (length - 1))
        .attr("x", (proceso.llegada * 31) + 5)
        .attr("y", -(height - (55.5 * length)) + 30);

    if (proceso.espera > 0) {
        textoEspera.text(proceso.espera);
    }

    bar.append("text")
        .attr("class", 'texto-rafaga proceso-' + (length - 1))
	    .attr("x", (proceso.comienzo * 31) + 5)
	    .attr("y", -(height - (55.5 * length)) + 30)
	    .text(proceso.rafaga);

    bar.append("text")
	    .attr("class", 'texto-restante proceso-' + (length - 1))
	    .attr("y", -(height - (55.5 * length)) + 30);
}
