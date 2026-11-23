import React, {useState} from 'react';
import Layout from '@theme/Layout';
import ArtworkCard from '@site/src/components/ArtworkCard';
import {useCollection} from '@site/src/lib/collection';

export default function Collection() {
  const {objects, categories} = useCollection();
  const [selected, setSelected] = useState('all');
  const shown = objects.filter((o) => selected === 'all' || o.category === selected);
  return (
    <Layout title="Collection" description="Every work in the Jones & Wilson Collection.">
      <main className="jw-container jw-section">
        <h1 className="jw-page-title">The collection</h1>
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
        {shown.length ? (
          <div className="jw-grid">
            {shown.map((o) => (
              <ArtworkCard key={o.slug} object={o} categories={categories} />
            ))}
          </div>
        ) : (
          <p className="jw-muted">No works in this category yet.</p>
        )}
      </main>
    </Layout>
  );
}
