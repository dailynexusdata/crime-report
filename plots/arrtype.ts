import * as d3 from "d3";

interface dataType {
  [group: string]: Array<{
    desc: string;
    n: number;
    viol: 0 | 1;
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

const arrestType = (data: dataType, size: sizeType, margin: marginType) => {
  console.log(data);
  const container = d3.select("#arrtype");
  container
    .append("h2")
    .text("Police Involvement by Race")
    .style("margin", "10px 0 0 10px");

  const plotArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("width", size.width);

  const svg = plotArea.append("svg");
  const legendarea = plotArea
    .append("div")
    .style("display", "flex")
    .style("justify-content", "space-evenly")
    .style("margin-bottom", "5px")
    .style("height", "20px")
    .style("margin-left", margin.left - margin.right + "px")
    .style("width", size.width - margin.left - margin.right + "px");

  legendarea.attr("height", 20).attr("width", size.width);
  svg.attr("height", size.height).attr("width", size.width);

  const y = d3
    .scaleLinear()
    .domain([0, 10])
    .range([size.height - margin.bottom, margin.top]);

  const x = d3
    .scaleLinear()
    .domain([0, 0.5])
    .range([margin.left, size.width - margin.right]);

  const bars = svg.append("g");
  //   const overlap = svg.append("g");

  svg
    .append("text")
    .text("% of Interactions")
    .attr("x", x(0))
    .attr("y", 15)
    // .style("font-size", "16px")
    .attr("fill", "#d3d3d3");

  svg
    .append("g")
    .style("font-size", "16px")
    .attr("transform", "translate(0, 40)")
    .attr("color", "#d3d3d3")
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
    .style("width", "175px")
    .style("display", "none");

  plotArea.on("mouseenter", () => {
    plotArea.on("mousemove", (event) => {
      tooltip.style("display", "block");

      //   tooltip.html(interactions[0].race);
      tooltip.html("hello");
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
      const [group, tooltipData] = Object.entries(data)[idx] as [
        string,
        Array<dataType>
      ];

      tooltip
        .html(
          `${group}<hr>Arrests: ${tooltipData[0].amt} of ${
            tooltipData[0].tot
          }, ${Math.round(tooltipData[0].val * 100)}%<br>Citations: ${
            tooltipData[1].amt
          } of ${tooltipData[1].tot}, ${Math.round(
            tooltipData[1].val * 100
          )}%<br>DFC: ${tooltipData[2].amt} of ${
            tooltipData[2].tot
          }, ${Math.round(tooltipData[2].val * 100)}%`
        )
        .style("left", xpos - size.width / 2 + 60 + "px")
        .style("top", ypos + "px");
    });
    plotArea.on("mouseleave", () => {
      tooltip.style("display", "none");
    });
  });

  Object.entries(data).forEach(([group, interactions], j) => {
    let currx = 0;

    interactions.forEach((int: dataType, i: number) => {
      // console.log({
      //   group,
      //   currx,
      //   inval: int["val"],
      //   a1: x(currx),
      //   a2: x(int.val),
      // });
      bars
        .append("rect")
        .attr("x", x(currx))
        .attr("y", y(j) - (collapsed ? 20 : 30))
        .attr("height", collapsed ? 20 : 30)
        .attr("width", x(int.val) - margin.left)
        .attr(
          "fill",
          color[i] + ((group === "Black" && i === 0) || i !== 0 ? "" : "44")
        );

      if (group === "Black" && i === 0) {
        bars
          .append("text")
          .attr("x", x(int.val) + 5)
          .attr("y", y(j) - (collapsed ? 10 - 2 : 15))
          .text(`${Math.round(int.val * 100)}%`)
          .attr("text-anchor", "start")
          .attr("alignment-baseline", "middle");
      }
      if (collapsed) {
        bars
          .append("text")
          .text(group)
          .attr("x", x(0))
          .attr("y", y(j) - 22)
          .attr("text-anchor", "start");
      } else {
        bars
          .append("text")
          .text(group)
          .attr("x", x(0) - 10)
          .attr("y", y(j) - 15)
          .attr("text-anchor", "end")
          .attr("alignment-baseline", "middle");
      }
      currx += int.val;
    });

    // overlap
    //   .append("rect")
    //   .attr("y", y(j) - 30)
    //   .attr("height", 30)
    //   .attr("x", x(0))
    //   .attr("class", "overlap")
    //   .attr("width", x(1) - margin.right)
    //   .attr("fill", "#00000000");
  });
};

export default arrestType;
