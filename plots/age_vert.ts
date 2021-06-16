import * as d3 from "d3";
import { svg } from "d3";

interface arrTypeDataType {
  group: string;
  desc: string;
  n: number;
  viol: 0 | 1;
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
const groupByAge = (data) => {
  const output = {};

  data.forEach((dat) => {
    if (Object.keys(output).includes(dat.age)) {
      output[dat.age].push(dat);
    } else {
      output[dat.age] = [dat];
    }
  });
  delete output.NA;

  return output;
};
const crimes = [
  "Alcohol",
  "Partying",
  "Disorderly Conduct",
  "Resisting arrest",
  "Fake ID",
  "Abuse",
  "Driving w/o License",
  "Drugs",
  // "Failure to appear",
  // "Fighting",
  // "Illegal camping",
  // "Juvenile",
  // "License revoked",
  // "Property Damage",
  // "Public Nudity",
  // "Robbery/Burglary/Theft",
  // "Trespassing",
];

const agePlot = (data, size, margin) => {
  const tooltipAlignmentx = (x, tooltipBox) => {
    return Math.min(size.width1 - tooltipBox.width, x) + "px";
  };

  const tooltipAlignmenty = (y, tooltipBox) => {
    if (y > size.height / 2) {
      return y - tooltipBox.height - 60 + "px";
    }
    return Math.min(y - 40, size.height) + "px";
  };
  const grouped = Object.entries(groupByAge(data)).map(([age, data]) => {
    let nAgeGroup = 0;

    crimes.forEach((crime) => {
      nAgeGroup += data.find(({ group }) => crime === group)
        ? Number(data.find(({ group }) => crime === group).n)
        : 0;
    });

    let curr = 0;
    const out = {};
    // console.log(nAgeGroup);

    crimes.forEach((crime) => {
      const arr = data.find(({ group }) => crime === group);
      // console.log(crime, data[crime]);
      const next = arr ? arr.n / nAgeGroup : 0;
      out[crime] = [curr, curr + next];
      curr += next;
    });

    return [+age, out];
  });

  const collapsed = {};
  Object.entries(groupByAge(data)).forEach(([age, subgroup]) => {
    collapsed[age] = subgroup.reduce((a, { n }) => a + Number(n), 0);
  });

  const container = d3
    .select("#age")
    .style(
      "font-family",
      "Baskerville,Baskerville Old Face,Hoefler Text,Garamond,Times New Roman,serif"
    );
  container.append("h2").text("Crimes by Age").style("margin", "10px 0 0 10px");

  const plotArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("width", size.width + "px");

  const svgLine = plotArea.append("svg");
  const svgBars = plotArea.append("svg");

  svgBars.attr("height", size.height2).attr("width", size.width);
  svgLine.attr("height", size.height1).attr("width", size.width);

  const y1 = d3
    .scaleLinear()
    .domain([0, 1100])
    .range([size.height1 - 30, margin.top + 15]);

  const x = d3
    .scaleLinear()
    .domain([grouped[0][0], grouped[grouped.length - 1][0]])
    .range([margin.left, size.width - margin.right]);
  const y2 = d3.scaleLinear().range([size.height2 - margin.bottom, margin.top]);

  svgBars
    .append("g")
    .style("font-size", "16px")
    .attr("transform", `translate(0, ${size.height2 - margin.bottom})`)
    .attr("color", "#adadad")
    .call(
      d3
        .axisBottom(x)
        .ticks(5)
        .tickFormat((d) => d)
    );
  svgBars
    .append("g")
    .style("font-size", "16px")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("color", "#adadad")
    .call(
      d3
        .axisLeft(y2)
        .ticks(5)
        .tickFormat((d) => Number(d * 100))
    );
  svgLine
    .append("text")
    .text("% of Total Crimes")
    .attr("x", x(18) - 46)
    .attr("y", size.height1)
    // .style("font-size", "16px")
    .attr("text-anchor", "start")
    .attr("fill", "#adadad");
  svgBars
    .append("text")
    .text("Age")
    .attr("x", x(66))
    .attr("y", size.height2 - 10)
    .attr("text-anchor", "end")
    // .style("font-size", "16px")
    .attr("fill", "#adadad");
  svgLine
    .append("g")
    .style("font-size", "16px")
    .attr("transform", `translate(${margin.left}, 0)`)
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

  plotArea.on("mouseenter", () => {
    d3.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    plotArea.on("mousemove", (event) => {
      tooltip.style("display", "block");

      //   tooltip.html(interactions[0].race);
      const [xpos, ypos] = d3.pointer(event);

      if (
        ypos < margin.top ||
        ypos > size.height - 4 ||
        xpos < margin.left ||
        xpos > size.width - margin.right
      ) {
        d3.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
        tooltip.style("display", "none");
        return;
      }

      const idx = Math.min(Math.max(Math.round(y.invert(ypos)), 18), 65);
      const [group, ttd] = Object.values(grouped)[idx - 18];

      const tooltipData = Object.entries(ttd)
        .sort(([_, [a, b]], [__, [c, d]]) => a - c)
        .map(([group, [a, b]]) => {
          return [group, b - a];
        });
      // .filter(([a, b]) => b > 0);

      d3.selectAll("rect[class^='bar']").attr("fill-opacity", 0.1);
      d3.selectAll(`.bar-${idx}`).attr("fill-opacity", 1);

      tooltip.html(
        `Age ${group}<hr>${tooltipData
          .map(
            ([grp, pct]) =>
              `${grp}: ${
                pct < 0.005 ? (pct === 0 ? 0 : "<1") : Math.round(pct * 100)
              }%`
          )
          .join("<br>")}`
      );

      const tooltipBox = tooltip.node().getBoundingClientRect();
      const xval = tooltipAlignmentx(xpos, tooltipBox);
      const yval = tooltipAlignmenty(ypos, tooltipBox);

      tooltip.style("left", xval).style("top", yval);
    });
    plotArea.on("mouseleave", () => {
      tooltip.style("display", "none");
      // d3.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
      d3.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    });
  });

  const grays = d3.scaleSequential(d3.interpolateGreys).domain([5, -5]);

  const getColor = (i) => {
    if (i === 0) {
      return "#CC575F"; //"#005aa3";
    }
    if (i === 1) {
      return "#003660";
    }
    if (i === 2) {
      return "#005aa3";
    }
    return grays(i - 3);
  };

  grouped.forEach(([age, subgroups]) => {
    Object.entries(subgroups).map(([group, range], i) => {
      if (range[1] - range[0] === 0) {
        return;
      }
      console.log(range, range[1] - range[0], y2(range[0]));
      svgBars
        .append("rect")
        .attr("class", `bar-${age}`)
        .attr("y", y2(range[1]))
        .attr("height", y2(range[0]) - y2(range[1]))
        .attr("x", x(age))
        .attr("width", 6)
        .attr("fill", getColor(i))
        .attr("fill-opacity", 1);
    });
  });
  const legendarea = container
    .append("div")
    .style("display", "flex")
    .style("justify-content", "space-evenly")
    .style("margin-bottom", "5px")
    .style("flex-wrap", "wrap")
    .style("min-height", "20px")
    .style("margin-left", margin.left + "px")
    .style("width", size.width - margin.left - margin.right + "px");

  legendarea.attr("height", 20).attr("width", size.width1);
  ["Alcohol", "Partying", "Disorderly Conduct"].forEach((lab, i) => {
    const item = legendarea
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

  const line = d3
    .line()
    .x((d) => {
      return x(Number(d[0]));
    })
    .y((d) => {
      return y1(d[1]);
    });

  const area = d3
    .area()
    .x((d) => x(d[0]))
    .y0(y1(0))
    .y1((d) => y1(d[1]));

  svgLine
    .append("path")
    .datum(Object.entries(collapsed))
    .attr("d", line)
    .attr("stroke", "black")
    .attr("stroke-width", "2px")
    .attr("fill", "none");

  svgLine
    .append("path")
    .datum(Object.entries(collapsed).filter(([a, _]) => a <= 23))
    .attr("d", area)
    .attr("stroke", "none")
    .attr("fill", "#d3d3d3aa");
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

export default agePlot;
