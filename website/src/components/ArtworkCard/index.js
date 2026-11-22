import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {categoryLabel, displayTitle} from '@site/src/lib/collection';

export default function ArtworkCard({object, categories}) {
  const image = useBaseUrl(object.image ? `/img/collection/${object.image}` : '/');
  const category = categoryLabel(categories, object.category);
  const meta = [object.series && `${object.series} series`, object.date, object.medium].filter(Boolean).join(' · ');
  return (
    <Link to={`/collection/${object.slug}`} className="jw-card">
      <div className="jw-card__wall">
        {object.image ? (
          <img src={image} alt={object.image_alt || ''} loading="lazy" />
        ) : (
          <span className="jw-placeholder">Photograph to come</span>
        )}
      </div>
      {category && <div className="jw-card__category">{category}</div>}
      <div className="jw-card__artist">
        {object.artist?.name || <span className="jw-tbc">Artist to be confirmed</span>}
      </div>
      <div className="jw-card__title">{displayTitle(object)}</div>
      {meta && <div className="jw-card__meta">{meta}</div>}
    </Link>
  );
}
