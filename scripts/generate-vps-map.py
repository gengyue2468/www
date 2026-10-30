"""Generate the small VPS map from Natural Earth (requires Shapely)."""

import json
from pathlib import Path
from urllib.request import urlopen

from shapely.geometry import shape


URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.1/geojson/ne_50m_admin_0_map_units.geojson"
OUTPUT = Path(__file__).resolve().parent.parent / "public/js/vps-map.json"


def point(coordinates):
    longitude, latitude = coordinates[:2]
    return f"{longitude + 180:.1f},{85 - latitude:.1f}"


def polygon_path(polygon):
    rings = [polygon.exterior, *polygon.interiors]
    return "".join("M" + "L".join(point(p) for p in ring.coords) + "Z" for ring in rings)


with urlopen(URL, timeout=30) as response:
    data = json.load(response)

regions = []
for feature in data["features"]:
    properties = feature["properties"]
    if properties.get("NAME") == "Antarctica":
        continue
    geometry = shape(feature["geometry"]).simplify(0.3, preserve_topology=True)
    polygons = [geometry] if geometry.geom_type == "Polygon" else list(geometry.geoms)
    path = "".join(polygon_path(polygon) for polygon in polygons if polygon.geom_type == "Polygon")
    code = properties.get("ISO_A2_EH") or properties.get("ISO_A2")
    if not isinstance(code, str) or len(code) != 2 or not code.isalpha():
        code = ""
    longitude, latitude = properties.get("LABEL_X"), properties.get("LABEL_Y")
    if not isinstance(longitude, (int, float)) or not isinstance(latitude, (int, float)):
        longitude = latitude = None
    regions.append([code.lower(), path, round(longitude + 180, 1) if longitude is not None else None,
                    round(85 - latitude, 1) if latitude is not None else None])

OUTPUT.write_text(json.dumps(regions, separators=(",", ":")), encoding="utf-8")
print(f"Wrote {len(regions)} map units to {OUTPUT}")
