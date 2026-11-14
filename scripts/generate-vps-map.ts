// Regenerate the VPS map: bun run generate:vps-map [output-path]
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import GeoJSONReader from "jsts/org/locationtech/jts/io/GeoJSONReader.js";
import GeoJSONWriter from "jsts/org/locationtech/jts/io/GeoJSONWriter.js";
import GeometryFactory from "jsts/org/locationtech/jts/geom/GeometryFactory.js";
import TopologyPreservingSimplifier from "jsts/org/locationtech/jts/simplify/TopologyPreservingSimplifier.js";

const source =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.1/geojson/ne_50m_admin_0_map_units.geojson";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(root, "public/js/vps-map.json");

type Point = number[];
type Polygon = Point[][];
type Geometry =
  | { type: "Polygon"; coordinates: Polygon }
  | { type: "MultiPolygon"; coordinates: Polygon[] };
type Feature = { properties: Record<string, unknown>; geometry: Geometry };

const reader = new GeoJSONReader(new GeometryFactory());
const writer = new GeoJSONWriter();
const point = ([longitude, latitude]: Point): string =>
  `${(longitude + 180).toFixed(1)},${(85 - latitude).toFixed(1)}`;
const polygonPath = (polygon: Polygon): string =>
  polygon.map((ring) => `M${ring.map(point).join("L")}Z`).join("");
const label = (
  value: unknown,
  transform: (n: number) => number,
): number | null =>
  typeof value === "number" && Number.isFinite(value)
    ? Number(transform(value).toFixed(1))
    : null;

const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
if (!response.ok)
  throw new Error(
    `Failed to download Natural Earth data: HTTP ${response.status}`,
  );
const data = (await response.json()) as { features?: Feature[] };
if (!Array.isArray(data.features))
  throw new Error("Invalid Natural Earth feature collection");

const regions = data.features
  .filter((feature) => feature.properties.NAME !== "Antarctica")
  .map((feature) => {
    const result = writer.write(
      TopologyPreservingSimplifier.simplify(reader.read(feature.geometry), 0.3),
    ) as { type: string };
    if (result.type !== "Polygon" && result.type !== "MultiPolygon")
      throw new Error(`Unsupported geometry: ${result.type}`);
    const geometry = result as Geometry;
    const polygons =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.coordinates;
    const rawCode = feature.properties.ISO_A2_EH || feature.properties.ISO_A2;
    const code =
      typeof rawCode === "string" && /^[a-z]{2}$/i.test(rawCode)
        ? rawCode.toLowerCase()
        : "";
    return [
      code,
      polygons.map(polygonPath).join(""),
      label(feature.properties.LABEL_X, (value) => value + 180),
      label(feature.properties.LABEL_Y, (value) => 85 - value),
    ];
  });

await Bun.write(output, JSON.stringify(regions));
console.log(`Wrote ${regions.length} map units to ${output}`);
