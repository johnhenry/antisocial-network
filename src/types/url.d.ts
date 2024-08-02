export type URLProtocol = "http:" | "https:";
export type URLPort = `${number}`; // 8080
export type URLPathname = `/${string}`; // /path-to-thing
export type URLHostname = string; // localhost
export type URLHost = `${URLHostname}:${URLPort}`; // localhost:8080
export type URLOrigin = `${URLProtocol}//${URLHost}`; //http://localhost:8080
export type URLHref = `${URLOrigin}${URLPathname}`; // http://localhost:8080/path-to-thing
