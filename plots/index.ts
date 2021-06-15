import interactionByRacePlot from "./interaction_by_race";
import arrestType from "./arrtype";
import racePlot from "./race";
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

let irData = null;
let arrData = null;
let raceData = null;

(() => {
  const resizeArrType = () => {
    const size = {
      height: 300 * (window.innerWidth < 600 ? 1.6 : 1),
      width: Math.max(Math.min(600, window.innerWidth), 300),
    };

    const margin: marginType = {
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
  const resizeRacePlot = () => {
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
    d3.select("#race")
      .style("width", size.width + "px")
      .selectAll("*")
      .remove();
    racePlot(raceData, size, margin, window.innerWidth < 600);
  };
  window.addEventListener("resize", () => {
    resizeIR();
    resizeArrType();
    resizeRacePlot();
  });

  d3.csv(
    "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/arrType.csv"
  ).then((data) => {
    arrData = groupArrTypeData(data as any);
    resizeArrType();
  });
  d3.csv(
    "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/involvement_by_race.csv"
  ).then((data) => {
    irData = groupIRData(data as any);
    delete irData["Other"];
    resizeIR();
  });

  d3.json(
    "https://raw.githubusercontent.com/dailynexusdata/crime-report/main/dist/data/race.json"
  ).then((data) => {
    raceData = data;
    resizeRacePlot();

    console.log(Object.values(data).reduce((a, { pct }) => a + pct, 0));
  });
})();
