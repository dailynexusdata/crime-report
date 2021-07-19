import * as d3 from "d3";

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
const crimes = ["Alcohol", "Partying", "Disorderly Conduct", "Other"];

const ageWide = (data, size, margin) => {
  const tooltipAlignmentx = (x, tooltipBox) => {
    return Math.min(size.width1 - tooltipBox.width, x + 5) + "px";
  };

  const tooltipAlignmenty = (y, tooltipBox) => {
    if (y > size.height / 2) {
      return y - tooltipBox.height - 90 + "px";
    }
    return Math.min(y - 70, size.height) + "px";
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
    .select("#snap-age-d3")
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

  const plotArea = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "row")
    .style("align-items", "center")
    .style("width", size.width1 + size.width2 + "px");

  const svgBars = plotArea.append("svg");
  const svgLine = plotArea.append("svg");

  svgBars.attr("height", size.height).attr("width", size.width1);
  svgLine.attr("height", size.height).attr("width", size.width2);

  const y = d3
    .scaleLinear()
    .domain([grouped[0][0], grouped[grouped.length - 1][0]])
    .range([margin.top, size.height - margin.bottom]);

  const x1 = d3.scaleLinear().range([margin.left, size.width1 - margin.right]);
  const x2 = d3
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
        .tickFormat((d) => `${Math.round(d * 100)}`)
    );
  svgBars
    .append("g")
    .style("font-size", "16px")
    .attr("transform", `translate(${margin.left}, 0)`)
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
      `M ${x2(600)} ${y(30)} Q ${x2(850)} ${y(27)}, ${x2(700)} ${y(23) + 5}`
    )
    .attr("marker-end", "url(#triangle)")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", "2px");

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

  plotArea.on("mouseenter touchstart", () => {
    plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    plotArea.on("mousemove touchstart", (event) => {
      tooltip.style("display", "block");

      //   tooltip.html(interactions[0].race);
      const [xpos, ypos] = d3.pointer(event);

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

      const idx = Math.min(Math.max(Math.round(y.invert(ypos)), 18), 65);
      const [group, ttd] = Object.values(grouped)[idx - 18];

      const tooltipData = Object.entries(ttd)
        .sort(([_, [a, b]], [__, [c, d]]) => a - c)
        .map(([group, [a, b]]) => {
          return [group, b - a];
        });
      // .filter(([a, b]) => b > 0);

      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 0.1);
      plotArea.selectAll(`.bar-${idx}`).attr("fill-opacity", 1);

      tooltip.html(
        `Age ${group}<hr><b>Total # of Crimes: ${
          collapsed[group]
        }</b><br>${tooltipData
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
      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    });
  });

  const grays = d3.scaleSequential(d3.interpolateGreys).domain([-5, 10]);

  const getColor = (i) => {
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

  grouped.forEach(([age, subgroups]) => {
    Object.entries(subgroups).map(([group, range], i) => {
      svgBars
        .append("rect")
        .attr("class", `bar-${age}`)
        .attr("y", y(age))
        .attr("height", 5)
        .attr("x", x1(range[0]))
        .attr("width", x1(range[1]) - x1(range[0]))
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
    .style("width", size.width1 - margin.left - margin.right + "px");

  legendarea.attr("height", 20).attr("width", size.width1);
  crimes.forEach((lab, i) => {
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

  svgLine
    .append("line")
    .attr("x1", x2(0))
    .attr("x2", x2(0))
    .attr("y1", y(18))
    .attr("y2", y(66))
    .attr("stroke", "#d3d3d3");
  const line = d3
    .line()
    .x((d) => {
      return x2(d[1]);
    })
    .y((d) => {
      return y(Number(d[0]));
    });

  const area = d3
    .area()
    .x0(x2(0))
    .x1((d) => x2(d[1]))
    .y((d) => y(d[0]));

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
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .html(
      "Data includes adult arrest info from 2013, 2018-2020. <a href='https://docs.google.com/spreadsheets/d/1NosIFv3dq5Qqc3nLblS60ADb4w1Dtax8PBzKNr1hvcU/edit'>Source: IVFP.</a>"
    )
    .style("margin", "0 10px");
};

const ageVert = (data, size, margin) => {
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
    .select("#snap-age-d3")
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
    .range([size.height1 - 10, margin.top - 5]);

  const x = d3
    .scaleLinear()
    .domain([grouped[0][0], grouped[grouped.length - 1][0]])
    .range([margin.left, size.width - margin.right]);
  const y2 = d3
    .scaleLinear()
    .range([size.height2 - margin.bottom, margin.top - 10]);

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
      `M ${x(33) - 5} ${y1(700)} Q ${x(29)} ${y1(1100)}, ${x(24)} ${y1(600)}`
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
  const grays = d3.scaleSequential(d3.interpolateGreys).domain([-5, 10]);

  const getColor = (i) => {
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

  grouped.forEach(([age, subgroups]) => {
    Object.entries(subgroups).map(([group, range], i) => {
      if (range[1] - range[0] === 0) {
        return;
      }
      // console.log(range, range[1] - range[0], y2(range[0]));
      svgBars
        .append("rect")
        .attr("class", `bar-${age}`)
        .attr("y", y2(range[1]))
        .attr("height", y2(range[0]) - y2(range[1]))
        .attr("x", x(age))
        .attr("width", (size.width - margin.left - margin.right) / 48)
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
  crimes.forEach((lab, i) => {
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
  plotArea.on("mouseenter touchstart", () => {
    plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    plotArea.on("mousemove touchstart", (event) => {
      tooltip.style("display", "block");

      //   tooltip.html(interactions[0].race);
      const [xpos, ypos] = d3.pointer(event);

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

      const idx = Math.min(Math.max(Math.round(x.invert(xpos)), 18), 65);
      const [group, ttd] = Object.values(grouped)[idx - 18];

      const tooltipData = Object.entries(ttd)
        .sort(([_, [a, b]], [__, [c, d]]) => a - c)
        .map(([group, [a, b]]) => {
          return [group, b - a];
        });
      // .filter(([a, b]) => b > 0);

      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 0.1);
      plotArea.selectAll(`.bar-${idx}`).attr("fill-opacity", 1);

      tooltip.html(
        `Age ${group}<hr><b>Total # of Crimes: ${
          collapsed[group]
        }</b><br>${tooltipData
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
    plotArea.on("mouseleave touchend", () => {
      tooltip.style("display", "none");
      // d3.selectAll("rect[class^='bar']").attr("fill-opacity", 0);
      plotArea.selectAll("rect[class^='bar']").attr("fill-opacity", 1);
    });
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
    .style("font-family", "Helvetica Neue, Helvetica, Arial, sans-serif")
    .html(
      "Data includes adult arrest info from 2013, 2018-2020. <a href='https://docs.google.com/spreadsheets/d/1NosIFv3dq5Qqc3nLblS60ADb4w1Dtax8PBzKNr1hvcU/edit'>Source: IVFP.</a>"
    )
    .style("margin", "0 10px");
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
  let ageData = null;
  const resizeAgePlot = () => {
    const width = Math.max(Math.min(600, window.innerWidth), 270);

    d3.select("#snap-age-d3")
      .style("width", width + "px")
      .selectAll("*")
      .remove();
    if (window.innerWidth < 600) {
      const size = {
        height1: 90,
        height2: 320,
        width: width,
      };
      const margin = {
        left: 60,
        right: 30,
        top: 35,
        bottom: 25,
      };
      ageVert(ageData, size, margin);
    } else {
      const size = {
        height: 300,
        width1: width * 0.8,
        width2: width * 0.2,
      };
      const margin = {
        left: 55,
        right: 15,
        top: 40,
        bottom: 10,
      };
      ageWide(ageData, size, margin);
    }
  };
  window.addEventListener("resize", () => {
    // resizeIR();
    resizeAgePlot();
  });
  d3.csv(
    "dist/data/age.csv"
    // "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/age.csv"
  ).then((data) => {
    ageData = data;
    resizeAgePlot();
  });
};
