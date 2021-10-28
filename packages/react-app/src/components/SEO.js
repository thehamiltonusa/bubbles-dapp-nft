import * as React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

function SEO({ description, lang, meta, title }) {

  const metaDescription = "UniqueBubbles - generate bubbles as NFT on xDAI, BSC and Polygon (Matic) network!"
  const metaDescriptionLong = "UniqueBubbles - generate bubbles as NFT on xDAI, BSC and Polygon (Matic) network!"
  const defaultTitle = "UniqueBubbles"

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      titleTemplate={defaultTitle ? `%s | ${defaultTitle}` : null}
      meta={[
        {
          name: 'description',
          content: metaDescription,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: metaDescriptionLong,
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:url',
          content: 'https://uniquebubbles.com/',
        },
        {
          property: 'og:image',
          content: 'https://ipfs.io/ipfs/QmQjpj4ji8gA5TTxg5SbMFZWSPiJK8dbxoDMe2e7yW68uc',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:url',
          content: 'https://uniquebubbles.com/',
        },
        {
          name: 'twitter:creator',
          content: '@BubblesDAPP',
        },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: metaDescriptionLong,
        },
        {
          name: 'twitter:image',
          content: 'https://ipfs.io/ipfs/QmQjpj4ji8gA5TTxg5SbMFZWSPiJK8dbxoDMe2e7yW68uc',
        },
      ].concat(meta)}
    />
  );
}

SEO.defaultProps = {
  lang: 'en',
  meta: [],
  description: '',
};

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
};

export default SEO;
