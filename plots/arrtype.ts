import * as d3 from "d3";
import { toNamespacedPath } from "path/posix";

interface dataType {
  [group: string]: Array<{
    desc: string;
    n: number;
    viol: 0 | 1;
    pct: number;
  }>;
}
interface marginType {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
interface sizeType {
  height: number;
  width: number;
}

const arrestType = (
  data: dataType,
  size: sizeType,
  margin: marginType,
  collapsed: boolean
) => {
  const tooltipAlignmentx = (x, tooltipBox) => {
    return (
      Math.min(
        size.width - margin.left - tooltipBox.width - (collapsed ? 30 : 10),
        x - margin.left + (collapsed ? -15 : 10)
      ) + "px"
    );
  };

  const tooltipAlignmenty = (y, tooltipBox) => {
    return Math.max(0, y) + "px";
  };
  const container = d3
    .select("#arrtype")
    .style(
      "font-family",
      "Baskerville,Baskerville Old Face,Hoefler Text,Garamond,Times New Roman,serif"
    );
  container
    .append("h2")
    .text("Types of Crimes")
    .style("margin", "10px 0 0 10px");

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
    .domain([0, 10])
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
        .tickFormat((d) => `${Math.round((d as number) * 100)}`)
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

  plotArea.on("mouseenter", () => {
    labels.style("display", "none");
    plotArea.on("mousemove", (event) => {
      tooltip.style("display", "block");

      //   tooltip.html(interactions[0].race);
      const [xpos, ypos] = d3.pointer(event);

      if (
        ypos < margin.top - 20 ||
        ypos > size.height - 10 ||
        xpos < margin.left ||
        xpos > size.width - margin.right
      ) {
        tooltip.style("display", "none");
        return;
      }

      const idx = Math.min(Math.max(Math.round(y.invert(ypos)), 0), 11);
      const [group, tooltipData] = Object.entries(data)[idx];

      d3.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
      d3.selectAll(`.bar-${group.split(/[ /]/)[0]}`).attr("fill-opacity", 1);

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

      tooltip.style("left", xval).style("top", yval);
    });
    plotArea.on("mouseleave", () => {
      labels.style("display", "block");
      tooltip.style("display", "none");
      d3.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
    });
  });

  const grays = d3.scaleSequential(d3.interpolateGreys).domain([6, -5]);

  let viol = 0;
  let lastViolIdx = 0;
  let lastViolx = 0;
  Object.entries(data).forEach(([group, crimes], j) => {
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
      .attr("fill", viol ? "#9FCBE4" : "#d3d3d399");

    if (viol === 1) {
      lastViolx = currx;

      labels
        .append("text")
        .text(`${Math.round(currx * 100)}%`)
        .attr("x", x(currx) + 5)
        .attr("y", y(j) - (collapsed ? -2 : 8))
        .attr("alignment-baseline", collapsed ? "hanging" : "middle")
        .attr("fill", "#9FCBE4")
        .attr("font-weight", "bold");
    }
  });
  labels
    .append("text")
    .attr("x", collapsed ? size.width - margin.right : x(lastViolx) + 150)
    .attr("y", y(lastViolIdx) - (collapsed ? 3 : 6) + 30)
    .text("Violent Crimes make up")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("text-anchor", collapsed ? "end" : "start")
    .attr("alignment-baseline", "middle")
    .attr("fill", "#9FCBE4");
  labels
    .append("text")
    .attr("x", collapsed ? size.width - margin.right : x(lastViolx) + 150)
    .attr("y", y(lastViolIdx) - (collapsed ? 3 : 6) + 50)
    .attr("text-anchor", collapsed ? "end" : "start")
    .text("less than _% of all crimes.")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("alignment-baseline", "middle")
    .attr("fill", "#9FCBE4");
  container
    .append("p")
    .style(
      "font-family",
      "Baskerville,Baskerville Old Face,Hoefler Text,Garamond,Times New Roman,serif"
    )
    .text("Source: IVASPDKSAPD. Raw race groups aggregated into these groups.")
    .style("margin", "0 10px")
    .append("hr");
};

export default arrestType;
