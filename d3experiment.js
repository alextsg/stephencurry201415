var opts = {
   lines: 13, // The number of lines to draw
   length: 7, // The length of each line
   width: 4, // The line thickness
   radius: 10, // The radius of the inner circle
   rotate: 0, // The rotation offset
   color: '#b3b3b3', // #rgb or #rrggbb
   speed: 0.75, // Rounds per second
   trail: 50, // Afterglow percentage
   shadow: false, // Whether to render a shadow
   hwaccel: false, // Whether to use hardware acceleration
   className: 'spinner', // The CSS class to assign to the spinner
   zIndex: 2e9, // The z-index (defaults to 2000000000)
   top: 'auto', // Top position relative to parent in px
   left: 'auto' // Left position relative to parent in px
};

function kimonoCallback(data) {
  var stats = data.results.collection1;
  spinner.stop();
  $('#spinner_center').remove();

  var x=d3.scale.linear().domain([0,d3.max(stats, function(d) { return +d.game; })])
                         .range([margin,width-margin]);
  var y=d3.scale.linear().domain([0,d3.max(stats, function(d) { return +d.points; })])
                         .range([height-margin,margin]);
  var r=d3.scale.linear().domain([0,d3.max(stats, function(d) { return +d.gamescore; })])
                         .range([0,20]);
  var o=d3.scale.linear().domain([10000,100000]).range([.5,1]);
  var c=d3.scale.ordinal().domain(["W","L"]).range(["#26E810","#E84956"]);
  var s=d3.scale.ordinal().domain(["points","fieldgoalper","freethrowper","threepointers","rebounds","assists","steals","blocks","turnovers","fouls","plusminus"])
                          .range(["Points","Field Goal %","Free Throw %","Threes Made","Rebounds","Assists","Steals","Blocks","Turnovers","Fouls","+/-"]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


  svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + (height - margin) + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "yaxis")
    .attr("transform", "translate(" + margin + ",0)")
    .call(yAxis);

  svg.append("text")
    .attr("class", "xlabel")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height-10)
    .text("Games");

  svg.append("text")
    .attr("class", "ylabel")
    .attr("text-anchor", "middle")
    .attr("x", -height/2)
    .attr("y", margin - 70)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Points");

  var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");

  // start with circles at bottom

  svg.selectAll("circle").data(stats).enter()
    .append("circle")
    .attr("cx",function(d) {return x(+d.game);})
    .attr("cy",function(d) {return y(0);})
    .attr("r",function(d) {return r(0);})
    .style("fill",function(d) {return c(d.outcome[0])})


  // initiate circles and move to position

  svg.selectAll("circle").transition().duration(1000)
    .attr("cx",function(d) {return x(+d.game);})
    .attr("cy",function(d) {return y(+d.points);})
    .attr("r",function(d) {return r(+d.gamescore);})

  svg.selectAll("circle").append("title")
    .html(function(d) {return 'Opponent: ' + d.opponent + '<br/>Points: ' + d.points + '<br/>Outcome: ' + d.outcome + '<br/>Gamescore: ' + d.gamescore;})


  //svg.selectAll("circle").on('mouseover', function(){console.log("hello");});


    
  $('select').removeAttr('disabled');

  var update = function(updatestat) {

    y.domain([d3.min(stats, function(d) { return Math.min(0, +d[updatestat]); }), 
              d3.max(stats, function(d) { return Math.max(1, +d[updatestat]); })]);
    svg.select(".yaxis").call(yAxis);
    svg.select(".ylabel").text(function(d) {return s(updatestat);});
    var temp = s(updatestat);
    svg.selectAll("circle").transition().duration(1000)
       .attr("cx",function(d) {return x(+d.game);})
       .attr("cy",function(d) {return y(+d[updatestat]);})
       .attr("r",function(d) {return r(+d.gamescore);});

    svg.selectAll("circle").select("title")
       .html(function(d) {return 'Opponent: ' + d.opponent + '<br/>' + s(updatestat) + ': ' + d[updatestat] + '<br/>Outcome: ' + d.outcome + '<br/>Gamescore: ' + d.gamescore;});
  };

  $('select').on('change',function(){
    update(this.value);
  })
};

$('select').attr('disabled', 'disabled');

var spinner = new Spinner(opts);

$.ajax({
    "beforeSend": function() {
      $('<div id ="spinner_center" style="position:relative;display:block;width:50%;height:50%;top:300px;left:600px;"></div>').appendTo('.chart');
      spinner.spin($('#spinner_center')[0]);
    },
    "url":"https://www.kimonolabs.com/api/6p063nz2?apikey=TIGMQy4hT6wns5yoxT1XgNlO6x1xlcWs&callback=kimonoCallback",
    "crossDomain":true,
    "dataType":"jsonp"
});

var width = 1200,
    height = 600, 
    margin = 70;

var svg=d3.select(".chart").append("svg").attr("width",width).attr("height",height);

