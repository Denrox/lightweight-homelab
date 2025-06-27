/**
 * Regex pattern to validate file paths
 * Allows: alphanumeric, hyphens, underscores, forward slashes (including trailing slash)
 * Disallows: backslashes, special characters, path traversal attempts, absolute paths
 */
export const PATH_REGEX = /^[a-zA-Z0-9\/\-_]+$/;

/**
 * Validates if a path is safe and follows correct format
 * @param path - The path to validate
 * @returns true if path is valid, false otherwise
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Check for path traversal attempts
  if (path.includes('../') || path.includes('./') || path.includes('..\\') || path.includes('.\\')) {
    return false;
  }

  // Check for absolute paths
  if (path.startsWith('/') || path.startsWith('\\')) {
    return false;
  }

  // Check for consecutive slashes
  if (path.includes('//')) {
    return false;
  }

  // Check for invalid characters - explicitly check for common problematic characters
  const invalidChars = /[*?"<>|&$#@!%^()\[\]{}+=~`;:,]/;
  if (invalidChars.test(path)) {
    return false;
  }

  // Check for backslashes
  if (path.includes('\\')) {
    return false;
  }

  return true;
}

/**
 * Normalizes a path by removing any "../../data/" prefix for display
 * @param path - The path to normalize
 * @returns The normalized path without the prefix
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  
  // Remove "../../data/" prefix if present
  if (path.startsWith('../../data/')) {
    return path.substring('../../data/'.length);
  }
  
  return path;
}

/**
 * Denormalizes a path by adding "../../data/" prefix if not present
 * @param path - The path to denormalize
 * @returns The denormalized path with the prefix
 */
export function denormalizePath(path: string): string {
  if (!path) return '';
  
  // Add "../../data/" prefix if not already present
  if (!path.startsWith('../../data/')) {
    return `../../data/${path}`;
  }
  
  return path;
}

/**
 * Cleans a path input by removing invalid characters and patterns
 * @param path - The path to clean
 * @returns The cleaned path
 */
export function cleanPath(path: string): string {
  if (!path) return '';
  
  let cleanPath = path;
  
  // Remove path traversal patterns
  cleanPath = cleanPath.replace(/\.\.\//g, '').replace(/\.\//g, '');
  cleanPath = cleanPath.replace(/\.\.\\/g, '').replace(/\.\\/g, '');
  
  // Remove leading slashes
  cleanPath = cleanPath.replace(/^\/+/, '').replace(/^\\+/, '');
  
  // Remove invalid characters (keep only alphanumeric, hyphens, underscores, forward slashes)
  cleanPath = cleanPath.replace(/[^a-zA-Z0-9\/\-_]/g, '');
  
  // Remove consecutive slashes (but preserve trailing slash if it was there)
  const hasTrailingSlash = cleanPath.endsWith('/');
  cleanPath = cleanPath.replace(/\/+/g, '/');
  if (hasTrailingSlash && !cleanPath.endsWith('/')) {
    cleanPath += '/';
  }
  
  return cleanPath;
}

/**
 * Gets validation error message for a path
 * @param path - The path to validate
 * @returns Error message if invalid, null if valid
 */
export function getPathValidationError(path: string): string | null {
  if (!path) {
    return 'Path is required';
  }

  if (path.includes('../') || path.includes('./') || path.includes('..\\') || path.includes('.\\')) {
    return 'Path cannot contain directory traversal patterns (../ or ./)';
  }

  if (path.startsWith('/') || path.startsWith('\\')) {
    return 'Path cannot be absolute (cannot start with / or \\)';
  }

  if (path.includes('//')) {
    return 'Path cannot contain consecutive slashes';
  }

  // Check for invalid characters
  const invalidChars = /[*?"<>|&$#@!%^()\[\]{}+=~`;:,]/;
  if (invalidChars.test(path)) {
    return 'Path contains invalid characters. Only letters, numbers, hyphens, underscores, and forward slashes are allowed';
  }

  if (path.includes('\\')) {
    return 'Path cannot contain backslashes';
  }

  return null;
} 