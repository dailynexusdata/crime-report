import interactionByRacePlot from "./interaction_by_race";
import arrestType from "./arrtype";
import * as d3 from "d3";

interface irDataType {
  race: string;
  val: number;
  inv: string;
  tot: number;
  amt: number;
}
interface arrTypeDataType {
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

const groupIRData = (data: Array<irDataType>) => {
  const output: { [a: string]: [irDataType] } = {};

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

const groupArrTypeData = (data: arrTypeDataType) => {
  const output = {};

  data.forEach((dat) => {
    if (Object.keys(output).includes(dat.group)) {
      output[dat.group].push({ desc: dat.desc, n: dat.n, viol: dat.viol });
    } else {
      output[dat.group] = [{ desc: dat.desc, n: dat.n, viol: dat.viol }];
    }
  });

  return output;
};

let irData = null;
let arrData = null;

(() => {
  const resizeArrType = () => {
    const size = {
      height: 300,
      width: Math.max(Math.min(600, window.innerWidth), 300),
    };

    const margin: marginType = {
      left: 20 + (window.innerWidth < 600 ? 0 : 160),
      right: 20,
      top: 40,
      bottom: 10,
    };
    arrestType(arrData, size, margin);
  };
  const resizeIR = () => {
    const size = {
      height: 300,
      width: Math.max(Math.min(600, window.innerWidth), 300),
    };

    const margin: marginType = {
      left: 20 + (window.innerWidth < 600 ? 0 : 160),
      right: 20,
      top: 40,
      bottom: 10,
    };

    d3.select("#interaction_by_race")
      .style("width", size.width + "px")
      .selectAll("*")
      .remove();
    interactionByRacePlot(irData, size, margin, window.innerWidth < 600);
  };
  window.addEventListener("resize", () => {
    resizeIR();
    resizeArrType();
  });

  d3.csv(
    "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/involvement_by_race.csv"
  ).then((data) => {
    irData = groupIRData(data as any);
    delete irData["Other"];
    resizeIR();
  });
  d3.csv(
    "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/arrType.csv"
  ).then((data) => {
    arrData = groupArrTypeData(data as any);
    resizeArrType();
  });
})();
