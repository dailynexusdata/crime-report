import * as d3 from "d3";
import { toNamespacedPath } from "path/posix";

const arrestType = (data, size, margin, collapsed) => {
  const tooltipAlignmentx = (x, tooltipBox) => {
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

  const tooltipAlignmenty = (y, tooltipBox) => {
    if (collapsed) {
      return y + 10 + "px";
    }
    if (y > size.height / 2) {
      return y - tooltipBox.height - 10 + "px";
    }
    return Math.max(0, y + 10) + "px";
  };
  const container = d3
    .select("#snap-arrtype-d3")
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

  const plotArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("width", size.width);

  const svg = plotArea.append("svg");
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

  const y = d3
    .scaleLinear()
    .domain([0, 9])
    .range([size.height - margin.bottom, margin.top]);

  const x = d3
    .scaleLinear()
    .domain([0, 0.6])
    .range([margin.left, size.width - margin.right]);

  const overlap = svg.append("g");
  const bars = svg.append("g");

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
        .tickFormat((d) => `${Math.round(d * 100)}`)
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
  const tooltip = plotArea
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

  const labels = svg.append("g");
  labels.style("display", "block");

  plotArea.on("mouseenter touchstart", () => {
    labels.style("display", "none");
    plotArea.on("mousemove touchstart", (event) => {
      //   tooltip.html(interactions[0].race);
      const [xpos, ypos] = d3.pointer(event);

      if (
        ypos < margin.top - 20 ||
        ypos > size.height + 10 ||
        xpos < margin.left ||
        xpos > size.width - margin.right
      ) {
        tooltip.style("display", "none");
        return;
      }
      const idx = collapsed
        ? Math.min(Math.max(Math.ceil(y.invert(ypos) + 0.5), 1), 11)
        : Math.min(Math.max(Math.ceil(y.invert(ypos)), 1), 11);

      const [group, tooltipData] = Object.entries(data)[idx];

      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
      plotArea
        .selectAll(`.bar-${group.split(/[ /]/)[0]}`)
        .attr("fill-opacity", 1);

      tooltip.html(
        `${group}<hr>${tooltipData
          .map(
            ({ desc, pct }) =>
              `${desc}: ${pct < 0.005 ? "<1" : Math.round(pct * 100)}%`
          )
          .join("<br>")}`
      );

      const tooltipBox = tooltip.node().getBoundingClientRect();
      const xval = tooltipAlignmentx(xpos, tooltipBox);
      const yval = tooltipAlignmenty(ypos, tooltipBox);

      tooltip.style("left", xval).style("top", yval).style("display", "block");
    });
    plotArea.on("mouseleave touchend", () => {
      labels.style("display", "block");
      tooltip.style("display", "none");
      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
    });
  });

  const grays = d3.scaleSequential(d3.interpolateGreys).domain([6, -5]);

  let viol = 0;
  let lastViolIdx = 0;
  let lastViolx = 0;
  Object.entries(data)
    .slice(1, 11)
    .forEach(([group, crimes], j) => {
      let currx = 0;

      // console.log(group);
      crimes.forEach((crime, i) => {
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
          .attr("class", `bar-${group.split(/[ /]/)[0]}`)
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
          .text(`${Math.round(currx * 100)}%`)
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
      `M ${x(collapsed ? 0.29 : 0.28)} ${collapsed ? 220 : 160} Q ${x(
        collapsed ? 0.27 : 0.23
      )} ${collapsed ? 205 : 135}, ${x(0.1)} ${collapsed ? 205 : 135}`
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
    .text("Data includes adult arrest info from 2013, 2018-2020. Source: IVFP.")
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
  let arrData = null;
  const resizeArrType = () => {
    const size = {
      height: 300 * (window.innerWidth < 600 ? 1.6 : 1),
      width: Math.max(Math.min(600, window.innerWidth), 270),
    };

    const margin = {
      left: 20 + (window.innerWidth < 600 ? 0 : 160),
      right: 20,
      top: 68,
      bottom: 10 + (window.innerWidth < 600 ? 20 : 0),
    };
    d3.select("#snap-arrtype-d3")
      .style("width", size.width + "px")
      .selectAll("*")
      .remove();
    arrestType(arrData, size, margin, window.innerWidth < 600);
  };

  window.addEventListener("resize", () => {
    // resizeIR();
    resizeArrType();
  });

  d3.csv(
    "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/arrType.csv"
  ).then((data) => {
    arrData = groupArrTypeData(data);
    resizeArrType();
  });
};
