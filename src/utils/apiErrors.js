/**
 * Extrait un message d'erreur lisible depuis une réponse API Laravel.
 */
export function getApiErrorMessage(error, fallback = 'Une erreur est survenue.') {
  if (!error?.response) {
    return 'Impossible de joindre le serveur. Vérifiez que l\'API est démarrée.';
  }

  const { data, status } = error.response;

  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }

  if (data?.message) {
    if (data.message === 'Invalid credentials') {
      return 'Identifiants incorrects.';
    }
    return data.message;
  }

  if (status === 422) return 'Veuillez vérifier les informations saisies.';
  if (status === 503) return fallback;

  return fallback;
}

export const PUBLIC_AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export function isPublicAuthRequest(url = '') {
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}
