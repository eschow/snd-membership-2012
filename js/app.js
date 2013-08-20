var $table = $('#members');

function init(){
    ich.grabTemplates();
    drawRows();
    drawMap();
    // makeSums();
}

function makeSums(){
    $.each(members, function(k, v){
        if (v.country === 'United States') {
            // console.log(v.first, regions[v.state]);
            make_sum[regions[v.state]]++;
        } else if (v.country !== undefined) {
            // console.log(v.country, regions[toTitleCase(v.country)]);
            make_sum[regions[toTitleCase(v.country)]]++;
        } else {
            console.log('ERROR: ' + v.country);
        }
    });
    console.log(make_sum);
}

function drawRows(){
    $.each(members, function(k, v){
        v.country = toTitleCase(v.country);
        var row = ich.table_row(v);
        $table.append(row);
    });
    $('#members').dataTable();
}

function drawMap(){
    var width = 960,
        height = 490;

    var projection = d3.geo.equirectangular()
        .scale(150)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("data/combined.json", function(error, data) {
      // svg.append("path")
      //     .datum(units)
      //     .attr("d", path);
        svg.selectAll(".unit")
            .data(topojson.feature(data, data.objects.combined).features)
            .enter().append("path")
            .attr("class", function(d) { return "unit " + d.id; })
            .attr("d", path);

    });    
}

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){ return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

init();