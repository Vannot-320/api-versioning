/**
 * Middleware : ajoute des headers d'avertissement pour les versions dépréciées
 * Conforme au RFC 8594 (Sunset Header) et RFC 9110 (Deprecation Header)
 */
const deprecationMiddleware = (version, successor, sunsetDate) => {
  return (req, res, next) => {
    const sunset = new Date(sunsetDate);

    // RFC 8594 - Sunset Header
    res.setHeader('Sunset', sunset.toUTCString());

    // Deprecation Header (draft IETF)
    res.setHeader('Deprecation', 'true');

    // Lien vers la version successeure
    res.setHeader(
      'Link',
      `</api/${successor}${req.path}>; rel="successor-version"`
    );

    // Warning lisible
    res.setHeader(
      'Warning',
      `299 - "API ${version} is deprecated. Please migrate to ${successor} before ${sunsetDate}"`
    );

    next();
  };
};

module.exports = deprecationMiddleware;
