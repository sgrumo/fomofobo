import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec"

/**
 * @description Holds the flat retro MapLibre style of the event map
 * @remarks Labels in Noto Sans, the one family OpenFreeMap serves as glyphs, and copies the `--palette-map-*` values of `packages/styles`, PLACEHOLDER(TQ-08)
 */
export const mapStyle = {
    version: 8,
    name: "fomofobo-retro",
    metadata: {
        "fomofobo:placeholders": ["TQ-08"],
        "fomofobo:patterns": {
            "dot-dither": "/map/dot-dither.png",
        },
    },
    sources: {
        openmaptiles: {
            type: "vector",
            url: "https://tiles.openfreemap.org/planet",
        },
    },
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    layers: [
        {
            id: "ground",
            type: "background",
            paint: {
                "background-color": "#237a60",
            },
        },
        {
            id: "ground-dither",
            type: "background",
            paint: {
                "background-pattern": "dot-dither",
            },
        },
        {
            id: "blocks",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "landuse",
            filter: [
                "in",
                ["get", "class"],
                ["literal", ["residential", "commercial", "retail", "industrial"]],
            ],
            paint: {
                "fill-color": "#185945",
                "fill-opacity": 0.7,
            },
        },
        {
            id: "parks",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "park",
            paint: {
                "fill-color": "#185945",
            },
        },
        {
            id: "water",
            type: "fill",
            source: "openmaptiles",
            "source-layer": "water",
            paint: {
                "fill-color": "#8fe3c0",
            },
        },
        {
            id: "waterways",
            type: "line",
            source: "openmaptiles",
            "source-layer": "waterway",
            paint: {
                "line-color": "#8fe3c0",
                "line-width": ["interpolate", ["linear"], ["zoom"], 12, 2, 18, 10],
            },
        },
        {
            id: "roads-minor",
            type: "line",
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: [
                "in",
                ["get", "class"],
                ["literal", ["minor", "service", "track", "path"]],
            ],
            paint: {
                "line-color": "#defcf0",
                "line-opacity": 0.45,
                "line-width": ["interpolate", ["linear"], ["zoom"], 13, 0.5, 18, 2],
            },
        },
        {
            id: "roads-major",
            type: "line",
            source: "openmaptiles",
            "source-layer": "transportation",
            filter: [
                "in",
                ["get", "class"],
                ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary"]],
            ],
            paint: {
                "line-color": "#defcf0",
                "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1.5, 18, 4],
            },
        },
        {
            id: "road-labels",
            type: "symbol",
            source: "openmaptiles",
            "source-layer": "transportation_name",
            minzoom: 14,
            layout: {
                "symbol-placement": "line",
                "text-field": ["upcase", ["get", "name"]],
                "text-font": ["Noto Sans Regular"],
                "text-size": 10,
                "text-letter-spacing": 0.08,
            },
            paint: {
                "text-color": "#defcf0",
            },
        },
        {
            id: "place-labels",
            type: "symbol",
            source: "openmaptiles",
            "source-layer": "place",
            filter: [
                "in",
                ["get", "class"],
                ["literal", ["suburb", "neighbourhood", "quarter"]],
            ],
            layout: {
                "text-field": ["upcase", ["get", "name"]],
                "text-font": ["Noto Sans Regular"],
                "text-size": 10,
                "text-letter-spacing": 0.08,
            },
            paint: {
                "text-color": "#defcf0",
            },
        },
    ],
} satisfies StyleSpecification
