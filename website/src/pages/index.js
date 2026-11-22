import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import ArtworkCard from '@site/src/components/ArtworkCard';
import ExhibitionList from '@site/src/components/ExhibitionList';
import GalleryMap from '@site/src/components/GalleryMap';
import {displayTitle, useCollection} from '@site/src/lib/collection';

function Hero({featured, established}) {
  const image = useBaseUrl(featured?.image ? `/img/collection/${featured.image}` : '/');
  return (
    <section className="jw-band jw-band--wall">
      <div className="jw-container jw-hero">
        <div className="jw-hero__text">
          <p className="jw-eyebrow">A private collection{established ? ` · Est. ${established}` : ''}</p>
          <h1>The Jones &amp; Wilson Collection</h1>
          <p className="jw-hero__lede">
            A private collection of art and objects, catalogued and displayed to museum standards, and growing one
            acquisition at a time.
          </p>
          <div className="jw-actions">
            <Link className="jw-button jw-button--light" to="/collection">
              Explore the collection
            </Link>
            <Link className="jw-button jw-button--gilt" to="/#map">
              View the gallery map
            </Link>
          </div>
        </div>
        {featured && (
          <figure className="jw-hero__figure">
            <Link to={`/collection/${featured.slug}`} className="jw-frame">
              <img src={image} alt={featured.image_alt || ''} />
            </Link>
            <figcaption>
              <span className="jw-eyebrow">Featured work</span>
              <br />
              {featured.artist?.name}, <i>{displayTitle(featured)}</i>
              {featured.date ? `, ${featured.date.toLowerCase()}` : ''}. {featured.medium}.
              {featured.credit_line && (
                <>
                  <br />
                  {featured.credit_line}
                </>
              )}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

const SECTIONS = ['collection', 'map', 'exhibitions', 'walk', 'visit'];

export default function Home() {
  const {objects, categories, exhibitions, gallery, site} = useCollection();
  const brokenLinks = useBrokenLinks();
  SECTIONS.forEach((id) => brokenLinks.collectAnchor(id));
  const featured = objects.find((o) => o.slug === site.featured) || objects.find((o) => o.image);
  return (
    <Layout description="The Jones & Wilson Collection: a private collection of art and objects, catalogued and displayed to museum standards.">
      <main>
        <Hero featured={featured} established={site.established} />

        <section className="jw-container jw-section" id="collection">
          <div className="jw-rule-heading jw-rule-heading--row">
            <h2>The permanent collection</h2>
            <Link to="/collection">View all {objects.length} works</Link>
          </div>
          <div className="jw-grid">
            {objects.map((o) => (
              <ArtworkCard key={o.slug} object={o} categories={categories} />
            ))}
          </div>
        </section>

        <section className="jw-band jw-band--shade" id="map">
          <div className="jw-container jw-section">
            <div className="jw-rule-heading jw-rule-heading--row">
              <h2>Gallery map</h2>
            </div>
            <GalleryMap objects={objects} categories={categories} gallery={gallery} />
          </div>
        </section>

        <section className="jw-band jw-band--accent" id="exhibitions">
          <div className="jw-container jw-section">
            <p className="jw-eyebrow">Exhibitions</p>
            <h2>Temporary exhibitions</h2>
            <ExhibitionList exhibitions={exhibitions} />
          </div>
        </section>

        <section className="jw-container jw-section jw-walk" id="walk">
          <div>
            <p className="jw-eyebrow jw-eyebrow--accent">In preparation</p>
            <h2>Walk the gallery</h2>
            <p className="jw-lede">
              A three-dimensional capture of the gallery will let you look around the room, approach each work and open
              its catalogue record, wherever you are.
            </p>
          </div>
          <div className="jw-viewer-slot" aria-label="3D gallery viewer, in preparation">
            <img src={useBaseUrl('/img/jw-compact-wall.svg')} alt="" aria-hidden="true" />
            <span className="jw-eyebrow">3D gallery viewer</span>
          </div>
        </section>

        <section className="jw-band jw-band--shade" id="visit">
          <div className="jw-container jw-section">
            <h2>Plan your visit</h2>
            <div className="jw-visit">
              <div>
                <h3>Hours</h3>
                <p>By appointment only.</p>
              </div>
              <div>
                <h3>Admission</h3>
                <p>By donation.</p>
              </div>
              <div>
                <h3>Audio guide</h3>
                <p>Tap your phone on the tag beside a work, or scan the code on its label.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
