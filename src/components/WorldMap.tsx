import { useMemo } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import countriesTopo from '../data/countries-110m.json';
import './WorldMap.css';

const WIDTH = 800;
const HEIGHT = 420;

export interface CountryFeatureProps {
  name: string;
}

export function useCountryFeatures() {
  return useMemo(() => {
    const topo = countriesTopo as unknown as Topology;
    const geo = feature(
      topo,
      topo.objects.countries as GeometryCollection
    ) as unknown as FeatureCollection<Geometry, CountryFeatureProps>;
    return geo.features
      .filter((f) => f.id !== undefined && f.properties.name !== 'Antarctica')
      .map((f) => ({ id: String(f.id), name: f.properties.name, feature: f }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);
}

interface WorldMapProps {
  visitedIds: Set<string>;
  onToggleCountry: (id: string, name: string) => void;
}

export function WorldMap({ visitedIds, onToggleCountry }: WorldMapProps) {
  const countries = useCountryFeatures();

  const { pathGen } = useMemo(() => {
    const topo = countriesTopo as unknown as Topology;
    const geo = feature(topo, topo.objects.countries as GeometryCollection) as unknown as FeatureCollection;
    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], geo);
    return { pathGen: geoPath(projection) };
  }, []);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="world-map-svg" role="img" aria-label="World map">
      <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#dceaf0" />
      {countries.map(({ id, name, feature: f }) => {
        const visited = visitedIds.has(id);
        return (
          <path
            key={id}
            d={pathGen(f) ?? undefined}
            className={`country ${visited ? 'visited' : ''}`}
            onClick={() => onToggleCountry(id, name)}
          >
            <title>{name}</title>
          </path>
        );
      })}
    </svg>
  );
}
