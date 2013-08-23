var $table = $('#members'),
    $infobox = $('#info-box');

function init(){
    ich.grabTemplates();
    drawRows();
    drawMap();
    // makeSums();
}

var US_counts = {};
var abroad_counts = {};

function makeSums(){
    $.each(members, function(k, v){
        if (v.country === 'U.S.') {
            if (US_counts[v.state]){
                US_counts[v.state]++;
            } else {
                US_counts[v.state] = 1;
            }
        } else if (v.country !== undefined) {
            if (abroad_counts[v.country]){
                abroad_counts[v.country]++;
            } else {
                abroad_counts[v.country] = 1;
            }
        } else {
            console.log('ERROR: ' + v.country);
        }
    });
    console.log(US_counts);
    console.log(abroad_counts);
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

    var quantize = d3.scale.quantize()
        .domain([0, 85])
        .range(d3.range(5).map(function(i) { return "q" + i + "-9"; }));

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
            .attr("class", function(d) { 
                var id = d.properties.name;
                console.log(id, quantize(totals[id]));
                return "unit " + id + " " + quantize(totals[id]);
            })
            .attr("d", path)
            .on('mouseenter', function(d){
                showBox(d.properties);
            })
            .on('mouseleave', function(e){
                hideBox();
            });
    });    

    addEventListeners();
}

function addEventListeners(){
    $(window).mousemove(function(e){
        var $c = $infobox.parent(),
            offset = $c.offset(),
            midX = $c.outerWidth() / 2;

        var mouse_x = e.pageX - offset.left + 10,
            mouse_y = e.pageY - offset.top + 10,
            x = mouse_x > midX ? mouse_x - $infobox.outerWidth() - 10 : mouse_x,
            y = mouse_y;

        $infobox.css({
            'left' : x,
            'top' : y
        });
    });
}

function showBox(d){
    if (totals[d.name]){
        $infobox.find('#region').html('Region ' + regions[d.name]);
        $infobox.find('#member-total').html(totals[d.name]);
        $infobox.find('#location').html(d.name);

        $infobox.show();        
    }
}

function hideBox(){
    $infobox.hide();
}

function toTitleCase(str){
    if (str.indexOf('.') !== -1){
        return str;
    } else {
        return str.replace(/\w\S*/g, function(txt){ return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }
}

init();