// Plan of the gallery with a numbered marker for each work that has a
// location, and a category filter. Plan geometry is drawn at 60 px per foot
// inside a 600 x 420 viewBox; the room occupies x 60-540, y 60-360.

import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import {categoryLabel, displayTitle, WALL_LABEL} from '@site/src/lib/collection';

const PX = 60;
const X0 = 60;
const Y0 = 60;

function markerPosition(location, gallery) {
  const {wall, along_ft: along = 0} = location;
  const w = gallery.width_ft * PX;
  const d = gallery.depth_ft * PX;
  const points = {
    north: [X0 + along * PX, Y0],
    south: [X0 + along * PX, Y0 + d],
    west: [X0, Y0 + along * PX],
    east: [X0 + w, Y0 + along * PX],
  };
  const [x, y] = points[wall];
  return {left: `${(x / 600) * 100}%`, top: `${(y / 420) * 100}%`};
}

function Plan() {
  const label = {fontFamily: 'var(--jw-font-text)', fontSize: 15, letterSpacing: '0.24em', fill: 'var(--jw-ink)'};
  const note = {fontFamily: 'var(--jw-font-text)', fontSize: 14, fill: 'var(--jw-ink-muted)'};
  return (
    <svg
      viewBox="0 0 600 420"
      role="img"
      aria-label="Plan of the gallery: toilet near the west corner and vanity with mirror beside it on the north wall, narrow windows at the north ends of the east and west walls, the entrance on the east wall, and a ceiling light and fan towards the west">
      <rect x="90" y="64" width="100" height="40" rx="4" fill="none" stroke="#5E534B" strokeWidth="1.5" />
      <ellipse cx="140" cy="148" rx="37" ry="44" fill="none" stroke="#5E534B" strokeWidth="1.5" />
      <rect x="215" y="64" width="240" height="105" fill="#EAE0CF" stroke="#5E534B" strokeWidth="1.5" />
      <ellipse cx="335" cy="114" rx="48" ry="28" fill="none" stroke="#5E534B" strokeWidth="1.5" />
      <path d="M221 69 H449" stroke="#B8955A" strokeWidth="4" />
      <circle cx="170" cy="262" r="26" fill="none" stroke="#5E534B" strokeWidth="1.5" strokeDasharray="5 4" />
      <path d="M60 60 H540 V180 H556 V360 H60 Z" fill="none" stroke="#221C18" strokeWidth="8" />
      <rect x="55" y="66" width="10" height="56" fill="#F3ECDF" />
      <path d="M56.5 66 V122 M63.5 66 V122" stroke="#221C18" strokeWidth="1.5" />
      <rect x="535" y="66" width="10" height="56" fill="#F3ECDF" />
      <path d="M536.5 66 V122 M543.5 66 V122" stroke="#221C18" strokeWidth="1.5" />
      <rect x="551" y="196" width="10" height="148" fill="#F3ECDF" />
      <path d="M552 344 H404" stroke="#221C18" strokeWidth="2" />
      <path d="M404 344 A148 148 0 0 1 552 196" fill="none" stroke="#5E534B" strokeWidth="1" strokeDasharray="4 4" />
      <text x="140" y="214" textAnchor="middle" style={note}>
        Toilet
      </text>
      <text x="335" y="190" textAnchor="middle" style={note}>
        Vanity, mirror above
      </text>
      <text x="486" y="300" textAnchor="middle" style={note}>
        Entrance
      </text>
      <text x="300" y="34" textAnchor="middle" style={label}>
        NORTH
      </text>
      <text x="300" y="400" textAnchor="middle" style={label}>
        SOUTH
      </text>
      <text x="24" y="210" textAnchor="middle" transform="rotate(-90 24 210)" style={label}>
        WEST
      </text>
      <text x="584" y="210" textAnchor="middle" transform="rotate(90 584 210)" style={label}>
        EAST
      </text>
    </svg>
  );
}

export default function GalleryMap({objects, categories, gallery}) {
  const [selected, setSelected] = useState('all');
  const placed = objects.filter((o) => o.map_number).sort((a, b) => a.map_number - b.map_number);
  const isActive = (o) => selected === 'all' || o.category === selected;
  const count = placed.filter(isActive).length;
  const selectedLabel = selected === 'all' ? null : categoryLabel(categories, selected);
  const countLabel = selectedLabel
    ? count
      ? `${count} ${count === 1 ? 'work' : 'works'} in ${selectedLabel}`
      : `No works on view in ${selectedLabel}`
    : `${count} works on view`;
  const confirmed = placed.every((o) => o.location?.position_confirmed);

  return (
    <div>
      <div className="jw-chips" role="group" aria-label="Filter by category">
        {[{key: 'all', label: 'All works'}, ...categories].map((c) => (
          <button
            key={c.key}
            type="button"
            className="jw-chip"
            aria-pressed={selected === c.key}
            onClick={() => setSelected(c.key)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="jw-map">
        <figure className="jw-map__plan">
          <div className="jw-map__canvas">
            <Plan />
            {placed.map((o) => (
              <Link
                key={o.slug}
                to={`/collection/${o.slug}`}
                className={`jw-marker ${isActive(o) ? '' : 'jw-marker--dim'}`}
                style={markerPosition(o.location, gallery)}
                aria-label={`${o.map_number}: ${displayTitle(o)}`}>
                {o.map_number}
              </Link>
            ))}
          </div>
          <figcaption>
            Double lines: windows. Dashed circle: ceiling light and fan. Approx. {gallery.width_ft} × {gallery.depth_ft}{' '}
            ft, {gallery.ceiling_ft} ft ceiling.
            {!confirmed && ' Positions are provisional until each work is hung.'}
          </figcaption>
        </figure>
        <div className="jw-map__list">
          <p className="jw-muted">{countLabel}</p>
          <ol>
            {placed.map((o) => (
              <li key={o.slug} className={isActive(o) ? '' : 'jw-dim'}>
                <span className={`jw-marker jw-marker--static ${isActive(o) ? '' : 'jw-marker--dim'}`}>
                  {o.map_number}
                </span>
                <Link to={`/collection/${o.slug}`}>
                  <i>{displayTitle(o)}</i>
                  <br />
                  <span className="jw-muted">
                    {[
                      o.artist?.name || 'Artist to be confirmed',
                      categoryLabel(categories, o.category),
                      WALL_LABEL[o.location.wall],
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
