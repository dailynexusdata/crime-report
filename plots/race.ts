import * as d3 from "d3";

const racePlot = (data, size, margin, collapsed) => {
  const tooltipAlignmentx = (x, tooltipBox) => {
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

  const tooltipAlignmenty = (y, tooltipBox) => {
    if (collapsed) {
      return y + 10 + "px";
    }
    if (y > size.height / 2) {
      return y - tooltipBox.height - 10 + "px";
    }
    return Math.max(60, y + 10) + "px";
  };
  const container = d3
    .select("#snap-race-d3")
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif");
  container
    .append("h2")
    .text("Isla Vista Crimes by Race")
    .style("margin", "10px 10px 0 10px");

  const plotArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("width", size.width + "px");

  const svg = plotArea.append("svg");
  const legendarea = plotArea
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

  const y = d3
    .scaleLinear()
    .domain([0, 6])
    .range([size.height - margin.bottom, margin.top]);

  const x = d3
    .scaleLinear()
    .domain([0, 4000])
    // .domain([0, 0.7])
    .range([margin.left, size.width - margin.right]);

  const bars = svg.append("g");
  const lab = svg.append("g");
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

  ["Over Represented", "Under Represented"].forEach((lab, i) => {
    legendarea
      .append("p")
      .text(lab)
      .style("margin", "3px")
      .style("padding", "2px 5px")
      .attr("text-anchor", "middle")
      .style("background-color", ["#AFDBF4", "#d3d3d399"][i])
      .attr("alignment-baseline", "middle");
  });
  const tooltip = plotArea
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

  plotArea.on("mouseenter touchstart", () => {
    plotArea.on("mousemove touchstart", (event) => {
      tooltip.style("display", "block");

      //   tooltip.html(interactions[0].race);
      const [xpos, ypos] = d3.pointer(event);

      if (
        ypos < margin.top + 10 ||
        ypos > size.height - 10 ||
        xpos < margin.left ||
        xpos > size.width - margin.right
      ) {
        tooltip.style("display", "none");
        return;
      }

      const idx = Math.min(Math.max(Math.floor(y.invert(ypos)), 0), 5);
      const [group, tooltipData] = Object.entries(data)[idx];

      tooltip.html(
        `${group}<hr># of Crimes: ${d3.format(",")(tooltipData.tot)}` +
          (tooltipData.exp > -1 && group !== "Other"
            ? `<br> Expected: ${d3.format(",")(Math.round(tooltipData.exp))}`
            : "")
      );

      const tooltipBox = tooltip.node().getBoundingClientRect();
      tooltip
        .style("left", tooltipAlignmentx(xpos, tooltipBox))
        .style("top", tooltipAlignmenty(ypos, tooltipBox));
    });
    plotArea.on("mouseleave touchend", () => {
      tooltip.style("display", "none");
    });
  });

  Object.entries(data).forEach(([group, { pct, exp }], i) => {
    // console.log({
    //   group,
    //   currPct,
    //   inval: int["val"],
    //   a1: x(currPct),
    //   a2: x(int.val),
    // });

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
      `M ${x(2000)} ${y(3.3)} Q ${x(1700)} ${y(3)}, ${
        x(Object.values(data)[4].exp) + 6
      } ${y(4) + 10}`
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

const groupIRData = (data) => {
  const output = {};

  data.forEach((dat) => {
    if (Object.keys(output).includes(dat.race)) {
      output[dat.race].push(dat);
    } else {
      output[dat.race] = [dat];
    }
  });

  Object.entries(output).forEach(([group, inters]) => {
    const sum = output[group].map((d) => Number(d.val)).reduce((a, b) => a + b);
    inters.forEach((i) => {
      i.amt = i.val;
      i.tot = sum;
      i.val = Number(i.val) / sum;
    });
  });
  const outputReversed = {};

  Object.keys(output)
    .reverse()
    .forEach((key) => {
      outputReversed[key] = output[key];
    });

  return outputReversed;
};

const groupArrTypeData = (data) => {
  const output = {};

  data.forEach((dat) => {
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

  const order = Object.entries(output)
    .map(([group, arr]) => {
      return [group, arr.reduce((a, { pct }) => a + pct, 0)];
    })
    .sort(([_, a], [__, b]) => a - b)
    .map(([g, _]) => g);

  const outputOrdered = {};

  order.forEach((group) => {
    outputOrdered[group] = output[group];
  });

  return outputOrdered;
};

export default () => {
  let raceData = null;
  const resizeRacePlot = () => {
    const size = {
      height: 300,
      width: Math.max(Math.min(600, window.innerWidth), 250),
    };

    const margin = {
      left: 25 + (window.innerWidth < 600 ? 0 : 160),
      right: 30,
      top: 40,
      bottom: 10,
    };
    d3.select("#snap-race-d3")
      .style("width", size.width + "px")
      .selectAll("*")
      .remove();
    racePlot(raceData, size, margin, window.innerWidth < 600);
  };
  window.addEventListener("resize", () => {
    resizeRacePlot();
  });
  d3.csv(
    "dist/data/race.csv"
    // "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/race.csv"
  ).then((dat) => {
    const data = {};
    dat.forEach(({ race, tot, pct, exp }) => {
      data[race] = { tot, pct, exp };
    });
    raceData = data;
    resizeRacePlot();
  });
};
