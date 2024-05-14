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
        dx={-90}
        dy={-30}
        connectorProps={{
          stroke: "#FF5533",
          strokeWidth: 3,
          strokeLinecap: "round"
        }}
      >
        <text className="font-bold" x="-8" textAnchor="end" alignmentBaseline="middle" fill="#F53">
          {"Paris"}
        </text>
      </Annotation>
      <Annotation
        subject={[12.3522, 41.8566]}
        dx={-90}
        dy={-30}
        connectorProps={{
          stroke: "blue",
          strokeWidth: 3,
          strokeLinecap: "round"
        }}
      >
        <text className="font-mono"x="-8" textAnchor="end" alignmentBaseline="middle" fill="blue">
          {"Italy: Good wingers, bad habits"}
        </text>
      </Annotation>
    </ComposableMap>
  );
};

export default MapChart;
