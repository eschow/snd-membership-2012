var $table = $('#members'),
    datatable,
    $infobox = $('#info-box'),
    $map = $('#map');

var region_totals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

function init(){
    ich.grabTemplates();
    drawRows();
    drawMap(calc_height());
    addEventListeners();
}

function drawRows(){
    $.each(members, function(k, v){
        v.country = toTitleCase(v.country);
        var row = ich.table_row(v);
        $table.append(row);
    });
    datatable = $('#members').dataTable();
}

function drawMap(height){

    var margin = {top: 10, left: 10, bottom: 10, right: 10},
        width = parseInt(d3.select('#map').style('width')),
        width = width - margin.left - margin.right,
        mapRatio = .5,
        height = width * mapRatio;

    var projection = d3.geo.winkel3()
        .scale(width/400 * 70)
        .translate([width / 2 - 20, height / 2 + height/50]);

    var path = d3.geo.path()
        .projection(projection);

    var quantile = d3.scale.quantile()
        .domain([0, 85])
        .range(d3.range(5).map(function(i) { return "q" + i + "-9"; }));

    var svg = d3.select("#map").insert("svg:svg", "map")
        .attr("width", '100%')
        .attr("height", height);

    d3.json("data/combined.json", function(error, data) {
        svg.selectAll(".unit")
            .data(topojson.feature(data, data.objects.combined).features)
            .enter().append("path")
            .attr("class", function(d) { 
                var id = d.properties.name;
                if (totals[id] && regions[id]){
                    summary_counts[regions[id]]['count'] += totals[id];
                    region_totals[regions[id]] += totals[id];
                }
                return "unit " + slugify(id) + " " + quantile(totals[id]);
            })
            .attr("d", path)
            .on('mouseenter', function(d, i){
                var id = d.properties.name;
                if (totals[id]){
                    showBox(d.properties);
                    d3.select(this).classed('hovered', true);
                }
            })
            .on('mouseleave', function(d, i){
                hideBox();
                d3.select(this).classed('hovered', false);
            })
            .on('click', function(e){
                if (e.properties.postal){
                    datatable.fnFilter(e.properties.postal);
                    // datatable.fnFilter(e.properties.postal, 5);
                } else {
                    datatable.fnFilter(e.properties.name);
                    // datatable.fnFilter(e.properties.name, 6);
                }
            });
    });


    d3.select(window).on('resize', resize);

    function resize() {
        // adjust things when the window size changes
        width = parseInt(d3.select('#map').style('width'));
        width = width - margin.left - margin.right;
        height = width * mapRatio;

        // update projection
        projection
            .translate([width / 2 - 20, height / 2 + height/50])
            .scale(width / 400 * 70);

        // resize the map container
        svg
            .style('width', width + 'px')
            .style('height', height + 'px');

        // resize the map
        svg.selectAll('.unit').attr('d', path);
    }

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

function calc_height(){
    return $map.width() * 0.5;
}

function showBox(d){
    $infobox.find('#region').html('Region ' + regions[d.name]);
    $infobox.find('#member-total').html(totals[d.name]);
    $infobox.find('#location').html(d.name);

    $infobox.show();        
}

function hideBox(){
    $infobox.hide();
}

function slugify(t){
    return t.replace(/[^-a-zA-Z0-9\s]+/ig, '').replace(/-/gi, "_").replace(/\s/gi, "-").toLowerCase();
}

function toTitleCase(str){
    if (str !== 'UAE' && str !== 'US' && str !== 'UK'){
        return str.replace(/\w\S*/g, function(txt){ return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    } else {
        return str;
    }
}

init();