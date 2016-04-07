"use strict";

var width = 960,
    height = 500;

var formatNumber = d3.format(1);

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
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0, 30)");

var gy = svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(5, 0)")
    .call(yAxis);

var gx = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(5," + height + ")")
    .call(xAxis);

//------------
var values = d3.range(1000).map(d3.random.bates(10));

var data = d3.layout.histogram()
    .bins(x.ticks(20))
    (values);

var bar = svg.selectAll(".bar")
    .data(data)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(5," + (y(d.y) - 55.5) + ")"; });

function pintar_proceso(proceso, length){
	d3.select("svg").attr("height", Number(d3.select("svg").attr("height")) + 55.5);
	d3.select("svg").attr("width", Number(d3.select("svg").attr("width")) + (31*10));
	bar.append("rect")
	    .attr("x", proceso.llegada*31) //x=5-->155
	    .attr("class", "gris proceso-" + (length-1))
	    .attr("y", -1*(height-(55.5*length)))
	    .attr("width", proceso.espera*31)
	    .attr("height", 55.5);

	bar.append("rect")
	    .attr("x", proceso.comienzo*31)//x=5-->155
	    .attr("class", "azul proceso-" + (length-1))
	    .attr("y", -1*(height-(55.5*length)))
	    .attr("width", proceso.rafaga*31)
	    .attr("height", 55.5);

    bar.append("text")
	    .attr("x", proceso.llegada*31 + 20) //x=5-->155
	    .attr("y", -1*(height-(55.5*length)) + 30)
	    .text(proceso.nombre);
}
