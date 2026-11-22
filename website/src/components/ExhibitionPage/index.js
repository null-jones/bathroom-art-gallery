// One exhibition: /exhibitions/<slug>. Created by plugins/collection.js.

import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {exhibitionDates} from '@site/src/components/ExhibitionList';
import {paragraphs} from '@site/src/lib/collection';

export default function ExhibitionPage({exhibition}) {
  const summary = paragraphs(exhibition.summary);
  return (
    <Layout title={exhibition.title} description={summary[0]}>
      <main>
        <header className="jw-band jw-band--accent">
          <div className="jw-container jw-band__inner">
            <p className="jw-eyebrow">Exhibition · {exhibitionDates(exhibition)}</p>
            <h1>{exhibition.title}</h1>
          </div>
        </header>
        <div className="jw-container jw-section">
          {summary.length ? (
            summary.map((p) => (
              <p key={p} className="jw-lede">
                {p}
              </p>
            ))
          ) : (
            <p className="jw-muted">Details of this exhibition will be announced.</p>
          )}
          {exhibition.works?.length > 0 && (
            <>
              <h2 className="jw-rule-heading">In the exhibition</h2>
              <ul className="jw-plain-list">
                {exhibition.works.map((w) => (
                  <li key={w.title}>
                    {w.slug ? (
                      <Link to={`/collection/${w.slug}`}>
                        <i>{w.title}</i>
                      </Link>
                    ) : (
                      <i>{w.title}</i>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p>
            <Link to="/#exhibitions">All exhibitions</Link>
          </p>
        </div>
      </main>
    </Layout>
  );
}
