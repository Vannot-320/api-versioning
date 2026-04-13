/**
 * Middleware : détecte la version d'API depuis l'URL path
 * Exemples : /api/v1/users → version = "v1"
 *            /api/v2/users → version = "v2"
 */
const versionMiddleware = (req, res, next) => {
  const versionMatch = req.path.match(/^\/api\/(v\d+)/);
  if (versionMatch) {
    req.apiVersion = versionMatch[1];
  }
  next();
};

module.exports = versionMiddleware;
