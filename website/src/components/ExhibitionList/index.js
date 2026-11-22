import React from 'react';
import Link from '@docusaurus/Link';
import {paragraphs} from '@site/src/lib/collection';

const fmt = new Intl.DateTimeFormat('en-CA', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});

export function exhibitionDates(exhibition) {
  const {start, end} = exhibition.dates || {};
  if (!start) return 'Dates to be announced';
  const s = fmt.format(new Date(start));
  return end ? `${s} – ${fmt.format(new Date(end))}` : `From ${s}`;
}

export default function ExhibitionList({exhibitions}) {
  const shown = exhibitions.filter((e) => e.status !== 'past');
  if (!shown.length) return <p>No exhibitions are scheduled.</p>;
  return (
    <div className="jw-exhibitions">
      {shown.map((e) => {
        const summary = paragraphs(e.summary)[0];
        const works = (e.works || []).map((w) => w.title);
        return (
          <article key={e.slug} className="jw-exhibition">
            <p className="jw-exhibition__dates">{exhibitionDates(e)}</p>
            <h3>{e.title}</h3>
            {summary && <p>{summary}</p>}
            {works.length > 0 && (
              <p>
                Featuring{' '}
                {works.map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 && (i === works.length - 1 ? ' and ' : ', ')}
                    <i>{t}</i>
                  </React.Fragment>
                ))}
                .
              </p>
            )}
            <Link to={`/exhibitions/${e.slug}`}>About the exhibition</Link>
          </article>
        );
      })}
    </div>
  );
}
