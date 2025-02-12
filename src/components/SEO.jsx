import React from "react";
import { Helmet } from "react-helmet";

const SEO = ({ title, description }) => {
  const defaultTitle = "AllMyTab";
  const defaultDescription = "Your all-in-one productivity suite";

  return (
    <Helmet>
      <title>{title ? `${title} | AllMyTab` : defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {/* ... other meta tags */}
    </Helmet>
  );
};

export default SEO;
