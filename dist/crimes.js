"use strict";
var arrestType = function (data, size, margin, collapsed) {
  var tooltipAlignmentx = function (x, tooltipBox) {
    if (collapsed) {
      return size.width / 2;
    }
    return (
      Math.min(
        size.width - margin.left - tooltipBox.width - 10,
        x - margin.left + 10
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
    return Math.max(0, y + 10) + "px";
  };
  var container = d3
    .select("#arrtype")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif");
  container
    .append("h2")
    .text("Violent Crimes Make up 6% of All Crimes in I.V.")
    .style("margin", "10px 10px 0 10px");
  container
    .append("p")
    .text(
      "Click on the bars to see which crimes are included in each category."
    )
    .style("margin", "0 10px 5px 10px");
  var plotArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("width", size.width);
  var svg = plotArea.append("svg");
  //   const legendarea = plotArea
  //     .append("div")
  //     .style("display", "flex")
  //     .style("justify-content", "space-evenly")
  //     .style("margin-bottom", "5px")
  //     .style("height", "20px")
  //     .style("margin-left", margin.left - margin.right + "px")
  //     .style("width", size.width - margin.left - margin.right + "px");
  //   legendarea.attr("height", 20).attr("width", size.width);
  svg.attr("height", size.height).attr("width", size.width);
  var y = d3
    .scaleLinear()
    .domain([0, 9])
    .range([size.height - margin.bottom, margin.top]);
  var x = d3
    .scaleLinear()
    .domain([0, 0.6])
    .range([margin.left, size.width - margin.right]);
  var overlap = svg.append("g");
  var bars = svg.append("g");
  svg
    .append("text")
    .text("% of Total Crimes")
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
      d3
        .axisTop(x)
        .ticks(5)
        .tickFormat(function (d) {
          return "" + Math.round(d * 100);
        })
    );
  //   ["Arrests", "Citations", "Did Not File Charges"].forEach((lab, i) => {
  //     legendarea
  //       .append("p")
  //       .text(lab)
  //       .style("margin", 0)
  //       .style("padding", "2px 5px")
  //       .attr("text-anchor", "middle")
  //       .style("background-color", color[i] + (i !== 0 ? "" : "44"))
  //       .attr("alignment-baseline", "middle");
  //   });
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
  var labels = svg.append("g");
  labels.style("display", "block");
  plotArea.on("mouseenter touchstart", function () {
    labels.style("display", "none");
    plotArea.on("mousemove touchstart", function (event) {
      //   tooltip.html(interactions[0].race);
      var _a = d3.pointer(event),
        xpos = _a[0],
        ypos = _a[1];
      if (
        ypos < margin.top - 20 ||
        ypos > size.height + 10 ||
        xpos < margin.left ||
        xpos > size.width - margin.right
      ) {
        tooltip.style("display", "none");
        return;
      }
      var idx = collapsed
        ? Math.min(Math.max(Math.ceil(y.invert(ypos) + 0.5), 1), 11)
        : Math.min(Math.max(Math.ceil(y.invert(ypos)), 1), 11);
      var _b = Object.entries(data)[idx],
        group = _b[0],
        tooltipData = _b[1];
      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
      plotArea
        .selectAll(".bar-" + group.split(/[ /]/)[0])
        .attr("fill-opacity", 1);
      tooltip.html(
        group +
          "<hr>" +
          tooltipData
            .map(function (_a) {
              var desc = _a.desc,
                pct = _a.pct;
              return (
                desc + ": " + (pct < 0.005 ? "<1" : Math.round(pct * 100)) + "%"
              );
            })
            .join("<br>")
      );
      var tooltipBox = tooltip.node().getBoundingClientRect();
      var xval = tooltipAlignmentx(xpos, tooltipBox);
      var yval = tooltipAlignmenty(ypos, tooltipBox);
      tooltip.style("left", xval).style("top", yval).style("display", "block");
    });
    plotArea.on("mouseleave touchend", function () {
      labels.style("display", "block");
      tooltip.style("display", "none");
      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
    });
  });
  var grays = d3.scaleSequential(d3.interpolateGreys).domain([6, -5]);
  var viol = 0;
  var lastViolIdx = 0;
  var lastViolx = 0;
  Object.entries(data)
    .slice(1, 11)
    .forEach(function (_a, j) {
      var group = _a[0],
        crimes = _a[1];
      var currx = 0;
      // console.log(group);
      crimes.forEach(function (crime, i) {
        // console.log({
        //   group,
        //   currx,
        //   inval: int["val"],
        //   a1: x(currx),
        //   a2: x(int.val),
        // });
        viol = crime.viol;
        if (crime.viol === 1) {
          lastViolIdx = j;
        }
        bars
          .append("rect")
          .attr("class", "bar-" + group.split(/[ /]/)[0])
          .attr("x", x(currx))
          .attr("y", y(j) - (collapsed ? 0 : 18))
          .attr("height", collapsed ? 18 : 18)
          .attr("width", x(crime.pct) - margin.left)
          .attr("fill", grays(i))
          .attr("fill-opacity", 0);
        //   if (group === "Black" && i === 0) {
        //     bars
        //       .append("text")
        //       .attr("x", x(int.val) + 5)
        //       .attr("y", y(j) - (collapsed ? 10 - 2 : 15))
        //       .text(`${Math.round(int.val * 100)}%`)
        //       .attr("text-anchor", "start")
        //       .attr("alignment-baseline", "middle");
        //   }
        currx += crime.pct;
      });
      if (collapsed) {
        bars
          .append("text")
          .text(group)
          .attr("x", x(0))
          .attr("y", y(j) - 3)
          .attr("text-anchor", "start");
      } else {
        bars
          .append("text")
          .text(group)
          .attr("x", x(0) - 10)
          .attr("y", y(j) - 9)
          .attr("text-anchor", "end")
          .attr("alignment-baseline", "middle");
      }
      overlap
        .append("rect")
        .attr("x", x(0))
        .attr("y", y(j) - (collapsed ? 0 : 18))
        .attr("height", collapsed ? 18 : 18)
        .attr("width", x(currx) - margin.left)
        .attr("fill", viol ? "#005AA3" : "#d3d3d399");
      if (viol === 1) {
        lastViolx = currx;
        labels
          .append("text")
          .text(Math.round(currx * 100) + "%")
          .attr("x", x(currx) + 5)
          .attr("y", y(j) - (collapsed ? -2 : 8))
          .attr("alignment-baseline", collapsed ? "hanging" : "middle")
          .attr("fill", "#005AA3")
          .attr("font-weight", "bold");
      }
    });
  labels
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "triangle123")
    .attr("refX", 3)
    .attr("refY", 3)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 6 3 0 6 0 0")
    .attr("fill", "#005AA3");
  labels
    .append("path")
    .attr(
      "d",
      "M " +
        x(collapsed ? 0.29 : 0.28) +
        " " +
        (collapsed ? 220 : 160) +
        " Q " +
        x(collapsed ? 0.27 : 0.23) +
        " " +
        (collapsed ? 205 : 135) +
        ", " +
        x(0.1) +
        " " +
        (collapsed ? 205 : 135)
    )
    .attr("marker-end", "url(#triangle123)")
    .attr("fill", "none")
    .attr("stroke", "#005AA3")
    .attr("stroke-width", "2px");
  labels
    .append("text")
    .text("Violent Crime")
    .attr("x", x(collapsed ? 0.25 : 0.2))
    .attr("y", collapsed ? 240 : 180)
    .attr("fill", "#005AA3")
    .attr("font-weight", "bold");
  // labels
  //   .append("text")
  //   .attr("x", collapsed ? size.width - margin.right : x(lastViolx) + 150)
  //   .attr("y", y(lastViolIdx) - (collapsed ? 3 : 6) + 30)
  //   .text("Violent Crimes make up")
  //   .attr("font-size", collapsed ? "16px" : "20px")
  //   .attr("font-weight", "bold")
  //   .attr("text-anchor", collapsed ? "end" : "start")
  //   .attr("alignment-baseline", "middle")
  //   .attr("fill", "#005AA3");
  // labels
  //   .append("text")
  //   .attr("x", collapsed ? size.width - margin.right : x(lastViolx) + 150)
  //   .attr("y", y(lastViolIdx) - (collapsed ? 3 : 6) + 50)
  //   .attr("text-anchor", collapsed ? "end" : "start")
  //   .text("6% of all crimes.")
  //   .attr("font-size", collapsed ? "16px" : "20px")
  //   .attr("font-weight", "bold")
  //   .attr("alignment-baseline", "middle")
  //   .attr("fill", "#005AA3");
  container
    .append("p")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .html(
      "Data includes adult arrest info from 2013, 2018-2020. <a href='https://docs.google.com/spreadsheets/d/1NosIFv3dq5Qqc3nLblS60ADb4w1Dtax8PBzKNr1hvcU/edit'>Source: IVFP.</a>"
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
var arrData = null;
(function () {
  var resizeArrType = function () {
    var size = {
      height: 300 * (window.innerWidth < 600 ? 1.6 : 1),
      width: Math.max(Math.min(600, window.innerWidth), 270),
    };
    var margin = {
      left: 20 + (window.innerWidth < 600 ? 0 : 160),
      right: 20,
      top: 68,
      bottom: 10 + (window.innerWidth < 600 ? 20 : 0),
    };
    d3.select("#arrtype")
      .style("width", size.width + "px")
      .selectAll("*")
      .remove();
    arrestType(arrData, size, margin, window.innerWidth < 600);
  };
  window.addEventListener("resize", function () {
    // resizeIR();
    resizeArrType();
  });
  d3.csv(
    "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/arrType.csv"
  ).then(function (data) {
    arrData = groupArrTypeData(data);
    resizeArrType();
  });
})();
