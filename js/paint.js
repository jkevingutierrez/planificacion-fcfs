var margin = {top: 20, right: 0, bottom: 20, left: 0},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var gy = svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)

var gx = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
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
    .attr("transform", function(d) { return "translate(" + 0 + "," + (y(d.y) - 51) + ")"; });

function pintar_proceso(espera, comienzo, llegada, finalizacion, rafaga, length){
	console.log("entra");
	d3.select("svg").attr("height", Number(d3.select("svg").attr('height')) + 51);
	d3.select("svg").attr("width", Number(d3.select("svg").attr('width')) + (31*10));
	bar.append("rect")
	    .attr("x", llegada*31) //x=5-->155
	    .attr("class", "gris")
	    .attr("y", -1*(height-(51*length)))
	    .attr("width", espera*31)
	    .attr("height", 51);
	bar.append("rect")
	    .attr("x", comienzo*31)//x=5-->155
	    .attr("class", "azul")
	    .attr("y", -1*(height-(51*length)))
	    .attr("width", rafaga*31)
	    .attr("height", 51);
}
