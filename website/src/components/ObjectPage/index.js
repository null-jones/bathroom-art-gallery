// One collection record: /collection/<slug>. Created by plugins/collection.js.

import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ArtworkCard from '@site/src/components/ArtworkCard';
import {
  artistLine,
  categoryLabel,
  displayTitle,
  fmtDimensions,
  paragraphs,
  useCollection,
  WALL_LABEL,
} from '@site/src/lib/collection';

function Detail({term, children}) {
  if (children == null || children === '') return null;
  return (
    <>
      <dt>{term}</dt>
      <dd>{children}</dd>
    </>
  );
}

function AudioGuide({object}) {
  const src = useBaseUrl(object.audio?.file ? `/audio/${object.audio.file}` : '/');
  if (!object.audio?.file) return null;
  return (
    <div className="jw-audio">
      <p className="jw-audio__stop">Audio guide{object.audio.stop ? ` · Stop ${object.audio.stop}` : ''}</p>
      <p className="jw-audio__title">
        {displayTitle(object)}
        {object.audio.narrator ? `, introduced by ${object.audio.narrator}` : ''}
      </p>
      <audio controls preload="none" src={src}>
        Your browser cannot play this audio.
      </audio>
    </div>
  );
}

export default function ObjectPage({object}) {
  const {objects, categories} = useCollection();
  const image = useBaseUrl(object.image ? `/img/collection/${object.image}` : '/');
  const title = displayTitle(object);
  const category = categoryLabel(categories, object.category);
  const dims = fmtDimensions(object.dimensions);
  const nat = artistLine(object.artist);
  const wall = WALL_LABEL[object.location?.wall];
  // "draft" means the record is incomplete, not that the work is off view.
  const onView = !['in-storage', 'on-loan'].includes(object.status);
  const related = objects.filter((o) => o.slug !== object.slug).slice(0, 4);
  const description = paragraphs(object.description);
  const bio = paragraphs(object.artist_bio);
  const cite = [object.artist?.name, title, object.date].filter(Boolean);

  return (
    <Layout
      title={`${title}${object.artist?.name ? `, ${object.artist.name}` : ''}`}
      description={object.label || undefined}>
      <main className="jw-container">
        <nav className="jw-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link> <span aria-hidden="true">›</span> <Link to="/collection">Collection</Link>
          {category && (
            <>
              {' '}
              <span aria-hidden="true">›</span> {category}
            </>
          )}{' '}
          <span aria-hidden="true">›</span> <i>{title}</i>
        </nav>

        <div className="jw-object">
          <div className="jw-object__wall">
            {object.image ? (
              <img src={image} alt={object.image_alt || ''} />
            ) : (
              <span className="jw-placeholder">Photograph to come</span>
            )}
          </div>

          <aside className="jw-object__tombstone">
            <div className="jw-badges">
              {onView && wall && <span className="jw-badge jw-badge--solid">On view · {wall}</span>}
              {category && <span className="jw-badge">{category}</span>}
              {object.map_number && <span className="jw-badge">Map no. {object.map_number}</span>}
            </div>
            <div>
              <h1 className="jw-object__artist">
                {object.artist?.name || <span className="jw-tbc">Artist to be confirmed</span>}
              </h1>
              {nat && <p className="jw-muted jw-object__nat">{nat}</p>}
            </div>
            <div>
              <p className="jw-object__title">{title}</p>
              <p className="jw-object__details">
                {[object.series && `${object.series} series`, object.date, object.medium, dims, object.credit_line]
                  .filter(Boolean)
                  .map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
              </p>
              {object.accession_number && <p className="jw-accession">{object.accession_number}</p>}
            </div>
            <AudioGuide object={object} />
            <div className="jw-actions">
              <Link className="jw-button jw-button--outline" to="/#map">
                Find it on the gallery map
              </Link>
              <Link className="jw-button jw-button--outline" to="/#walk">
                See it in the 3D gallery
              </Link>
            </div>
          </aside>
        </div>

        <div className="jw-object__body">
          <div className="jw-object__text">
            {description.length > 0 && (
              <section>
                <h2>About this work</h2>
                {description.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </section>
            )}
            {bio.length > 0 && (
              <section>
                <h2>About the artist</h2>
                {bio.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </section>
            )}
            {object.audio?.transcript && (
              <section>
                <h2>Audio transcript</h2>
                {paragraphs(object.audio.transcript).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </section>
            )}
            {description.length === 0 && bio.length === 0 && (
              <section>
                <h2>About this work</h2>
                <p className="jw-muted">This record is being catalogued.</p>
              </section>
            )}
          </div>

          <section className="jw-object__details-table" id="details">
            <h2>Object details</h2>
            <dl className="jw-dl">
              <Detail term="Artist">{object.artist?.name}</Detail>
              <Detail term="Title">
                <i>{title}</i>
              </Detail>
              <Detail term="Series">{object.series}</Detail>
              <Detail term="Date">{object.date}</Detail>
              <Detail term="Medium">{object.medium}</Detail>
              <Detail term="Dimensions">{dims}</Detail>
              <Detail term="Category">{category}</Detail>
              <Detail term="Credit line">{object.credit_line}</Detail>
              <Detail term="Accession no.">{object.accession_number}</Detail>
              <Detail term="Location">{onView && wall ? `On view, ${wall.toLowerCase()}` : null}</Detail>
              <Detail term="Provenance">{object.provenance}</Detail>
            </dl>
            {cite.length > 1 && (
              <p className="jw-cite">
                <strong>Cite this record</strong>
                <br />
                {object.artist?.name ? `${object.artist.name}, ` : ''}
                <i>{title}</i>
                {object.date ? `, ${object.date.charAt(0).toLowerCase()}${object.date.slice(1)}` : ''}. The Jones &amp;
                Wilson Collection{object.accession_number ? `, ${object.accession_number}` : ''}.
              </p>
            )}
          </section>
        </div>

        {related.length > 0 && (
          <section className="jw-section">
            <h2 className="jw-rule-heading">Also in the collection</h2>
            <div className="jw-grid">
              {related.map((o) => (
                <ArtworkCard key={o.slug} object={o} categories={categories} />
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
