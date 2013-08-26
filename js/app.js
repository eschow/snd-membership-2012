var $table = $('#members'),
    $infobox = $('#info-box'),
    $map = $('#map');

function init(){
    ich.grabTemplates();
    drawRows();
    drawMap(calc_height());
    addEventListeners();
}

var US_counts = {};
var abroad_counts = {};

function drawRows(){
    $.each(members, function(k, v){
        v.country = toTitleCase(v.country);
        var row = ich.table_row(v);
        $table.append(row);
    });
    $('#members').dataTable();
}

function drawMap(height){
    if ($map.find('svg').length > 0){
        d3.select('#map svg').remove();
    }

    var width = $map.width();

    var projection = d3.geo.winkel3()    
        .scale(width/400 * 70)
        .translate([width/2 - 20, height/2 + height/50]);

    var quantize = d3.scale.quantize()
        .domain([0, 85])
        .range(d3.range(5).map(function(i) { return "q" + i + "-9"; }));

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#map").insert("svg:svg", "map")
        .attr("width", '100%')
        .attr("height", height);


    d3.json("data/combined.json", function(error, data) {
        svg.selectAll(".unit")
            .data(topojson.feature(data, data.objects.combined).features)
            .enter().append("path")
            .attr("class", function(d) { 
                var id = d.properties.name;
                // console.log(id, quantize(totals[id]));
                return "unit " + id + " " + quantize(totals[id]);
            })
            .attr("d", path)
            .on('mouseenter', function(d){
                showBox(d.properties);
            })
            .on('mouseleave', function(e){
                hideBox();
            });

        // var r = 180;
        // var legend = d3.select("#map").append("svg")
        //     .attr("class", "legend")
        //     .attr("width", r)
        //     .attr("height", r * 2)
        //     .selectAll("g")
        //     .data(data)
        //     .enter().append("g")
        //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        // legend.append("rect")
        //     .attr("width", 18)
        //     .attr("height", 18)
        //     .style("fill", function(d, i) { return quantize(i); });

        // legend.append("text")
        //     .attr("x", 24)
        //     .attr("y", 9)
        //     .attr("dy", ".35em")
        //     .text(function(d) { return d.label; }); 
    });   

    $(window).resize();
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

    $(window).resize(function() {
        if(this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            $(this).trigger('resizeEnd');
        }, 500);
    });

    $(window).bind('resizeEnd', function() {
        var height = calc_height();
        $("#map svg").css("height", height);
        drawMap(height);
        if(this.resizeTO) clearTimeout(this.resizeTO);
    });    
}

function calc_height(){
    return $map.width() * 0.5;
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