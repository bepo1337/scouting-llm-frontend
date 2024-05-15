import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
  ZoomableGroup
} from "react-simple-maps";

const MapChart: React.FC = () => {
  return (
    <ComposableMap
      projection="geoAzimuthalEqualArea"
      projectionConfig={{
        rotate: [-10.0, -52.0, 0],
        center: [-5, -3],
        scale: 1100
      }}
    >
      <Geographies
        geography="/features.json"
        fill="#D6D6DA"
        stroke="#FFFFFF"
        strokeWidth={0.5}
      >
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} />
          ))
        }
      </Geographies>
      <Annotation
        subject={[2.3522, 48.8566]}
        dx={-70}
        dy={0}
        connectorProps={{
          stroke: "black",
          strokeWidth: 2,
          strokeLinecap: "round"
        }}
      >
        <text className="font-bold" x="-8" textAnchor="end" alignmentBaseline="middle" fill="black">
          {"France - Excel in French speaking club"}
        </text>
      </Annotation>
      <Annotation
        subject={[12.3522, 42.8566]}
        dx={-90}
        dy={0}
        connectorProps={{
          stroke: "blue",
          strokeWidth: 2,
          strokeLinecap: "round"
        }}
      >
        <text className="font-bold"x="-8" textAnchor="end" alignmentBaseline="middle" fill="blue">
          {"Italy: Good wingers, like to dive"}
        </text>
      </Annotation>
      <Annotation
        subject={[12.3522, 52.8566]}
        dx={-90}
        dy={-30}
        connectorProps={{
          stroke: "red",
          strokeWidth: 2,
          strokeLinecap: "round"
        }}
      >
        <text className="font-bold"x="-8" textAnchor="end" alignmentBaseline="middle" fill="red">
          {"Germany: No good strikers, good morale"}
        </text>
      </Annotation>

      <Annotation
        subject={[22.3522, 38.8566]}
        dx={0}
        dy={30}
        connectorProps={{
          stroke: "green",
          strokeWidth: 2,
          strokeLinecap: "round"
        }}
      >
        <text className="font-bold"x="-8" textAnchor="end" alignmentBaseline="middle" fill="green">
          {"Greece: Excellent dribbling and strong mental game"}
        </text>
      </Annotation>

    </ComposableMap>
  );
};

export default MapChart;
