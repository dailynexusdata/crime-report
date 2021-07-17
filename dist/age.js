"use strict";

var groupByAge = function (data) {
  var output = {};
  data.forEach(function (dat) {
    if (Object.keys(output).includes(dat.age)) {
      output[dat.age].push(dat);
    } else {
      output[dat.age] = [dat];
    }
  });
  delete output.NA;
  return output;
};
var crimes = ["Alcohol", "Partying", "Disorderly Conduct", "Other"];
var ageWide = function (data, size, margin) {
  var tooltipAlignmentx = function (x, tooltipBox) {
    return Math.min(size.width1 - tooltipBox.width, x + 5) + "px";
  };
  var tooltipAlignmenty = function (y, tooltipBox) {
    if (y > size.height / 2) {
      return y - tooltipBox.height - 90 + "px";
    }
    return Math.min(y - 70, size.height) + "px";
  };
  var grouped = Object.entries(groupByAge(data)).map(function (_a) {
    var age = _a[0],
      data = _a[1];
    var nAgeGroup = 0;
    crimes.forEach(function (crime) {
      nAgeGroup += data.find(function (_a) {
        var group = _a.group;
        return crime === group;
      })
        ? Number(
            data.find(function (_a) {
              var group = _a.group;
              return crime === group;
            }).n
          )
        : 0;
    });
    var curr = 0;
    var out = {};
    // console.log(nAgeGroup);
    crimes.forEach(function (crime) {
      var arr = data.find(function (_a) {
        var group = _a.group;
        return crime === group;
      });
      // console.log(crime, data[crime]);
      var next = arr ? arr.n / nAgeGroup : 0;
      out[crime] = [curr, curr + next];
      curr += next;
    });
    return [+age, out];
  });
  var collapsed = {};
  Object.entries(groupByAge(data)).forEach(function (_a) {
    var age = _a[0],
      subgroup = _a[1];
    collapsed[age] = subgroup.reduce(function (a, _a) {
      var n = _a.n;
      return a + Number(n);
    }, 0);
  });
  var container = d3
    .select("#age")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif");
  container
    .append("h2")
    .text("Top Crimes in Isla Vista by Age")
    .style("margin", "10px 10px 0 10px");
  // container
  //   .append("p")
  //   // .text(
  //   //   "College aged residents make up the majority of crime and are responsible for the majority of the partying and disorderly conduct related arrests."
  //   // )
  //   .text(
  //     'Top 3 crime categories as listed in the "Violent Crimes Make up 6% of All Crimes in I.V." plot with all other crimes classified as "Other".'
  //   )
  //   .style("margin", "0 10px 5px 10px");
  var plotArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "row")
    .style("align-items", "center")
    .style("width", size.width1 + size.width2 + "px");
  var svgBars = plotArea.append("svg");
  var svgLine = plotArea.append("svg");
  svgBars.attr("height", size.height).attr("width", size.width1);
  svgLine.attr("height", size.height).attr("width", size.width2);
  var y = d3
    .scaleLinear()
    .domain([grouped[0][0], grouped[grouped.length - 1][0]])
    .range([margin.top, size.height - margin.bottom]);
  var x1 = d3.scaleLinear().range([margin.left, size.width1 - margin.right]);
  var x2 = d3
    .scaleLinear()
    .domain([0, 1100])
    .range([10, size.width2 - 30]);
  svgBars
    .append("g")
    .style("font-size", "16px")
    .attr("transform", "translate(0, 40)")
    .attr("color", "#adadad")
    .call(
      d3
        .axisTop(x1)
        .ticks(5)
        .tickFormat(function (d) {
          return "" + Math.round(d * 100);
        })
    );
  svgBars
    .append("g")
    .style("font-size", "16px")
    .attr("transform", "translate(" + margin.left + ", 0)")
    .attr("color", "#adadad")
    .call(d3.axisLeft(y));
  svgBars
    .append("text")
    .text("% of Total Crimes")
    .attr("x", x1(0))
    .attr("y", 15)
    // .style("font-size", "16px")
    .attr("fill", "#adadad");
  svgBars
    .append("text")
    .text("Age")
    .attr("x", x1(0) - 10)
    .attr("y", y(18) - 5)
    .attr("text-anchor", "end")
    // .style("font-size", "16px")
    .attr("fill", "#adadad");
  svgLine
    .append("g")
    .style("font-size", "16px")
    .attr("transform", "translate(0, 40)")
    .attr("color", "#adadad")
    .call(
      d3.axisTop(x2).ticks(1).tickValues([0, 1100])
      // .tickFormat((d) => `${Math.round((d as number) * 100)}`)
    );
  svgLine
    .append("text")
    .text("# of Crimes")
    .attr("x", x2(1100))
    .attr("y", 15)
    .attr("text-anchor", "end")
    // .style("font-size", "16px")
    .attr("fill", "#adadad");
  svgLine
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "triangle")
    .attr("refX", 3)
    .attr("refY", 3)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 6 3 0 6 0 0")
    .attr("fill", "black");
  svgLine.append("text").text("84% of").attr("x", x2(200)).attr("y", y(33));
  svgLine.append("text").text("Crime from").attr("x", x2(200)).attr("y", y(36));
  svgLine
    .append("text")
    .text("18-23 y/o's")
    .attr("x", x2(200))
    .attr("y", y(39));
  svgLine
    .append("path")
    .attr(
      "d",
      "M " +
        x2(600) +
        " " +
        y(30) +
        " Q " +
        x2(850) +
        " " +
        y(27) +
        ", " +
        x2(700) +
        " " +
        (y(23) + 5)
    )
    .attr("marker-end", "url(#triangle)")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "2px");
  var tooltip = plotArea
    .append("div")
    .style("position", "absolute")
    .append("div")
    .style("position", "relative")
    .style("background-color", "white")
    .style("border", "1px solid black")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("width", "230px")
    .style("display", "none");
  plotArea.on("mouseenter touchstart", function () {
    plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    plotArea.on("mousemove touchstart", function (event) {
      tooltip.style("display", "block");
      //   tooltip.html(interactions[0].race);
      var _a = d3.pointer(event),
        xpos = _a[0],
        ypos = _a[1];
      if (
        ypos < margin.top ||
        ypos > size.height - 4 ||
        xpos < margin.left ||
        xpos > size.width - margin.right
      ) {
        plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
        tooltip.style("display", "none");
        return;
      }
      var idx = Math.min(Math.max(Math.round(y.invert(ypos)), 18), 65);
      var _b = Object.values(grouped)[idx - 18],
        group = _b[0],
        ttd = _b[1];
      var tooltipData = Object.entries(ttd)
        .sort(function (_a, _b) {
          var _ = _a[0],
            _c = _a[1],
            a = _c[0],
            b = _c[1];
          var __ = _b[0],
            _d = _b[1],
            c = _d[0],
            d = _d[1];
          return a - c;
        })
        .map(function (_a) {
          var group = _a[0],
            _b = _a[1],
            a = _b[0],
            b = _b[1];
          return [group, b - a];
        });
      // .filter(([a, b]) => b > 0);
      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 0.1);
      plotArea.selectAll(".bar-" + idx).attr("fill-opacity", 1);
      tooltip.html(
        "Age " +
          group +
          "<hr><b>Total # of Crimes: " +
          collapsed[group] +
          "</b><br>" +
          tooltipData
            .map(function (_a) {
              var grp = _a[0],
                pct = _a[1];
              return (
                grp +
                ": " +
                (pct < 0.005 ? (pct === 0 ? 0 : "<1") : Math.round(pct * 100)) +
                "%"
              );
            })
            .join("<br>")
      );
      var tooltipBox = tooltip.node().getBoundingClientRect();
      var xval = tooltipAlignmentx(xpos, tooltipBox);
      var yval = tooltipAlignmenty(ypos, tooltipBox);
      tooltip.style("left", xval).style("top", yval);
    });
    plotArea.on("mouseleave", function () {
      tooltip.style("display", "none");
      // d3.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    });
  });
  var grays = d3.scaleSequential(d3.interpolateGreys).domain([-5, 10]);
  var getColor = function (i) {
    if (i === 0) {
      return "#CC575F88"; //"#005aa3";
    }
    if (i === 1) {
      return "#003660";
    }
    if (i === 2) {
      return "#005aa3";
    }
    return grays(i - 3);
  };
  grouped.forEach(function (_a) {
    var age = _a[0],
      subgroups = _a[1];
    Object.entries(subgroups).map(function (_a, i) {
      var group = _a[0],
        range = _a[1];
      svgBars
        .append("rect")
        .attr("class", "bar-" + age)
        .attr("y", y(age))
        .attr("height", 5)
        .attr("x", x1(range[0]))
        .attr("width", x1(range[1]) - x1(range[0]))
        .attr("fill", getColor(i))
        .attr("fill-opacity", 1);
    });
  });
  var legendarea = container
    .append("div")
    .style("display", "flex")
    .style("justify-content", "space-evenly")
    .style("margin-bottom", "5px")
    .style("flex-wrap", "wrap")
    .style("min-height", "20px")
    .style("margin-left", margin.left + "px")
    .style("width", size.width1 - margin.left - margin.right + "px");
  legendarea.attr("height", 20).attr("width", size.width1);
  crimes.forEach(function (lab, i) {
    var item = legendarea
      .append("div")
      .style("display", "flex")
      .style("align-items", "center");
    item
      .append("div")
      .style("width", "10px")
      .style("height", "10px")
      .style("background-color", getColor(i));
    item
      .append("p")
      .text(lab)
      .style("margin", 0)
      .style("padding", "2px 5px")
      .attr("text-anchor", "middle")
      .style("color", getColor(i))
      // .style("background-color", getColor(i))
      .attr("alignment-baseline", "middle");
  });
  svgLine
    .append("line")
    .attr("x1", x2(0))
    .attr("x2", x2(0))
    .attr("y1", y(18))
    .attr("y2", y(66))
    .attr("stroke", "#d3d3d3");
  var line = d3
    .line()
    .x(function (d) {
      return x2(d[1]);
    })
    .y(function (d) {
      return y(Number(d[0]));
    });
  var area = d3
    .area()
    .x0(x2(0))
    .x1(function (d) {
      return x2(d[1]);
    })
    .y(function (d) {
      return y(d[0]);
    });
  svgLine
    .append("path")
    .datum(Object.entries(collapsed))
    .attr("d", line)
    .attr("stroke", "black")
    .attr("stroke-width", "2px")
    .attr("fill", "none");
  svgLine
    .append("path")
    .datum(
      Object.entries(collapsed).filter(function (_a) {
        var a = _a[0],
          _ = _a[1];
        return a <= 23;
      })
    )
    .attr("d", area)
    .attr("stroke", "none")
    .attr("fill", "#d3d3d3aa");
  container
    .append("p")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .html(
      "Data includes adult arrest info from 2013, 2018-2020. <a href='https://docs.google.com/spreadsheets/d/1NosIFv3dq5Qqc3nLblS60ADb4w1Dtax8PBzKNr1hvcU/edit'>Source: IVFP.</a>"
    )
    .style("margin", "0 10px");
};
var ageVert = function (data, size, margin) {
  var tooltipAlignmentx = function (x, tooltipBox) {
    return Math.min(size.width1 - tooltipBox.width, x) + "px";
  };
  var tooltipAlignmenty = function (y, tooltipBox) {
    if (y > size.height / 2) {
      return y - tooltipBox.height - 60 + "px";
    }
    return Math.min(y - 40, size.height) + "px";
  };
  var grouped = Object.entries(groupByAge(data)).map(function (_a) {
    var age = _a[0],
      data = _a[1];
    var nAgeGroup = 0;
    crimes.forEach(function (crime) {
      nAgeGroup += data.find(function (_a) {
        var group = _a.group;
        return crime === group;
      })
        ? Number(
            data.find(function (_a) {
              var group = _a.group;
              return crime === group;
            }).n
          )
        : 0;
    });
    var curr = 0;
    var out = {};
    // console.log(nAgeGroup);
    crimes.forEach(function (crime) {
      var arr = data.find(function (_a) {
        var group = _a.group;
        return crime === group;
      });
      // console.log(crime, data[crime]);
      var next = arr ? arr.n / nAgeGroup : 0;
      out[crime] = [curr, curr + next];
      curr += next;
    });
    return [+age, out];
  });
  var collapsed = {};
  Object.entries(groupByAge(data)).forEach(function (_a) {
    var age = _a[0],
      subgroup = _a[1];
    collapsed[age] = subgroup.reduce(function (a, _a) {
      var n = _a.n;
      return a + Number(n);
    }, 0);
  });
  var container = d3
    .select("#age")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif");
  container
    .append("h2")
    .text("Top Crimes in Isla Vista by Age")
    .style("margin", "10px 10px 0 10px");
  // container
  //   .append("p")
  //   // .text(
  //   //   "College aged residents make up the majority of crime and are responsible for the majority of the partying and disorderly conduct related arrests."
  //   // )
  //   .text(
  //     'Top 3 crime categories as listed in the "Violent Crimes Make up 6% of All Crimes in I.V." plot with all other crimes classified as "Other".'
  //   )
  //   .style("margin", "0 10px 5px 10px");
  var plotArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("width", size.width + "px");
  var svgLine = plotArea.append("svg");
  var svgBars = plotArea.append("svg");
  svgBars.attr("height", size.height2).attr("width", size.width);
  svgLine.attr("height", size.height1).attr("width", size.width);
  var y1 = d3
    .scaleLinear()
    .domain([0, 1100])
    .range([size.height1 - 10, margin.top - 5]);
  var x = d3
    .scaleLinear()
    .domain([grouped[0][0], grouped[grouped.length - 1][0]])
    .range([margin.left, size.width - margin.right]);
  var y2 = d3
    .scaleLinear()
    .range([size.height2 - margin.bottom, margin.top - 10]);
  svgBars
    .append("g")
    .style("font-size", "16px")
    .attr("transform", "translate(0, " + (size.height2 - margin.bottom) + ")")
    .attr("color", "#adadad")
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickFormat(function (d) {
          return d;
        })
    );
  svgBars
    .append("g")
    .style("font-size", "16px")
    .attr("transform", "translate(" + margin.left + ", 0)")
    .attr("color", "#adadad")
    .call(
      d3
        .axisLeft(y2)
        .ticks(5)
        .tickFormat(function (d) {
          return Number(d * 100);
        })
    );
  svgBars
    .append("text")
    .text("% of Total Crimes")
    .attr("x", x(18) - 46)
    .attr("y", margin.top - 20)
    // .style("font-size", "16px")
    .attr("text-anchor", "start")
    .attr("fill", "#adadad");
  svgBars
    .append("text")
    .text("Age:")
    .attr("x", x(18) - 5)
    .attr("y", size.height2 - 6)
    .attr("text-anchor", "end")
    // .style("font-size", "16px")
    .attr("fill", "#adadad");
  svgLine
    .append("g")
    .style("font-size", "16px")
    .attr("transform", "translate(" + margin.left + ", 0)")
    .attr("color", "#adadad")
    .call(d3.axisLeft(y1).ticks(1).tickValues([0, 1100]));
  svgLine
    .append("text")
    .text("# of Crimes")
    .attr("x", x(18) - 46)
    .attr("y", 15)
    .attr("text-anchor", "start")
    // .style("font-size", "16px")
    .attr("fill", "#adadad");
  svgLine
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "triangle")
    .attr("refX", 3)
    .attr("refY", 3)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 6 3 0 6 0 0")
    .attr("fill", "black");
  svgLine
    .append("text")
    .text("84% of Crime")
    .attr("x", x(33))
    .attr("y", y1(750));
  svgLine
    .append("text")
    .text("between 18-23 y/o's")
    .attr("x", x(33))
    .attr("y", y1(750) + 15);
  svgLine
    .append("path")
    .attr(
      "d",
      "M " +
        (x(33) - 5) +
        " " +
        y1(700) +
        " Q " +
        x(29) +
        " " +
        y1(1100) +
        ", " +
        x(24) +
        " " +
        y1(600)
    )
    .attr("marker-end", "url(#triangle)")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "2px");
  svgLine
    .append("line")
    .attr("x1", x(17))
    .attr("x2", x(66))
    .attr("y1", y1(0))
    .attr("y2", y1(0))
    .attr("stroke", "#d3d3d3");
  var grays = d3.scaleSequential(d3.interpolateGreys).domain([-5, 10]);
  var getColor = function (i) {
    if (i === 0) {
      return "#CC575F88"; //"#005aa3";
    }
    if (i === 1) {
      return "#003660";
    }
    if (i === 2) {
      return "#005aa3";
    }
    return grays(i - 3);
  };
  grouped.forEach(function (_a) {
    var age = _a[0],
      subgroups = _a[1];
    Object.entries(subgroups).map(function (_a, i) {
      var group = _a[0],
        range = _a[1];
      if (range[1] - range[0] === 0) {
        return;
      }
      // console.log(range, range[1] - range[0], y2(range[0]));
      svgBars
        .append("rect")
        .attr("class", "bar-" + age)
        .attr("y", y2(range[1]))
        .attr("height", y2(range[0]) - y2(range[1]))
        .attr("x", x(age))
        .attr("width", (size.width - margin.left - margin.right) / 48)
        .attr("fill", getColor(i))
        .attr("fill-opacity", 1);
    });
  });
  var legendarea = container
    .append("div")
    .style("display", "flex")
    .style("justify-content", "space-evenly")
    .style("margin-bottom", "5px")
    .style("flex-wrap", "wrap")
    .style("min-height", "20px")
    .style("margin-left", margin.left + "px")
    .style("width", size.width - margin.left - margin.right + "px");
  legendarea.attr("height", 20).attr("width", size.width1);
  crimes.forEach(function (lab, i) {
    var item = legendarea
      .append("div")
      .style("display", "flex")
      .style("align-items", "center");
    item
      .append("div")
      .style("width", "10px")
      .style("height", "10px")
      .style("background-color", getColor(i));
    item
      .append("p")
      .text(lab)
      .style("margin", 0)
      .style("padding", "2px 5px")
      .attr("text-anchor", "middle")
      .style("color", getColor(i))
      // .style("background-color", getColor(i))
      .attr("alignment-baseline", "middle");
  });
  var line = d3
    .line()
    .x(function (d) {
      return x(Number(d[0]));
    })
    .y(function (d) {
      return y1(d[1]);
    });
  var tooltip = plotArea
    .append("div")
    .style("position", "absolute")
    .append("div")
    .style("position", "relative")
    .style("background-color", "white")
    .style("border", "1px solid black")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("width", "230px")
    .style("display", "none");
  plotArea.on("mouseenter touchstart", function () {
    plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    plotArea.on("mousemove touchstart", function (event) {
      tooltip.style("display", "block");
      //   tooltip.html(interactions[0].race);
      var _a = d3.pointer(event),
        xpos = _a[0],
        ypos = _a[1];
      if (
        ypos < margin.top ||
        ypos > size.height - 4 ||
        xpos < margin.left ||
        xpos > size.width - margin.right
      ) {
        plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
        tooltip.style("display", "none");
        return;
      }
      var idx = Math.min(Math.max(Math.round(x.invert(xpos)), 18), 65);
      var _b = Object.values(grouped)[idx - 18],
        group = _b[0],
        ttd = _b[1];
      var tooltipData = Object.entries(ttd)
        .sort(function (_a, _b) {
          var _ = _a[0],
            _c = _a[1],
            a = _c[0],
            b = _c[1];
          var __ = _b[0],
            _d = _b[1],
            c = _d[0],
            d = _d[1];
          return a - c;
        })
        .map(function (_a) {
          var group = _a[0],
            _b = _a[1],
            a = _b[0],
            b = _b[1];
          return [group, b - a];
        });
      // .filter(([a, b]) => b > 0);
      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 0.1);
      plotArea.selectAll(".bar-" + idx).attr("fill-opacity", 1);
      tooltip.html(
        "Age " +
          group +
          "<hr><b>Total # of Crimes: " +
          collapsed[group] +
          "</b><br>" +
          tooltipData
            .map(function (_a) {
              var grp = _a[0],
                pct = _a[1];
              return (
                grp +
                ": " +
                (pct < 0.005 ? (pct === 0 ? 0 : "<1") : Math.round(pct * 100)) +
                "%"
              );
            })
            .join("<br>")
      );
      var tooltipBox = tooltip.node().getBoundingClientRect();
      var xval = tooltipAlignmentx(xpos, tooltipBox);
      var yval = tooltipAlignmenty(ypos, tooltipBox);
      tooltip.style("left", xval).style("top", yval);
    });
    plotArea.on("mouseleave touchend", function () {
      tooltip.style("display", "none");
      // d3.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    });
  });
  var area = d3
    .area()
    .x(function (d) {
      return x(d[0]);
    })
    .y0(y1(0))
    .y1(function (d) {
      return y1(d[1]);
    });
  svgLine
    .append("path")
    .datum(Object.entries(collapsed))
    .attr("d", line)
    .attr("stroke", "black")
    .attr("stroke-width", "2px")
    .attr("fill", "none");
  svgLine
    .append("path")
    .datum(
      Object.entries(collapsed).filter(function (_a) {
        var a = _a[0],
          _ = _a[1];
        return a <= 23;
      })
    )
    .attr("d", area)
    .attr("stroke", "none")
    .attr("fill", "#d3d3d3aa");
  container
    .append("p")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .html(
      "Data includes adult arrest info from 2013, 2018-2020. <a href='https://docs.google.com/spreadsheets/d/1NosIFv3dq5Qqc3nLblS60ADb4w1Dtax8PBzKNr1hvcU/edit'>Source: IVFP.</a>"
    )
    .style("margin", "0 10px");
};
var groupArrTypeData = function (data) {
  var output = {};
  data.forEach(function (dat) {
    if (Object.keys(output).includes(dat.group)) {
      output[dat.group].push({
        desc: dat.desc,
        n: dat.n,
        viol: Number(dat.viol),
        pct: Number(dat.pct),
      });
    } else {
      output[dat.group] = [
        {
          desc: dat.desc,
          n: dat.n,
          viol: Number(dat.viol),
          pct: Number(dat.pct),
        },
      ];
    }
  });
  var order = Object.entries(output)
    .map(function (_a) {
      var group = _a[0],
        arr = _a[1];
      return [
        group,
        arr.reduce(function (a, _a) {
          var pct = _a.pct;
          return a + pct;
        }, 0),
      ];
    })
    .sort(function (_a, _b) {
      var _ = _a[0],
        a = _a[1];
      var __ = _b[0],
        b = _b[1];
      return a - b;
    })
    .map(function (_a) {
      var g = _a[0],
        _ = _a[1];
      return g;
    });
  var outputOrdered = {};
  order.forEach(function (group) {
    outputOrdered[group] = output[group];
  });
  return outputOrdered;
};
(function () {
  var ageData = null;
  var resizeAgePlot = function () {
    var width = Math.max(Math.min(600, window.innerWidth), 270);
    d3.select("#age")
      .style("width", width + "px")
      .selectAll("*")
      .remove();
    if (window.innerWidth < 600) {
      var size = {
        height1: 90,
        height2: 320,
        width: width,
      };
      var margin = {
        left: 60,
        right: 30,
        top: 35,
        bottom: 25,
      };
      ageVert(ageData, size, margin);
    } else {
      var size = {
        height: 300,
        width1: width * 0.8,
        width2: width * 0.2,
      };
      var margin = {
        left: 55,
        right: 15,
        top: 40,
        bottom: 10,
      };
      ageWide(ageData, size, margin);
    }
  };
  window.addEventListener("resize", function () {
    // resizeIR();
    resizeAgePlot();
  });
  d3.csv(
    "dist/data/age.csv"
    // "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/age.csv"
  ).then(function (data) {
    ageData = data;
    resizeAgePlot();
  });
})();
