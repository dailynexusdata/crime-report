"use strict";
var racePlot = function (data, size, margin, collapsed) {
  var tooltipAlignmentx = function (x, tooltipBox) {
    if (collapsed) {
      return size.width / 2;
    }
    return (
      Math.min(
        size.width - margin.left - tooltipBox.width - (collapsed ? 55 : 35),
        x - margin.left - (collapsed ? 30 : 10)
      ) + "px"
    );
  };
  var tooltipAlignmenty = function (y, tooltipBox) {
    if (collapsed) {
      return y + 10 + "px";
    }
    if (y > size.height / 2) {
      return y - tooltipBox.height - 10 + "px";
    }
    return Math.max(60, y + 10) + "px";
  };
  var container = d3
    .select("#race")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif");
  container
    .append("h2")
    .text("Isla Vista Crimes by Race")
    .style("margin", "10px 10px 0 10px");
  var plotArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("width", size.width + "px");
  var svg = plotArea.append("svg");
  var legendarea = plotArea
    .append("div")
    .style("display", "flex")
    .style("justify-content", "space-evenly")
    .style("margin-bottom", "5px")
    .style("flex-wrap", "wrap")
    .style("min-height", "20px")
    .style("margin-left", margin.left - margin.right + "px")
    .style("width", size.width - margin.left - margin.right + "px");
  legendarea.attr("height", 20).attr("width", size.width);
  svg.attr("height", size.height).attr("width", size.width);
  var y = d3
    .scaleLinear()
    .domain([0, 6])
    .range([size.height - margin.bottom, margin.top]);
  var x = d3
    .scaleLinear()
    .domain([0, 4000])
    // .domain([0, 0.7])
    .range([margin.left, size.width - margin.right]);
  var bars = svg.append("g");
  var lab = svg.append("g");
  //   const overlap = svg.append("g");
  svg
    .append("text")
    .text("# of Crimes")
    .attr("x", x(0))
    .attr("y", 15)
    // .style("font-size", "16px")
    .attr("fill", "#adadad");
  svg
    .append("g")
    .style("font-size", "16px")
    .attr("transform", "translate(0, 40)")
    .attr("color", "#adadad")
    .call(
      d3.axisTop(x).ticks(5)
      // .tickFormat((d) => `${Math.round((d as number) * 100)}`)
    );
  ["Over Represented", "Under Represented"].forEach(function (lab, i) {
    legendarea
      .append("p")
      .text(lab)
      .style("margin", "3px")
      .style("padding", "2px 5px")
      .attr("text-anchor", "middle")
      .style("background-color", ["#AFDBF4", "#d3d3d399"][i])
      .attr("alignment-baseline", "middle");
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
    .style("width", "175px")
    .style("display", "none");
  plotArea.on("mouseenter touchstart", function () {
    plotArea.on("mousemove touchstart", function (event) {
      tooltip.style("display", "block");
      //   tooltip.html(interactions[0].race);
      var _a = d3.pointer(event),
        xpos = _a[0],
        ypos = _a[1];
      if (
        ypos < margin.top + 10 ||
        ypos > size.height - 10 ||
        xpos < margin.left ||
        xpos > size.width - margin.right
      ) {
        tooltip.style("display", "none");
        return;
      }
      var idx = Math.min(Math.max(Math.floor(y.invert(ypos)), 0), 5);
      var _b = Object.entries(data)[idx],
        group = _b[0],
        tooltipData = _b[1];
      tooltip.html(
        group +
          "<hr># of Crimes: " +
          d3.format(",")(tooltipData.tot) +
          (tooltipData.exp > -1 && group !== "Other"
            ? "<br> Expected: " + d3.format(",")(Math.round(tooltipData.exp))
            : "")
      );
      var tooltipBox = tooltip.node().getBoundingClientRect();
      tooltip
        .style("left", tooltipAlignmentx(xpos, tooltipBox))
        .style("top", tooltipAlignmenty(ypos, tooltipBox));
    });
    plotArea.on("mouseleave touchend", function () {
      tooltip.style("display", "none");
    });
  });
  Object.entries(data).forEach(function (_a, i) {
    // console.log({
    //   group,
    //   currPct,
    //   inval: int["val"],
    //   a1: x(currPct),
    //   a2: x(int.val),
    // });
    var group = _a[0],
      _b = _a[1],
      pct = _b.pct,
      exp = _b.exp;
    // console.log(group);
    bars
      .append("rect")
      .attr("x", x(0))
      .attr("y", y(i) - (collapsed ? 20 : 30))
      .attr("height", collapsed ? 20 : 30)
      .attr("width", x(pct) - margin.left)
      .attr("fill", exp < pct && group !== "Unknown" ? "#AFDBF4" : "#d3d3d399");
    if (collapsed) {
      bars
        .append("text")
        .text(group)
        .attr("x", x(0))
        .attr("y", y(i) - 22)
        .style("font-size", "13pt")
        .attr("text-anchor", "start");
    } else {
      bars
        .append("text")
        .text(group)
        .attr("x", x(0) - 5)
        .attr("y", y(i) - 15)
        .attr("text-anchor", "end")
        .style("font-size", "13pt")
        .attr("alignment-baseline", "middle");
    }
    if (exp !== undefined && exp !== "0" && pct > 0.01) {
      bars
        .append("line")
        .attr("x1", x(exp))
        .attr("x2", x(exp))
        .attr("y1", y(i))
        .attr("y2", y(i) - (collapsed ? 20 : 30))
        .attr("stroke", "black");
      bars
        .append("line")
        .attr("y1", y(i) - (collapsed ? 10 : 15))
        .attr("y2", y(i) - (collapsed ? 10 : 15))
        .attr("x1", x(pct))
        .attr("x2", x(exp))
        .attr("stroke", "black");
    }
    // overlap
    //   .append("rect")
    //   .attr("y", y(j) - 30)
    //   .attr("height", 30)
    //   .attr("x", x(0))
    //   .attr("class", "overlap")
    //   .attr("width", x(1) - margin.right)
    //   .attr("fill", "#00000000");
  });
  svg
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
  bars
    .append("text")
    .text("Expected #")
    .attr("x", x(2050))
    .attr("y", y(3.3))
    .attr("font-size", "18px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle");
  bars
    .append("text")
    .text("from population.")
    .attr("x", x(2050))
    .attr("y", y(3.3) + 18)
    .attr("font-size", "18px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle");
  bars
    .append("path")
    .attr(
      "d",
      "M " +
        x(2000) +
        " " +
        y(3.3) +
        " Q " +
        x(1700) +
        " " +
        y(3) +
        ", " +
        (x(Object.values(data)[4].exp) + 6) +
        " " +
        (y(4) + 10)
    )
    .attr("marker-end", "url(#triangle)")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "2px");
  container
    .append("p")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .html(
      "Data includes adult arrest info from 2013, 2018-2020. <a href='https://docs.google.com/spreadsheets/d/1NosIFv3dq5Qqc3nLblS60ADb4w1Dtax8PBzKNr1hvcU/edit'>Source: IVFP.</a>" +
        "<br>" +
        "Percentage estimates from U.S. Census Bureau population estimates." +
        "<br><br>" +
        "Note that the census records race and ethnicity separately, while IVFP combines the two, making the comparison between the two sources difficult."
    )
    .style("margin", "0 10px");
};
var groupIRData = function (data) {
  var output = {};
  data.forEach(function (dat) {
    if (Object.keys(output).includes(dat.race)) {
      output[dat.race].push(dat);
    } else {
      output[dat.race] = [dat];
    }
  });
  Object.entries(output).forEach(function (_a) {
    var group = _a[0],
      inters = _a[1];
    var sum = output[group]
      .map(function (d) {
        return Number(d.val);
      })
      .reduce(function (a, b) {
        return a + b;
      });
    inters.forEach(function (i) {
      i.amt = i.val;
      i.tot = sum;
      i.val = Number(i.val) / sum;
    });
  });
  var outputReversed = {};
  Object.keys(output)
    .reverse()
    .forEach(function (key) {
      outputReversed[key] = output[key];
    });
  return outputReversed;
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
  var raceData = null;
  var resizeRacePlot = function () {
    var size = {
      height: 300,
      width: Math.max(Math.min(600, window.innerWidth), 250),
    };
    var margin = {
      left: 25 + (window.innerWidth < 600 ? 0 : 160),
      right: 30,
      top: 40,
      bottom: 10,
    };
    d3.select("#race")
      .style("width", size.width + "px")
      .selectAll("*")
      .remove();
    racePlot(raceData, size, margin, window.innerWidth < 600);
  };
  window.addEventListener("resize", function () {
    resizeRacePlot();
  });
  d3.csv(
    "dist/data/race.csv"
    // "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/race.csv"
  ).then(function (dat) {
    var data = {};
    dat.forEach(function (_a) {
      var race = _a.race,
        tot = _a.tot,
        pct = _a.pct,
        exp = _a.exp;
      data[race] = { tot: tot, pct: pct, exp: exp };
    });
    raceData = data;
    resizeRacePlot();
  });
})();
