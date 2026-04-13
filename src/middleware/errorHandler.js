/**
 * Gestionnaire d'erreurs global
 * Retourne les erreurs dans un format cohérent entre v1 et v2
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  // Format d'erreur uniforme
  const errorResponse = {
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  // En v1, on ajoute le champ legacy "success: false"
  if (req.apiVersion === 'v1') {
    errorResponse.success = false;
  }

  res.status(status).json(errorResponse);
};

module.exports = errorHandler;
