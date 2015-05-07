// Dev-helper
function print_filter(filter) {
  var f = eval(filter);
  if (typeof(f.length) != "undefined") {} else {}
  if (typeof(f.top) != "undefined") {
    f = f.top(Infinity);
  } else {}
  if (typeof(f.dimension) != "undefined") {
    f = f.dimension(function(d) {
      return "";
    }).top(Infinity);
  } else {}
  console.log(filter + "(" + f.length + ") = " + JSON.stringify(f).replace("[", "[\n\t").replace(/}\,/g, "},\n\t").replace("]", "\n]"));
};

// index_data.js
d3.json('http://fts.unocha.org/api/v1/contribution/emergency/16575.json', function(err, json) {
  if (err) console.log(err);
  var data = json;

  var dateFormat = d3.time.format('%Y-%m-%dT%X');
  
  json.forEach(function(d){
    d.date_formated = dateFormat.parse(d.decision_date);
  });

  console.log(data);

  // Defining the chart elements.
  var funding_status_pie = dc.pieChart("#funding_status");
  var funding_time_series = dc.lineChart("#fundign_time_series");

  // Indexing data.
  var cf = crossfilter(data);

  cf.status = cf.dimension(function(d) { return d.status; });
  cf.date = cf.dimension(function(d) { return d.date_formated });
  

  // Organizing the cross-filter groups.
  var all = cf.groupAll();
  var status = cf.status.group();
  var date = cf.date.group();



  funding_time_series.width(800).height(300)
    .dimension(cf.date)
    .group(date)
    .x(d3.time.scale().domain([new Date(2015, 0, 1), new Date(2015, 4, 30)]))
    .margins({ top: 20, left: 40, right: 30, bottom: 20 })
    .brushOn(true)
    .elasticY(true)
    .renderArea(true)
    .renderVerticalGridLines(true);


  funding_status_pie.width(500).height(200)
    .dimension(cf.status)
    .ordering(function(d) {
      return -d.status
    })
    .group(status)
    .colors(['#fc8d59', '#ffffbf', '#99d594'])
    .colorDomain([0, 3])
    .innerRadius(70)
    // .legend(dc.legend(['Lowest', 'Low', 'Medium-low', 'Medium-high', 'High', 'Highest']).x(2).y(30).itemHeight(13).gap(5))
    .renderLabel(true)
    .renderTitle(false)
    // .filter('5.High')
    // .filter('6.Highest')
    .colorAccessor(function(d, i) {
      return i % 4;
    });

  dc.dataCount("#count-info")
    .dimension(cf)
    .group(all);


  dc.renderAll();

});
