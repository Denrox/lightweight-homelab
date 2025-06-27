import { isValidPath, cleanPath, getPathValidationError, PATH_REGEX } from './path-validation';

// Test cases for path validation
const testCases = [
  // Valid paths
  { path: 'files/os/ubuntu-releases', expected: true, description: 'Simple valid path' },
  { path: 'wiki/zim', expected: true, description: 'Simple valid path' },
  { path: 'downloads/docker-images', expected: true, description: 'Path with hyphens' },
  { path: 'data_files/backup', expected: true, description: 'Path with underscores' },
  { path: 'folder123/subfolder', expected: true, description: 'Path with numbers' },
  { path: 'deep/nested/folder/structure', expected: true, description: 'Deep nested path' },
  { path: 'files/os/', expected: true, description: 'Directory path with trailing slash' },
  { path: 'wiki/', expected: true, description: 'Directory path with trailing slash' },
  { path: 'downloads/', expected: true, description: 'Directory path with trailing slash' },
  
  // Invalid paths
  { path: '../files/os', expected: false, description: 'Path traversal attempt' },
  { path: './files/os', expected: false, description: 'Current directory reference' },
  { path: '/absolute/path', expected: false, description: 'Absolute path' },
  { path: 'files//os', expected: false, description: 'Consecutive slashes' },
  { path: 'files\\os', expected: false, description: 'Backslash in path' },
  { path: 'files/os*', expected: false, description: 'Invalid character' },
  { path: 'files/os?', expected: false, description: 'Invalid character' },
  { path: 'files/os|', expected: false, description: 'Invalid character' },
  { path: 'files/os<', expected: false, description: 'Invalid character' },
  { path: 'files/os>', expected: false, description: 'Invalid character' },
  { path: 'files/os"', expected: false, description: 'Invalid character' },
  { path: "files/os'", expected: false, description: 'Invalid character' },
  { path: 'files/os;', expected: false, description: 'Invalid character' },
  { path: 'files/os&', expected: false, description: 'Invalid character' },
  { path: 'files/os#', expected: false, description: 'Invalid character' },
  { path: 'files/os@', expected: false, description: 'Invalid character' },
  { path: 'files/os!', expected: false, description: 'Invalid character' },
  { path: 'files/os$', expected: false, description: 'Invalid character' },
  { path: 'files/os%', expected: false, description: 'Invalid character' },
  { path: 'files/os^', expected: false, description: 'Invalid character' },
  { path: 'files/os(', expected: false, description: 'Invalid character' },
  { path: 'files/os)', expected: false, description: 'Invalid character' },
  { path: 'files/os[', expected: false, description: 'Invalid character' },
  { path: 'files/os]', expected: false, description: 'Invalid character' },
  { path: 'files/os{', expected: false, description: 'Invalid character' },
  { path: 'files/os}', expected: false, description: 'Invalid character' },
  { path: 'files/os+', expected: false, description: 'Invalid character' },
  { path: 'files/os=', expected: false, description: 'Invalid character' },
  { path: 'files/os~', expected: false, description: 'Invalid character' },
  { path: 'files/os`', expected: false, description: 'Invalid character' },
  { path: 'files/os,', expected: false, description: 'Invalid character' },
  { path: 'files/os.', expected: false, description: 'Invalid character' },
  { path: 'files/os:', expected: false, description: 'Invalid character' },
  { path: 'files/os;', expected: false, description: 'Invalid character' },
  { path: 'files/os<', expected: false, description: 'Invalid character' },
  { path: 'files/os>', expected: false, description: 'Invalid character' },
  { path: 'files/os?', expected: false, description: 'Invalid character' },
];

// Test the regex pattern directly
console.log('Testing PATH_REGEX pattern:');
testCases.forEach(({ path, expected, description }) => {
  const regexResult = PATH_REGEX.test(path);
  const isValid = isValidPath(path);
  const error = getPathValidationError(path);
  const cleaned = cleanPath(path);
  
  console.log(`\n${description}:`);
  console.log(`  Path: "${path}"`);
  console.log(`  Regex test: ${regexResult} (expected: ${expected})`);
  console.log(`  isValidPath: ${isValid} (expected: ${expected})`);
  console.log(`  Error: ${error || 'None'}`);
  console.log(`  Cleaned: "${cleaned}"`);
  
  if (regexResult !== expected) {
    console.log(`  ❌ FAIL: Regex test mismatch`);
  } else if (isValid !== expected) {
    console.log(`  ❌ FAIL: isValidPath mismatch`);
  } else {
    console.log(`  ✅ PASS`);
  }
});

// Test cleanPath function with various inputs
console.log('\n\nTesting cleanPath function:');
const cleanTestCases = [
  { input: '../files/os', expected: 'files/os', description: 'Remove path traversal' },
  { input: './files/os', expected: 'files/os', description: 'Remove current directory' },
  { input: '//files//os', expected: 'files/os', description: 'Remove consecutive slashes' },
  { input: '/files/os', expected: 'files/os', description: 'Remove leading slash' },
  { input: 'files/os*', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os?', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os|', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os<', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os>', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os"', expected: 'files/os', description: 'Remove invalid characters' },
  { input: "files/os'", expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os;', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os&', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os#', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os@', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os!', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os$', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os%', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os^', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os(', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os)', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os[', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os]', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os{', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os}', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os+', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os=', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os~', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os`', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os,', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os.', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os:', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os;', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os<', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os>', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os?', expected: 'files/os', description: 'Remove invalid characters' },
  { input: 'files/os/', expected: 'files/os/', description: 'Preserve trailing slash' },
  { input: 'files//os/', expected: 'files/os/', description: 'Clean consecutive slashes but preserve trailing' },
  { input: 'files/os///', expected: 'files/os/', description: 'Clean multiple trailing slashes to single' },
];

cleanTestCases.forEach(({ input, expected, description }) => {
  const result = cleanPath(input);
  console.log(`\n${description}:`);
  console.log(`  Input: "${input}"`);
  console.log(`  Output: "${result}"`);
  console.log(`  Expected: "${expected}"`);
  
  if (result === expected) {
    console.log(`  ✅ PASS`);
  } else {
    console.log(`  ❌ FAIL: Expected "${expected}", got "${result}"`);
  }
});

export { testCases, cleanTestCases }; 