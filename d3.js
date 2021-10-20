var mouseX;
var mouseY;

$(document).mousemove(function (e) {
  mouseX = e.pageX - 50;
  mouseY = e.pageY - 80;
});

$(document).mouseover(function () {});

var chart = d3.select("body").append("svg").attr("id", "chart");

var margin = { top: 0, right: 100, bottom: 100, left: 80 },
  width = 600 - margin.right - margin.left,
  height = 600 - margin.top - margin.bottom;

chart.attrs({
  width: width + margin.right + margin.left,
  height: height + margin.top + margin.bottom,
});

var content = chart
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var months = function () {
  var array = [];
  for (var i = 0; i < 12; i++) {
    var one = 1;
    var temp = one + i;
    array.push(temp);
  }
  return array;
};

var monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

var colors = [
  "#5E4FA2",
  "#3288BD",
  "#66C2A5",
  "#ABDDA4",
  "#E6F598",
  "#FFFFBF",
  "#FEE08B",
  "#FDAE61",
  "#F46D43",
  "#D53E4F",
  "#9E0142",
];

var y = d3.scaleBand().domain(months()).range([0, height]);

var yAxis = d3
  .axisLeft()
  .scale(y)
  .tickFormat(function (d) {
    return monthNames[d - 1];
  });

var info = content.append("g").attr("transform", "translate(30,40)");

var delay;

function handlemouseover(d, i) {
  clearTimeout(delay);
  $("#DivToShow").css({ top: mouseY, left: mouseX }).css("display", "block");

  $("#textDiv").html(
    "<p><b>" +
      d.year +
      "</b> - " +
      monthNames[d.month - 1] +
      "</br>Variance: " +
      d.variance +
      " ℃</br>"
  );
}

function handlemouseout(d, i) {
  delay = setTimeout(function () {
    $("#DivToShow").fadeOut(100);
  }, 1000);
}

function handleData(data) {
  var max = d3.max(data, function (d) {
    return d.variance;
  });
  var min = d3.min(data, function (d) {
    return d.variance;
  });
  var interval = max - min;
  var kvot = interval / 11;

  console.log(interval, kvot);

  var contentWidth = Math.round(data.length / 12) * 4;
  chart.attr("width", contentWidth + 100);

  var x = d3.scaleLinear().range([0, contentWidth]).domain([0, contentWidth]);

  var rect = content
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
      var x = Math.floor(i / 12) * 4;
      return x;
    })
    .attr("y", function (d) {
      return y(d.month);
    })
    .attr("width", 4)
    .attr("height", y.bandwidth())
    .attr("fill", function (d) {
      var index = Number(Math.floor((d.variance + min * -1) / kvot));
      if (index == 11) {
        index = index - 1;
      }
      return colors[index];
    })
    .attr("opacity", 0)
    .on("mouseover", handlemouseover)
    .on("mouseout", handlemouseout)
    .transition()
    .duration(1500)
    .attr("opacity", 1);

  var startYear = d3.min(data, function (d) {
    return d.year;
  });

  var stopYear = d3.max(data, function (d) {
    return d.year;
  });

  var ticks = [28];

  while (ticks[ticks.length - 1] / 4 + startYear < stopYear) {
    ticks.push(ticks[ticks.length - 1] + 40);
  }

  while (ticks[ticks.length - 1] / 4 + startYear > stopYear) {
    ticks.pop();
  }

  var xAxis = d3
    .axisBottom()
    .scale(x)
    .tickValues(ticks)
    .tickFormat(function (d) {
      var year = d / 4 + 1753;
      return year;
    });
  /*.tickFormat(function(d) {var sec = d % 60;
      var min = Math.floor(d / 60);
      if (sec < 10) {sec = "0" + sec}
      return min + ":" + sec})*/

  var xAxis = content
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  content.append("g").attr("class", "y axis").call(yAxis);

  var legend = content.append("g").attr("transform", "translate(520, 550)");

  var legendRects = legend.selectAll("g").data(colors).enter().append("g");

  legendRects
    .append("rect")
    .attr("x", function (d, i) {
      return i * 40;
    })
    .attr("y", 10)
    .attr("width", 40)
    .attr("height", 10)
    .attr("fill", function (d, i) {
      return colors[i];
    });

  legendRects
    .append("text")
    .attr("y", 35)
    .attr("x", function (d, i) {
      var add;
      if (i < 6) {
        add = 5;
      } else {
        add = 10;
      }
      return i * 40 + add;
    })
    .text(function (d, i) {
      var num =
        (min + (interval / 11) * i + (min + (interval / 11) * (i + 1))) / 2;
      return num.toFixed(1);
    });

  legend
    .append("text")
    .text("Midpoint of variance per colorcode")
    .attr("x", 0)
    .attr("y", 0);
}

var ajax = new XMLHttpRequest();
var data_file =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";
ajax.onreadystatechange = function () {
  if (ajax.readyState == 4) {
    var jsonObj = JSON.parse(ajax.responseText);
    console.log(jsonObj);
    var test = [{ Time: 2 }, { Time: 3 }];
    //handleData(test)
    handleData(jsonObj.monthlyVariance);
  }
};
ajax.open("GET", data_file, true);
ajax.send();
