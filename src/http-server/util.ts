export const pathMatcher = (pathToMatch: string) => {
  const pathPre = pathToMatch
    .replace(/\/:([^/]+)/g, '/(?<$1>[^\/]+)')
    .replace('*', '.*');
  const regex = new RegExp('^' + pathPre + '$');
  return (path: string): false | Record<string, string> => {
    const result = regex.exec(path);
    if (!result) return false;
    return result.groups || {};
  }
}
