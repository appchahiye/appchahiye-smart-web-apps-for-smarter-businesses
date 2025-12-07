var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// .wrangler/tmp/bundle-3vXiAB/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var Context = class {
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  setLayout = (layout) => this.#layout = layout;
  getLayout = () => this.#layout;
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  request = (input, requestInit, Env2, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env2, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env2,
      executionCtx
    );
  };
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = (method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  };
  this.match = match2;
  return match2(method, path);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  };
};

// node_modules/hono/dist/utils/color.js
function getColorEnabled() {
  const { process, Deno } = globalThis;
  const isNoColor = typeof Deno?.noColor === "boolean" ? Deno.noColor : process !== void 0 ? "NO_COLOR" in process?.env : false;
  return !isNoColor;
}
async function getColorEnabledAsync() {
  const { navigator } = globalThis;
  const cfWorkers = "cloudflare:workers";
  const isNoColor = navigator !== void 0 && navigator.userAgent === "Cloudflare-Workers" ? await (async () => {
    try {
      return "NO_COLOR" in ((await import(cfWorkers)).env ?? {});
    } catch {
      return false;
    }
  })() : !getColorEnabled();
  return !isNoColor;
}

// node_modules/hono/dist/middleware/logger/index.js
var humanize = (times) => {
  const [delimiter, separator] = [",", "."];
  const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter));
  return orderTimes.join(separator);
};
var time = (start) => {
  const delta = Date.now() - start;
  return humanize([delta < 1e3 ? delta + "ms" : Math.round(delta / 1e3) + "s"]);
};
var colorStatus = async (status) => {
  const colorEnabled = await getColorEnabledAsync();
  if (colorEnabled) {
    switch (status / 100 | 0) {
      case 5:
        return `\x1B[31m${status}\x1B[0m`;
      case 4:
        return `\x1B[33m${status}\x1B[0m`;
      case 3:
        return `\x1B[36m${status}\x1B[0m`;
      case 2:
        return `\x1B[32m${status}\x1B[0m`;
    }
  }
  return `${status}`;
};
async function log(fn, prefix, method, path, status = 0, elapsed) {
  const out = prefix === "<--" ? `${prefix} ${method} ${path}` : `${prefix} ${method} ${path} ${await colorStatus(status)} ${elapsed}`;
  fn(out);
}
var logger = (fn = console.log) => {
  return async function logger2(c, next) {
    const { method, url } = c.req;
    const path = url.slice(url.indexOf("/", 8));
    await log(fn, "<--", method, path);
    const start = Date.now();
    await next();
    await log(fn, "-->", method, path, c.res.status, time(start));
  };
};

// worker/d1-utils.ts
async function queryAll(db, sql, params = []) {
  const result = await db.prepare(sql).bind(...params).all();
  return result.results ?? [];
}
async function queryFirst(db, sql, params = []) {
  const result = await db.prepare(sql).bind(...params).first();
  return result ?? null;
}
async function insert(db, table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => "?").join(", ");
  const columns = keys.join(", ");
  await db.prepare(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
  ).bind(...values).run();
  return data;
}
async function updateById(db, table, id, updates) {
  const keys = Object.keys(updates);
  if (keys.length === 0)
    return false;
  const setClause = keys.map((k) => `${k} = ?`).join(", ");
  const values = [...Object.values(updates), id];
  const result = await db.prepare(
    `UPDATE ${table} SET ${setClause} WHERE id = ?`
  ).bind(...values).run();
  return (result.meta?.changes ?? 0) > 0;
}
async function deleteById(db, table, id) {
  const result = await db.prepare(
    `DELETE FROM ${table} WHERE id = ?`
  ).bind(id).run();
  return (result.meta?.changes ?? 0) > 0;
}
async function existsById(db, table, id) {
  const result = await db.prepare(
    `SELECT 1 FROM ${table} WHERE id = ? LIMIT 1`
  ).bind(id).first();
  return result !== null;
}

// worker/entities.ts
var toUser = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  passwordHash: row.password_hash,
  avatarUrl: row.avatar_url ?? void 0,
  notificationPreferences: row.notification_prefs ? JSON.parse(row.notification_prefs) : { projectUpdates: true, newMessages: true }
});
var toClient = (row) => ({
  id: row.id,
  userId: row.user_id,
  company: row.company,
  projectType: row.project_type ?? "",
  portalUrl: row.portal_url ?? "/portal/:clientId",
  status: row.status,
  createdAt: row.created_at
});
var toProject = (row) => ({
  id: row.id,
  clientId: row.client_id,
  title: row.title,
  progress: row.progress,
  deadline: row.deadline,
  notes: row.notes ?? "",
  updatedAt: row.updated_at
});
var toMilestone = (row) => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  description: row.description ?? "",
  status: row.status,
  dueDate: row.due_date,
  files: row.files ? JSON.parse(row.files) : [],
  updatedAt: row.updated_at
});
var toInvoice = (row) => ({
  id: row.id,
  clientId: row.client_id,
  amount: row.amount,
  status: row.status,
  pdf_url: row.pdf_url ?? "",
  issuedAt: row.issued_at,
  serviceIds: row.service_ids ? JSON.parse(row.service_ids) : []
});
var toMessage = (row) => ({
  id: row.id,
  clientId: row.client_id,
  senderId: row.sender_id,
  receiverId: row.receiver_id,
  content: row.content,
  attachments: row.attachments ? JSON.parse(row.attachments) : [],
  createdAt: row.created_at
});
var toFormSubmission = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  company: row.company ?? "",
  projectDescription: row.project_description ?? "",
  features: row.features ?? "",
  submittedAt: row.submitted_at
});
var toService = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  type: row.type,
  price: row.price
});
var MOCK_WEBSITE_CONTENT = {
  hero: { headline: "Your Business, Simplified.", subheadline: "We build smart web apps that help your business run smoother, faster, and smarter.", imageUrl: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
  howItWorks: [
    { title: "Tell us your needs", description: "Describe your business process and what you want to achieve." },
    { title: "We design & build", description: "Our experts craft a custom web application tailored for you." },
    { title: "Launch & manage", description: "Go live and easily manage your operations from anywhere." }
  ],
  whyChooseUs: [
    { title: "Custom-built workflows", description: "Apps designed around your unique business processes." },
    { title: "Cloud-based & secure", description: "Access your app from anywhere with top-tier security." },
    { title: "Scales with you", description: "Our solutions grow as your business grows." },
    { title: "No tech skills needed", description: "We handle all the technical details, so you don't have to." }
  ],
  portfolio: [
    { name: "CRM Dashboard", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
    { name: "Project Manager", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" },
    { name: "Inventory System", image: "https://framerusercontent.com/images/3X5p25sTzE2bH5L3u3Ceo8nZpU.png" },
    { name: "Client Portal", image: "https://framerusercontent.com/images/eOkQd205iAnD0d5wVfLQ216s.png" }
  ],
  pricing: [
    { name: "Starter", price: "PKR 999", features: ["1 Core Workflow", "Up to 5 Users", "Basic Support"], popular: false },
    { name: "Growth", price: "PKR 2499", features: ["Up to 3 Workflows", "Up to 20 Users", "Priority Support", "Integrations"], popular: true },
    { name: "Enterprise", price: "Custom", features: ["Unlimited Workflows", "Unlimited Users", "Dedicated Support", "Advanced Security"], popular: false }
  ],
  testimonials: [
    { name: "Sarah L.", company: "CEO, Innovate Inc.", text: "AppChahiye transformed our operations. What used to take hours now takes minutes. A true game-changer!", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { name: "Mike R.", company: "Founder, Growth Co.", text: "The custom app they built for us is intuitive, fast, and perfectly tailored to our workflow. Highly recommended.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d" }
  ],
  finalCta: {
    headline: "Ready to simplify your business?",
    subheadline: "Let's build the perfect web app to streamline your operations and fuel your growth."
  },
  brandAssets: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#2F80ED",
    secondaryColor: "#5B2EFF"
  },
  seoMetadata: {
    siteTitle: "AppChahiye: Smart Web Apps for Smarter Businesses",
    metaDescription: "We build custom web apps that make business operations simpler, faster, and smarter."
  }
};
var UserEntity = class {
  constructor(env, id) {
    this.env = env;
    this.id = id;
  }
  static async create(env, user) {
    await env.DB.prepare(`
      INSERT INTO users (id, email, name, role, password_hash, avatar_url, notification_prefs)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      user.email,
      user.name,
      user.role,
      user.passwordHash,
      user.avatarUrl ?? null,
      user.notificationPreferences ? JSON.stringify(user.notificationPreferences) : null
    ).run();
    return user;
  }
  static async list(env) {
    const rows = await queryAll(env.DB, "SELECT * FROM users");
    return { items: rows.map(toUser), next: null };
  }
  static async delete(env, id) {
    return await deleteById(env.DB, "users", id);
  }
  async exists() {
    return await existsById(this.env.DB, "users", this.id);
  }
  async getState() {
    const row = await queryFirst(this.env.DB, "SELECT * FROM users WHERE id = ?", [this.id]);
    if (!row) {
      return { id: "", email: "", name: "", role: "client", passwordHash: "" };
    }
    return toUser(row);
  }
  async patch(updates) {
    const dbUpdates = {};
    if (updates.name !== void 0)
      dbUpdates.name = updates.name;
    if (updates.email !== void 0)
      dbUpdates.email = updates.email;
    if (updates.role !== void 0)
      dbUpdates.role = updates.role;
    if (updates.passwordHash !== void 0)
      dbUpdates.password_hash = updates.passwordHash;
    if (updates.avatarUrl !== void 0)
      dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.notificationPreferences !== void 0) {
      dbUpdates.notification_prefs = JSON.stringify(updates.notificationPreferences);
    }
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, "users", this.id, dbUpdates);
    }
  }
};
__publicField(UserEntity, "tableName", "users");
var ClientEntity = class {
  constructor(env, id) {
    this.env = env;
    this.id = id;
  }
  static async create(env, client) {
    await env.DB.prepare(`
      INSERT INTO clients (id, user_id, company, project_type, portal_url, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      client.id,
      client.userId,
      client.company,
      client.projectType,
      client.portalUrl,
      client.status,
      client.createdAt
    ).run();
    return client;
  }
  static async list(env) {
    const rows = await queryAll(env.DB, "SELECT * FROM clients");
    return { items: rows.map(toClient), next: null };
  }
  static async delete(env, id) {
    return await deleteById(env.DB, "clients", id);
  }
  async exists() {
    return await existsById(this.env.DB, "clients", this.id);
  }
  async getState() {
    const row = await queryFirst(this.env.DB, "SELECT * FROM clients WHERE id = ?", [this.id]);
    if (!row) {
      return { id: "", userId: "", company: "", projectType: "", portalUrl: "", status: "pending", createdAt: 0 };
    }
    return toClient(row);
  }
  async patch(updates) {
    const dbUpdates = {};
    if (updates.company !== void 0)
      dbUpdates.company = updates.company;
    if (updates.projectType !== void 0)
      dbUpdates.project_type = updates.projectType;
    if (updates.portalUrl !== void 0)
      dbUpdates.portal_url = updates.portalUrl;
    if (updates.status !== void 0)
      dbUpdates.status = updates.status;
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, "clients", this.id, dbUpdates);
    }
  }
};
__publicField(ClientEntity, "tableName", "clients");
var ProjectEntity = class {
  constructor(env, id) {
    this.env = env;
    this.id = id;
  }
  static async create(env, project) {
    await env.DB.prepare(`
      INSERT INTO projects (id, client_id, title, progress, deadline, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      project.id,
      project.clientId,
      project.title,
      project.progress,
      project.deadline,
      project.notes,
      project.updatedAt
    ).run();
    return project;
  }
  static async list(env) {
    const rows = await queryAll(env.DB, "SELECT * FROM projects");
    return { items: rows.map(toProject), next: null };
  }
  static async delete(env, id) {
    return await deleteById(env.DB, "projects", id);
  }
  static async deleteMany(env, ids) {
    if (ids.length === 0)
      return 0;
    let count = 0;
    for (const id of ids) {
      if (await deleteById(env.DB, "projects", id))
        count++;
    }
    return count;
  }
  async exists() {
    return await existsById(this.env.DB, "projects", this.id);
  }
  async getState() {
    const row = await queryFirst(this.env.DB, "SELECT * FROM projects WHERE id = ?", [this.id]);
    if (!row) {
      return { id: "", clientId: "", title: "", progress: 0, deadline: null, notes: "", updatedAt: 0 };
    }
    return toProject(row);
  }
  async patch(updates) {
    const dbUpdates = {};
    if (updates.title !== void 0)
      dbUpdates.title = updates.title;
    if (updates.progress !== void 0)
      dbUpdates.progress = updates.progress;
    if (updates.deadline !== void 0)
      dbUpdates.deadline = updates.deadline;
    if (updates.notes !== void 0)
      dbUpdates.notes = updates.notes;
    if (updates.updatedAt !== void 0)
      dbUpdates.updated_at = updates.updatedAt;
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, "projects", this.id, dbUpdates);
    }
  }
};
__publicField(ProjectEntity, "tableName", "projects");
var MilestoneEntity = class {
  constructor(env, id) {
    this.env = env;
    this.id = id;
  }
  static async create(env, milestone) {
    await env.DB.prepare(`
      INSERT INTO milestones (id, project_id, title, description, status, due_date, files, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      milestone.id,
      milestone.projectId,
      milestone.title,
      milestone.description,
      milestone.status,
      milestone.dueDate,
      JSON.stringify(milestone.files),
      milestone.updatedAt
    ).run();
    return milestone;
  }
  static async list(env) {
    const rows = await queryAll(env.DB, "SELECT * FROM milestones");
    return { items: rows.map(toMilestone), next: null };
  }
  static async delete(env, id) {
    return await deleteById(env.DB, "milestones", id);
  }
  static async deleteMany(env, ids) {
    if (ids.length === 0)
      return 0;
    let count = 0;
    for (const id of ids) {
      if (await deleteById(env.DB, "milestones", id))
        count++;
    }
    return count;
  }
  async exists() {
    return await existsById(this.env.DB, "milestones", this.id);
  }
  async getState() {
    const row = await queryFirst(this.env.DB, "SELECT * FROM milestones WHERE id = ?", [this.id]);
    if (!row) {
      return { id: "", projectId: "", title: "", description: "", status: "todo", dueDate: null, files: [], updatedAt: 0 };
    }
    return toMilestone(row);
  }
  async patch(updates) {
    const dbUpdates = {};
    if (updates.title !== void 0)
      dbUpdates.title = updates.title;
    if (updates.description !== void 0)
      dbUpdates.description = updates.description;
    if (updates.status !== void 0)
      dbUpdates.status = updates.status;
    if (updates.dueDate !== void 0)
      dbUpdates.due_date = updates.dueDate;
    if (updates.files !== void 0)
      dbUpdates.files = JSON.stringify(updates.files);
    if (updates.updatedAt !== void 0)
      dbUpdates.updated_at = updates.updatedAt;
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, "milestones", this.id, dbUpdates);
    }
  }
};
__publicField(MilestoneEntity, "tableName", "milestones");
var InvoiceEntity = class {
  constructor(env, id) {
    this.env = env;
    this.id = id;
  }
  static async create(env, invoice) {
    await env.DB.prepare(`
      INSERT INTO invoices (id, client_id, amount, status, pdf_url, issued_at, service_ids)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      invoice.id,
      invoice.clientId,
      invoice.amount,
      invoice.status,
      invoice.pdf_url,
      invoice.issuedAt,
      invoice.serviceIds ? JSON.stringify(invoice.serviceIds) : "[]"
    ).run();
    return invoice;
  }
  static async list(env) {
    const rows = await queryAll(env.DB, "SELECT * FROM invoices");
    return { items: rows.map(toInvoice), next: null };
  }
  static async delete(env, id) {
    return await deleteById(env.DB, "invoices", id);
  }
  static async deleteMany(env, ids) {
    if (ids.length === 0)
      return 0;
    let count = 0;
    for (const id of ids) {
      if (await deleteById(env.DB, "invoices", id))
        count++;
    }
    return count;
  }
  async exists() {
    return await existsById(this.env.DB, "invoices", this.id);
  }
  async getState() {
    const row = await queryFirst(this.env.DB, "SELECT * FROM invoices WHERE id = ?", [this.id]);
    if (!row) {
      return { id: "", clientId: "", amount: 0, status: "pending", pdf_url: "", issuedAt: 0 };
    }
    return toInvoice(row);
  }
  async patch(updates) {
    const dbUpdates = {};
    if (updates.amount !== void 0)
      dbUpdates.amount = updates.amount;
    if (updates.status !== void 0)
      dbUpdates.status = updates.status;
    if (updates.pdf_url !== void 0)
      dbUpdates.pdf_url = updates.pdf_url;
    if (updates.serviceIds !== void 0)
      dbUpdates.service_ids = JSON.stringify(updates.serviceIds);
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, "invoices", this.id, dbUpdates);
    }
  }
};
__publicField(InvoiceEntity, "tableName", "invoices");
var MessageEntity = class {
  constructor(env, id) {
    this.env = env;
    this.id = id;
  }
  static async create(env, message) {
    await env.DB.prepare(`
      INSERT INTO messages (id, client_id, sender_id, receiver_id, content, attachments, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      message.id,
      message.clientId,
      message.senderId,
      message.receiverId,
      message.content,
      JSON.stringify(message.attachments),
      message.createdAt
    ).run();
    return message;
  }
  static async list(env) {
    const rows = await queryAll(env.DB, "SELECT * FROM messages ORDER BY created_at ASC");
    return { items: rows.map(toMessage), next: null };
  }
  static async delete(env, id) {
    return await deleteById(env.DB, "messages", id);
  }
  static async deleteMany(env, ids) {
    if (ids.length === 0)
      return 0;
    let count = 0;
    for (const id of ids) {
      if (await deleteById(env.DB, "messages", id))
        count++;
    }
    return count;
  }
  async exists() {
    return await existsById(this.env.DB, "messages", this.id);
  }
  async getState() {
    const row = await queryFirst(this.env.DB, "SELECT * FROM messages WHERE id = ?", [this.id]);
    if (!row) {
      return { id: "", clientId: "", senderId: "", receiverId: "", content: "", attachments: [], createdAt: 0 };
    }
    return toMessage(row);
  }
};
__publicField(MessageEntity, "tableName", "messages");
var FormSubmissionEntity = class {
  constructor(env, id) {
    this.env = env;
    this.id = id;
  }
  static async create(env, submission) {
    await env.DB.prepare(`
      INSERT INTO form_submissions (id, name, email, company, project_description, features, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      submission.id,
      submission.name,
      submission.email,
      submission.company,
      submission.projectDescription,
      submission.features,
      submission.submittedAt
    ).run();
    return submission;
  }
  static async list(env) {
    const rows = await queryAll(env.DB, "SELECT * FROM form_submissions ORDER BY submitted_at DESC");
    return { items: rows.map(toFormSubmission), next: null };
  }
  static async delete(env, id) {
    return await deleteById(env.DB, "form_submissions", id);
  }
  async exists() {
    return await existsById(this.env.DB, "form_submissions", this.id);
  }
  async getState() {
    const row = await queryFirst(this.env.DB, "SELECT * FROM form_submissions WHERE id = ?", [this.id]);
    if (!row) {
      return { id: "", name: "", email: "", company: "", projectDescription: "", features: "", submittedAt: 0 };
    }
    return toFormSubmission(row);
  }
};
__publicField(FormSubmissionEntity, "tableName", "form_submissions");
var ServiceEntity = class {
  constructor(env, id) {
    this.env = env;
    this.id = id;
  }
  static async create(env, service) {
    await env.DB.prepare(`
      INSERT INTO services (id, name, description, type, price)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      service.id,
      service.name,
      service.description,
      service.type,
      service.price
    ).run();
    return service;
  }
  static async list(env) {
    const rows = await queryAll(env.DB, "SELECT * FROM services");
    return { items: rows.map(toService), next: null };
  }
  static async delete(env, id) {
    return await deleteById(env.DB, "services", id);
  }
  async exists() {
    return await existsById(this.env.DB, "services", this.id);
  }
  async getState() {
    const row = await queryFirst(this.env.DB, "SELECT * FROM services WHERE id = ?", [this.id]);
    if (!row) {
      return { id: "", name: "", description: "", type: "one-time", price: 0 };
    }
    return toService(row);
  }
  async patch(updates) {
    const dbUpdates = {};
    if (updates.name !== void 0)
      dbUpdates.name = updates.name;
    if (updates.description !== void 0)
      dbUpdates.description = updates.description;
    if (updates.type !== void 0)
      dbUpdates.type = updates.type;
    if (updates.price !== void 0)
      dbUpdates.price = updates.price;
    if (Object.keys(dbUpdates).length > 0) {
      await updateById(this.env.DB, "services", this.id, dbUpdates);
    }
  }
};
__publicField(ServiceEntity, "tableName", "services");
var _WebsiteContentEntity = class {
  constructor(env, id) {
    this.env = env;
    this.id = id;
  }
  static async ensureExists(env) {
    const row = await queryFirst(env.DB, "SELECT * FROM website_content WHERE id = ?", [this.singletonId]);
    if (!row) {
      await env.DB.prepare(`
        INSERT INTO website_content (id, content) VALUES (?, ?)
      `).bind(this.singletonId, JSON.stringify(MOCK_WEBSITE_CONTENT)).run();
    }
    return new _WebsiteContentEntity(env, this.singletonId);
  }
  async getState() {
    const row = await queryFirst(this.env.DB, "SELECT * FROM website_content WHERE id = ?", [this.id]);
    if (!row)
      return MOCK_WEBSITE_CONTENT;
    return JSON.parse(row.content);
  }
  async save(content) {
    await this.env.DB.prepare(`
      UPDATE website_content SET content = ? WHERE id = ?
    `).bind(JSON.stringify(content), this.id).run();
  }
};
var WebsiteContentEntity = _WebsiteContentEntity;
__publicField(WebsiteContentEntity, "tableName", "website_content");
__publicField(WebsiteContentEntity, "singletonId", "singleton");

// worker/saas-entities.ts
function tenantFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerId: row.owner_id,
    plan: row.plan,
    branding: JSON.parse(row.branding || "{}"),
    settings: JSON.parse(row.settings || "{}"),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function crmAppFromRow(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    businessType: row.business_type,
    config: JSON.parse(row.config || "{}"),
    enabledPillars: JSON.parse(row.enabled_pillars || "[]"),
    branding: JSON.parse(row.branding || "{}"),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function crmUserFromRow(row) {
  return {
    id: row.id,
    appId: row.app_id,
    email: row.email,
    name: row.name,
    role: row.role,
    avatarUrl: row.avatar_url || void 0,
    permissions: JSON.parse(row.permissions || "{}"),
    isActive: Boolean(row.is_active),
    lastLoginAt: row.last_login_at || void 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function moduleFromRow(row) {
  return {
    id: row.id,
    appId: row.app_id,
    pillar: row.pillar,
    systemName: row.system_name,
    displayName: row.display_name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    enabled: Boolean(row.enabled),
    sortOrder: row.sort_order,
    config: JSON.parse(row.config || "{}"),
    createdAt: row.created_at
  };
}
function fieldFromRow(row) {
  return {
    id: row.id,
    moduleId: row.module_id,
    name: row.name,
    label: row.label,
    type: row.type,
    required: Boolean(row.required),
    unique: Boolean(row.unique_field),
    defaultValue: row.default_value || void 0,
    placeholder: row.placeholder || void 0,
    options: JSON.parse(row.options || "{}"),
    validation: JSON.parse(row.validation || "{}"),
    sortOrder: row.sort_order,
    showInList: Boolean(row.show_in_list),
    showInForm: Boolean(row.show_in_form),
    isSystem: Boolean(row.is_system),
    createdAt: row.created_at
  };
}
function recordFromRow(row) {
  return {
    id: row.id,
    appId: row.app_id,
    moduleId: row.module_id,
    data: JSON.parse(row.data || "{}"),
    createdBy: row.created_by || void 0,
    updatedBy: row.updated_by || void 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function viewFromRow(row) {
  return {
    id: row.id,
    moduleId: row.module_id,
    name: row.name,
    type: row.type,
    config: JSON.parse(row.config || "{}"),
    filters: JSON.parse(row.filters || "[]"),
    sort: JSON.parse(row.sort || "[]"),
    columns: JSON.parse(row.columns || "[]"),
    grouping: row.grouping || void 0,
    isDefault: Boolean(row.is_default),
    isShared: Boolean(row.is_shared),
    createdBy: row.created_by || void 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
function activityFromRow(row) {
  return {
    id: row.id,
    recordId: row.record_id,
    type: row.type,
    content: row.content,
    metadata: JSON.parse(row.metadata || "{}"),
    createdBy: row.created_by || void 0,
    createdAt: row.created_at
  };
}
function crmSessionFromRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    expiresAt: row.expires_at,
    createdAt: row.created_at
  };
}
var TenantEntity = {
  async create(env, data) {
    const now = Date.now();
    const row = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      owner_id: data.ownerId,
      plan: data.plan,
      branding: JSON.stringify(data.branding || {}),
      settings: JSON.stringify(data.settings || {}),
      created_at: now,
      updated_at: now
    };
    await insert(env.DB, "tenants", row);
    return tenantFromRow(row);
  },
  async getById(env, id) {
    const row = await queryFirst(env.DB, "SELECT * FROM tenants WHERE id = ?", [id]);
    return row ? tenantFromRow(row) : null;
  },
  async getBySlug(env, slug) {
    const row = await queryFirst(env.DB, "SELECT * FROM tenants WHERE slug = ?", [slug]);
    return row ? tenantFromRow(row) : null;
  },
  async getByOwnerId(env, ownerId) {
    const row = await queryFirst(env.DB, "SELECT * FROM tenants WHERE owner_id = ?", [ownerId]);
    return row ? tenantFromRow(row) : null;
  },
  async list(env, limit = 100, offset = 0) {
    const rows = await queryAll(env.DB, "SELECT * FROM tenants ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]);
    return rows.map(tenantFromRow);
  },
  async update(env, id, data) {
    const updates = { updated_at: Date.now() };
    if (data.name !== void 0)
      updates.name = data.name;
    if (data.plan !== void 0)
      updates.plan = data.plan;
    if (data.branding !== void 0)
      updates.branding = JSON.stringify(data.branding);
    if (data.settings !== void 0)
      updates.settings = JSON.stringify(data.settings);
    return updateById(env.DB, "tenants", id, updates);
  },
  async delete(env, id) {
    return deleteById(env.DB, "tenants", id);
  },
  async count(env) {
    const result = await queryFirst(env.DB, "SELECT COUNT(*) as count FROM tenants", []);
    return result?.count || 0;
  }
};
var CrmAppEntity = {
  async create(env, data) {
    const now = Date.now();
    const row = {
      id: data.id,
      tenant_id: data.tenantId,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      icon: data.icon || "briefcase",
      business_type: data.businessType,
      config: JSON.stringify(data.config || {}),
      enabled_pillars: JSON.stringify(data.enabledPillars || ["people", "work", "money"]),
      branding: JSON.stringify(data.branding || {}),
      is_active: data.isActive ? 1 : 0,
      created_at: now,
      updated_at: now
    };
    await insert(env.DB, "crm_apps", row);
    return crmAppFromRow(row);
  },
  async getById(env, id) {
    const row = await queryFirst(env.DB, "SELECT * FROM crm_apps WHERE id = ?", [id]);
    return row ? crmAppFromRow(row) : null;
  },
  async getByTenantId(env, tenantId) {
    const rows = await queryAll(
      env.DB,
      "SELECT * FROM crm_apps WHERE tenant_id = ? ORDER BY created_at DESC",
      [tenantId]
    );
    return rows.map(crmAppFromRow);
  },
  async getByTenantSlug(env, tenantId, slug) {
    const row = await queryFirst(
      env.DB,
      "SELECT * FROM crm_apps WHERE tenant_id = ? AND slug = ?",
      [tenantId, slug]
    );
    return row ? crmAppFromRow(row) : null;
  },
  async update(env, id, data) {
    const updates = { updated_at: Date.now() };
    if (data.name !== void 0)
      updates.name = data.name;
    if (data.description !== void 0)
      updates.description = data.description;
    if (data.icon !== void 0)
      updates.icon = data.icon;
    if (data.config !== void 0)
      updates.config = JSON.stringify(data.config);
    if (data.enabledPillars !== void 0)
      updates.enabled_pillars = JSON.stringify(data.enabledPillars);
    if (data.branding !== void 0)
      updates.branding = JSON.stringify(data.branding);
    if (data.isActive !== void 0)
      updates.is_active = data.isActive ? 1 : 0;
    return updateById(env.DB, "crm_apps", id, updates);
  },
  async delete(env, id) {
    return deleteById(env.DB, "crm_apps", id);
  },
  async countByTenantId(env, tenantId) {
    const result = await queryFirst(
      env.DB,
      "SELECT COUNT(*) as count FROM crm_apps WHERE tenant_id = ?",
      [tenantId]
    );
    return result?.count || 0;
  }
};
var CrmUserEntity = {
  async create(env, data) {
    const now = Date.now();
    const row = {
      id: data.id,
      app_id: data.appId,
      email: data.email,
      name: data.name,
      password_hash: data.passwordHash,
      role: data.role,
      avatar_url: data.avatarUrl || null,
      permissions: JSON.stringify(data.permissions || {}),
      is_active: data.isActive ? 1 : 0,
      last_login_at: data.lastLoginAt || null,
      created_at: now,
      updated_at: now
    };
    await insert(env.DB, "crm_users", row);
    return crmUserFromRow(row);
  },
  async getById(env, id) {
    const row = await queryFirst(env.DB, "SELECT * FROM crm_users WHERE id = ?", [id]);
    return row ? crmUserFromRow(row) : null;
  },
  async getByEmail(env, appId, email) {
    const row = await queryFirst(
      env.DB,
      "SELECT * FROM crm_users WHERE app_id = ? AND email = ?",
      [appId, email]
    );
    if (!row)
      return null;
    return { user: crmUserFromRow(row), passwordHash: row.password_hash };
  },
  async getByAppId(env, appId) {
    const rows = await queryAll(
      env.DB,
      "SELECT * FROM crm_users WHERE app_id = ? ORDER BY created_at DESC",
      [appId]
    );
    return rows.map(crmUserFromRow);
  },
  async update(env, id, data) {
    const updates = { updated_at: Date.now() };
    if (data.name !== void 0)
      updates.name = data.name;
    if (data.role !== void 0)
      updates.role = data.role;
    if (data.avatarUrl !== void 0)
      updates.avatar_url = data.avatarUrl;
    if (data.permissions !== void 0)
      updates.permissions = JSON.stringify(data.permissions);
    if (data.isActive !== void 0)
      updates.is_active = data.isActive ? 1 : 0;
    if (data.lastLoginAt !== void 0)
      updates.last_login_at = data.lastLoginAt;
    if (data.passwordHash !== void 0)
      updates.password_hash = data.passwordHash;
    return updateById(env.DB, "crm_users", id, updates);
  },
  async delete(env, id) {
    return deleteById(env.DB, "crm_users", id);
  },
  async countByAppId(env, appId) {
    const result = await queryFirst(
      env.DB,
      "SELECT COUNT(*) as count FROM crm_users WHERE app_id = ?",
      [appId]
    );
    return result?.count || 0;
  }
};
var ModuleEntity = {
  async create(env, data) {
    const row = {
      id: data.id,
      app_id: data.appId,
      pillar: data.pillar,
      system_name: data.systemName,
      display_name: data.displayName,
      description: data.description || "",
      icon: data.icon || "folder",
      color: data.color || "#6366f1",
      enabled: data.enabled ? 1 : 0,
      sort_order: data.sortOrder || 0,
      config: JSON.stringify(data.config || {}),
      created_at: Date.now()
    };
    await insert(env.DB, "modules", row);
    return moduleFromRow(row);
  },
  async getById(env, id) {
    const row = await queryFirst(env.DB, "SELECT * FROM modules WHERE id = ?", [id]);
    return row ? moduleFromRow(row) : null;
  },
  async getByAppId(env, appId, enabledOnly = true) {
    const query = enabledOnly ? "SELECT * FROM modules WHERE app_id = ? AND enabled = 1 ORDER BY sort_order ASC" : "SELECT * FROM modules WHERE app_id = ? ORDER BY sort_order ASC";
    const rows = await queryAll(env.DB, query, [appId]);
    return rows.map(moduleFromRow);
  },
  async getByPillar(env, appId, pillar) {
    const rows = await queryAll(
      env.DB,
      "SELECT * FROM modules WHERE app_id = ? AND pillar = ? AND enabled = 1 ORDER BY sort_order ASC",
      [appId, pillar]
    );
    return rows.map(moduleFromRow);
  },
  async update(env, id, data) {
    const updates = {};
    if (data.displayName !== void 0)
      updates.display_name = data.displayName;
    if (data.description !== void 0)
      updates.description = data.description;
    if (data.icon !== void 0)
      updates.icon = data.icon;
    if (data.color !== void 0)
      updates.color = data.color;
    if (data.enabled !== void 0)
      updates.enabled = data.enabled ? 1 : 0;
    if (data.sortOrder !== void 0)
      updates.sort_order = data.sortOrder;
    if (data.config !== void 0)
      updates.config = JSON.stringify(data.config);
    return updateById(env.DB, "modules", id, updates);
  },
  async delete(env, id) {
    return deleteById(env.DB, "modules", id);
  }
};
var FieldEntity = {
  async create(env, data) {
    const row = {
      id: data.id,
      module_id: data.moduleId,
      name: data.name,
      label: data.label,
      type: data.type,
      required: data.required ? 1 : 0,
      unique_field: data.unique ? 1 : 0,
      default_value: data.defaultValue || null,
      placeholder: data.placeholder || null,
      options: JSON.stringify(data.options || {}),
      validation: JSON.stringify(data.validation || {}),
      sort_order: data.sortOrder || 0,
      show_in_list: data.showInList ? 1 : 0,
      show_in_form: data.showInForm !== false ? 1 : 0,
      is_system: data.isSystem ? 1 : 0,
      created_at: Date.now()
    };
    await insert(env.DB, "fields", row);
    return fieldFromRow(row);
  },
  async getById(env, id) {
    const row = await queryFirst(env.DB, "SELECT * FROM fields WHERE id = ?", [id]);
    return row ? fieldFromRow(row) : null;
  },
  async getByModuleId(env, moduleId) {
    const rows = await queryAll(
      env.DB,
      "SELECT * FROM fields WHERE module_id = ? ORDER BY sort_order ASC",
      [moduleId]
    );
    return rows.map(fieldFromRow);
  },
  async update(env, id, data) {
    const updates = {};
    if (data.label !== void 0)
      updates.label = data.label;
    if (data.required !== void 0)
      updates.required = data.required ? 1 : 0;
    if (data.unique !== void 0)
      updates.unique_field = data.unique ? 1 : 0;
    if (data.defaultValue !== void 0)
      updates.default_value = data.defaultValue;
    if (data.placeholder !== void 0)
      updates.placeholder = data.placeholder;
    if (data.options !== void 0)
      updates.options = JSON.stringify(data.options);
    if (data.validation !== void 0)
      updates.validation = JSON.stringify(data.validation);
    if (data.sortOrder !== void 0)
      updates.sort_order = data.sortOrder;
    if (data.showInList !== void 0)
      updates.show_in_list = data.showInList ? 1 : 0;
    if (data.showInForm !== void 0)
      updates.show_in_form = data.showInForm ? 1 : 0;
    return updateById(env.DB, "fields", id, updates);
  },
  async delete(env, id) {
    return deleteById(env.DB, "fields", id);
  }
};
var RecordEntity = {
  async create(env, data) {
    const now = Date.now();
    const row = {
      id: data.id,
      app_id: data.appId,
      module_id: data.moduleId,
      data: JSON.stringify(data.data || {}),
      created_by: data.createdBy || null,
      updated_by: data.updatedBy || null,
      created_at: now,
      updated_at: now
    };
    await insert(env.DB, "records", row);
    return recordFromRow(row);
  },
  async getById(env, id) {
    const row = await queryFirst(env.DB, "SELECT * FROM records WHERE id = ?", [id]);
    return row ? recordFromRow(row) : null;
  },
  async getByModuleId(env, moduleId, limit = 100, offset = 0) {
    const rows = await queryAll(
      env.DB,
      "SELECT * FROM records WHERE module_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [moduleId, limit, offset]
    );
    return rows.map(recordFromRow);
  },
  async getByAppId(env, appId, limit = 100) {
    const rows = await queryAll(
      env.DB,
      "SELECT * FROM records WHERE app_id = ? ORDER BY created_at DESC LIMIT ?",
      [appId, limit]
    );
    return rows.map(recordFromRow);
  },
  async countByModuleId(env, moduleId) {
    const result = await queryFirst(
      env.DB,
      "SELECT COUNT(*) as count FROM records WHERE module_id = ?",
      [moduleId]
    );
    return result?.count || 0;
  },
  async countByAppId(env, appId) {
    const result = await queryFirst(
      env.DB,
      "SELECT COUNT(*) as count FROM records WHERE app_id = ?",
      [appId]
    );
    return result?.count || 0;
  },
  async update(env, id, data, updatedBy) {
    return updateById(env.DB, "records", id, {
      data: JSON.stringify(data),
      updated_by: updatedBy || null,
      updated_at: Date.now()
    });
  },
  async delete(env, id) {
    return deleteById(env.DB, "records", id);
  },
  async search(env, moduleId, searchTerm, limit = 50) {
    const rows = await queryAll(
      env.DB,
      `SELECT * FROM records WHERE module_id = ? AND data LIKE ? ORDER BY created_at DESC LIMIT ?`,
      [moduleId, `%${searchTerm}%`, limit]
    );
    return rows.map(recordFromRow);
  }
};
var ViewEntity = {
  async create(env, data) {
    const now = Date.now();
    const row = {
      id: data.id,
      module_id: data.moduleId,
      name: data.name,
      type: data.type,
      config: JSON.stringify(data.config || {}),
      filters: JSON.stringify(data.filters || []),
      sort: JSON.stringify(data.sort || []),
      columns: JSON.stringify(data.columns || []),
      grouping: data.grouping || null,
      is_default: data.isDefault ? 1 : 0,
      is_shared: data.isShared !== false ? 1 : 0,
      created_by: data.createdBy || null,
      created_at: now,
      updated_at: now
    };
    await insert(env.DB, "views", row);
    return viewFromRow(row);
  },
  async getById(env, id) {
    const row = await queryFirst(env.DB, "SELECT * FROM views WHERE id = ?", [id]);
    return row ? viewFromRow(row) : null;
  },
  async getByModuleId(env, moduleId) {
    const rows = await queryAll(
      env.DB,
      "SELECT * FROM views WHERE module_id = ? ORDER BY is_default DESC, created_at ASC",
      [moduleId]
    );
    return rows.map(viewFromRow);
  },
  async getDefaultView(env, moduleId) {
    const row = await queryFirst(
      env.DB,
      "SELECT * FROM views WHERE module_id = ? AND is_default = 1",
      [moduleId]
    );
    return row ? viewFromRow(row) : null;
  },
  async update(env, id, data) {
    const updates = { updated_at: Date.now() };
    if (data.name !== void 0)
      updates.name = data.name;
    if (data.type !== void 0)
      updates.type = data.type;
    if (data.config !== void 0)
      updates.config = JSON.stringify(data.config);
    if (data.filters !== void 0)
      updates.filters = JSON.stringify(data.filters);
    if (data.sort !== void 0)
      updates.sort = JSON.stringify(data.sort);
    if (data.columns !== void 0)
      updates.columns = JSON.stringify(data.columns);
    if (data.grouping !== void 0)
      updates.grouping = data.grouping;
    if (data.isDefault !== void 0)
      updates.is_default = data.isDefault ? 1 : 0;
    if (data.isShared !== void 0)
      updates.is_shared = data.isShared ? 1 : 0;
    return updateById(env.DB, "views", id, updates);
  },
  async delete(env, id) {
    return deleteById(env.DB, "views", id);
  }
};
var ActivityEntity = {
  async create(env, data) {
    const row = {
      id: data.id,
      record_id: data.recordId,
      type: data.type,
      content: data.content,
      metadata: JSON.stringify(data.metadata || {}),
      created_by: data.createdBy || null,
      created_at: Date.now()
    };
    await insert(env.DB, "activities", row);
    return activityFromRow(row);
  },
  async getByRecordId(env, recordId, limit = 50) {
    const rows = await queryAll(
      env.DB,
      "SELECT * FROM activities WHERE record_id = ? ORDER BY created_at DESC LIMIT ?",
      [recordId, limit]
    );
    return rows.map(activityFromRow);
  },
  async delete(env, id) {
    return deleteById(env.DB, "activities", id);
  }
};
var CrmSessionEntity = {
  async create(env, data) {
    const row = {
      id: data.id,
      user_id: data.userId,
      token: data.token,
      expires_at: data.expiresAt,
      created_at: Date.now()
    };
    await insert(env.DB, "crm_sessions", row);
    return crmSessionFromRow(row);
  },
  async getByToken(env, token) {
    const row = await queryFirst(
      env.DB,
      "SELECT * FROM crm_sessions WHERE token = ? AND expires_at > ?",
      [token, Date.now()]
    );
    return row ? crmSessionFromRow(row) : null;
  },
  async deleteByUserId(env, userId) {
    const result = await env.DB.prepare("DELETE FROM crm_sessions WHERE user_id = ?").bind(userId).run();
    return result.success;
  },
  async deleteExpired(env) {
    const result = await env.DB.prepare("DELETE FROM crm_sessions WHERE expires_at < ?").bind(Date.now()).run();
    return result.meta.changes || 0;
  }
};

// worker/core-utils.ts
import { DurableObject } from "cloudflare:workers";
var GlobalDurableObject = class extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
  }
  /** Delete a key; returns true if it existed. */
  async del(key) {
    const existed = await this.ctx.storage.get(key) !== void 0;
    await this.ctx.storage.delete(key);
    return existed;
  }
  /** Fast existence check. */
  async has(key) {
    return await this.ctx.storage.get(key) !== void 0;
  }
  async getDoc(key) {
    const v = await this.ctx.storage.get(key);
    return v ?? null;
  }
  async casPut(key, expectedV, data) {
    return this.ctx.storage.transaction(async (txn) => {
      const cur = await txn.get(key);
      const curV = cur?.v ?? 0;
      if (curV !== expectedV)
        return { ok: false, v: curV };
      const nextV = curV + 1;
      await txn.put(key, { v: nextV, data });
      return { ok: true, v: nextV };
    });
  }
  async listPrefix(prefix, startAfter, limit) {
    const opts = { prefix };
    if (limit != null)
      opts.limit = limit;
    if (startAfter)
      opts.startAfter = startAfter;
    const m = await this.ctx.storage.list(opts);
    const names = Array.from(m.keys());
    const next = limit != null && names.length === limit ? names[names.length - 1] : null;
    return { keys: names, next };
  }
  async indexAddBatch(items) {
    if (items.length === 0)
      return;
    await this.ctx.storage.transaction(async (txn) => {
      for (const it of items)
        await txn.put("i:" + String(it), 1);
    });
  }
  async indexRemoveBatch(items) {
    if (items.length === 0)
      return 0;
    let removed = 0;
    await this.ctx.storage.transaction(async (txn) => {
      for (const it of items) {
        const k = "i:" + String(it);
        const existed = await txn.get(k) !== void 0;
        await txn.delete(k);
        if (existed)
          removed++;
      }
    });
    return removed;
  }
  async indexDrop(_rootKey) {
    await this.ctx.storage.deleteAll();
  }
};
var ok = (c, data) => c.json({ success: true, data });
var bad = (c, error) => c.json({ success: false, error }, 400);
var notFound = (c, error = "not found") => c.json({ success: false, error }, 404);

// worker/r2-utils.ts
function generateFileKey(folder, id, filename) {
  const ext = filename.split(".").pop()?.toLowerCase() || "bin";
  const timestamp = Date.now();
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  switch (folder) {
    case "avatars":
      return `avatars/${id}.${ext}`;
    case "invoices":
      return `invoices/${id}.pdf`;
    case "milestones":
      return `milestones/${id}/${timestamp}_${safeFilename}`;
    case "content":
      return `content/${timestamp}_${safeFilename}`;
    case "attachments":
      return `attachments/${id}/${timestamp}_${safeFilename}`;
    default:
      return `uploads/${timestamp}_${safeFilename}`;
  }
}
async function uploadFile(env, key, file, contentType, metadata) {
  const fullMetadata = {
    originalName: metadata?.originalName || key.split("/").pop() || "file",
    contentType,
    size: metadata?.size || 0,
    uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
    uploadedBy: metadata?.uploadedBy
  };
  const stringMetadata = {
    originalName: fullMetadata.originalName,
    contentType: fullMetadata.contentType,
    size: String(fullMetadata.size),
    uploadedAt: fullMetadata.uploadedAt,
    ...fullMetadata.uploadedBy && { uploadedBy: fullMetadata.uploadedBy }
  };
  await env.FILES.put(key, file, {
    httpMetadata: {
      contentType
    },
    customMetadata: stringMetadata
  });
  return {
    key,
    url: `/api/files/${key}`
  };
}
async function getFile(env, key) {
  const object = await env.FILES.get(key);
  if (!object) {
    return null;
  }
  const metadata = {
    originalName: object.customMetadata?.originalName || key.split("/").pop() || "file",
    contentType: object.httpMetadata?.contentType || "application/octet-stream",
    size: object.size,
    uploadedAt: object.customMetadata?.uploadedAt || object.uploaded.toISOString(),
    uploadedBy: object.customMetadata?.uploadedBy
  };
  return { object, metadata };
}
async function deleteFile(env, key) {
  try {
    await env.FILES.delete(key);
    return true;
  } catch {
    return false;
  }
}
async function listFiles(env, prefix, limit = 100) {
  const listed = await env.FILES.list({ prefix, limit });
  return {
    keys: listed.objects.map((obj) => obj.key),
    truncated: listed.truncated
  };
}
function getContentType(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes = {
    // Images
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    // Documents
    "pdf": "application/pdf",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Text
    "txt": "text/plain",
    "csv": "text/csv",
    "json": "application/json",
    "xml": "application/xml",
    "html": "text/html",
    "css": "text/css",
    "js": "application/javascript",
    // Archives
    "zip": "application/zip",
    "rar": "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    "tar": "application/x-tar",
    "gz": "application/gzip",
    // Media
    "mp3": "audio/mpeg",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "ogg": "audio/ogg",
    "wav": "audio/wav"
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

// worker/google-auth.ts
var GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
var GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
var GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
var SCOPES = ["openid", "email", "profile"];
function getGoogleAuthUrl(env, redirectUri, state) {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent"
  });
  if (state) {
    params.set("state", state);
  }
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}
async function exchangeCodeForTokens(env, code, redirectUri) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }
  return response.json();
}
async function getGoogleUserInfo(accessToken) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    throw new Error("Failed to get user info from Google");
  }
  return response.json();
}
function getCallbackUrl(request) {
  const url = new URL(request.url);
  return `${url.origin}/api/auth/google/callback`;
}

// worker/crm/pillars.ts
var PILLARS = [
  {
    id: "people",
    name: "People",
    description: "Manage contacts, leads, and companies",
    icon: "users",
    color: "#6366f1",
    defaultModules: [
      {
        systemName: "contacts",
        displayName: "Contacts",
        description: "Individual people you work with",
        icon: "user",
        defaultFields: [
          { name: "name", label: "Name", type: "text", required: true, showInList: true },
          { name: "email", label: "Email", type: "email", showInList: true },
          { name: "phone", label: "Phone", type: "phone", showInList: true },
          { name: "company", label: "Company", type: "text", showInList: true },
          { name: "title", label: "Title", type: "text" },
          { name: "notes", label: "Notes", type: "textarea" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: {
              choices: [
                { value: "active", label: "Active", color: "#22c55e" },
                { value: "inactive", label: "Inactive", color: "#ef4444" }
              ]
            }
          }
        ]
      },
      {
        systemName: "leads",
        displayName: "Leads",
        description: "Potential customers to follow up",
        icon: "target",
        defaultFields: [
          { name: "name", label: "Name", type: "text", required: true, showInList: true },
          { name: "email", label: "Email", type: "email", showInList: true },
          { name: "phone", label: "Phone", type: "phone" },
          {
            name: "source",
            label: "Source",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "website", label: "Website" },
                { value: "referral", label: "Referral" },
                { value: "social", label: "Social Media" },
                { value: "ads", label: "Advertising" },
                { value: "other", label: "Other" }
              ]
            }
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "new", label: "New", color: "#3b82f6" },
                { value: "contacted", label: "Contacted", color: "#f59e0b" },
                { value: "qualified", label: "Qualified", color: "#8b5cf6" },
                { value: "converted", label: "Converted", color: "#22c55e" },
                { value: "lost", label: "Lost", color: "#ef4444" }
              ]
            }
          },
          { name: "notes", label: "Notes", type: "textarea" }
        ]
      },
      {
        systemName: "companies",
        displayName: "Companies",
        description: "Organizations you work with",
        icon: "building",
        defaultFields: [
          { name: "name", label: "Company Name", type: "text", required: true, showInList: true },
          { name: "website", label: "Website", type: "url" },
          { name: "industry", label: "Industry", type: "text", showInList: true },
          { name: "phone", label: "Phone", type: "phone" },
          { name: "email", label: "Email", type: "email" },
          { name: "address", label: "Address", type: "textarea" },
          { name: "notes", label: "Notes", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "work",
    name: "Work",
    description: "Track tasks, projects, and deals",
    icon: "briefcase",
    color: "#8b5cf6",
    defaultModules: [
      {
        systemName: "tasks",
        displayName: "Tasks",
        description: "Action items to complete",
        icon: "check-square",
        defaultFields: [
          { name: "title", label: "Title", type: "text", required: true, showInList: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "due_date", label: "Due Date", type: "date", showInList: true },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "low", label: "Low", color: "#94a3b8" },
                { value: "medium", label: "Medium", color: "#f59e0b" },
                { value: "high", label: "High", color: "#ef4444" }
              ]
            }
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "todo", label: "To Do", color: "#94a3b8" },
                { value: "in_progress", label: "In Progress", color: "#3b82f6" },
                { value: "done", label: "Done", color: "#22c55e" }
              ]
            }
          }
        ]
      },
      {
        systemName: "projects",
        displayName: "Projects",
        description: "Larger initiatives with multiple tasks",
        icon: "folder",
        defaultFields: [
          { name: "name", label: "Project Name", type: "text", required: true, showInList: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "start_date", label: "Start Date", type: "date" },
          { name: "end_date", label: "End Date", type: "date", showInList: true },
          { name: "budget", label: "Budget", type: "currency" },
          {
            name: "status",
            label: "Status",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "planning", label: "Planning", color: "#94a3b8" },
                { value: "active", label: "Active", color: "#3b82f6" },
                { value: "on_hold", label: "On Hold", color: "#f59e0b" },
                { value: "completed", label: "Completed", color: "#22c55e" },
                { value: "cancelled", label: "Cancelled", color: "#ef4444" }
              ]
            }
          }
        ]
      },
      {
        systemName: "deals",
        displayName: "Deals",
        description: "Sales opportunities to track",
        icon: "dollar-sign",
        defaultFields: [
          { name: "name", label: "Deal Name", type: "text", required: true, showInList: true },
          { name: "value", label: "Value", type: "currency", showInList: true },
          { name: "probability", label: "Probability %", type: "number", options: { min: 0, max: 100 } },
          { name: "expected_close", label: "Expected Close", type: "date", showInList: true },
          {
            name: "stage",
            label: "Stage",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "discovery", label: "Discovery", color: "#94a3b8" },
                { value: "proposal", label: "Proposal", color: "#3b82f6" },
                { value: "negotiation", label: "Negotiation", color: "#f59e0b" },
                { value: "won", label: "Won", color: "#22c55e" },
                { value: "lost", label: "Lost", color: "#ef4444" }
              ]
            }
          },
          { name: "notes", label: "Notes", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "money",
    name: "Money",
    description: "Track invoices, payments, and expenses",
    icon: "credit-card",
    color: "#22c55e",
    defaultModules: [
      {
        systemName: "invoices",
        displayName: "Invoices",
        description: "Bills to send to clients",
        icon: "file-text",
        defaultFields: [
          { name: "invoice_number", label: "Invoice #", type: "text", required: true, showInList: true },
          { name: "client_name", label: "Client", type: "text", required: true, showInList: true },
          { name: "amount", label: "Amount", type: "currency", required: true, showInList: true },
          { name: "issue_date", label: "Issue Date", type: "date", showInList: true },
          { name: "due_date", label: "Due Date", type: "date", showInList: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "draft", label: "Draft", color: "#94a3b8" },
                { value: "sent", label: "Sent", color: "#3b82f6" },
                { value: "paid", label: "Paid", color: "#22c55e" },
                { value: "overdue", label: "Overdue", color: "#ef4444" }
              ]
            }
          },
          { name: "notes", label: "Notes", type: "textarea" }
        ]
      },
      {
        systemName: "payments",
        displayName: "Payments",
        description: "Payments received",
        icon: "dollar-sign",
        defaultFields: [
          { name: "description", label: "Description", type: "text", required: true, showInList: true },
          { name: "amount", label: "Amount", type: "currency", required: true, showInList: true },
          { name: "date", label: "Date", type: "date", showInList: true },
          {
            name: "method",
            label: "Payment Method",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "cash", label: "Cash" },
                { value: "card", label: "Card" },
                { value: "bank", label: "Bank Transfer" },
                { value: "other", label: "Other" }
              ]
            }
          }
        ]
      },
      {
        systemName: "expenses",
        displayName: "Expenses",
        description: "Track business expenses",
        icon: "trending-down",
        defaultFields: [
          { name: "description", label: "Description", type: "text", required: true, showInList: true },
          { name: "amount", label: "Amount", type: "currency", required: true, showInList: true },
          { name: "date", label: "Date", type: "date", showInList: true },
          {
            name: "category",
            label: "Category",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "supplies", label: "Supplies" },
                { value: "travel", label: "Travel" },
                { value: "utilities", label: "Utilities" },
                { value: "equipment", label: "Equipment" },
                { value: "other", label: "Other" }
              ]
            }
          },
          { name: "receipt", label: "Receipt", type: "file" }
        ]
      }
    ]
  },
  {
    id: "stock",
    name: "Stock",
    description: "Manage products and inventory",
    icon: "package",
    color: "#f59e0b",
    defaultModules: [
      {
        systemName: "products",
        displayName: "Products",
        description: "Items you sell",
        icon: "box",
        defaultFields: [
          { name: "name", label: "Product Name", type: "text", required: true, showInList: true },
          { name: "sku", label: "SKU", type: "text", showInList: true },
          { name: "price", label: "Price", type: "currency", required: true, showInList: true },
          { name: "cost", label: "Cost", type: "currency" },
          { name: "quantity", label: "Quantity", type: "number", showInList: true },
          { name: "category", label: "Category", type: "text", showInList: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "image", label: "Image", type: "image" }
        ]
      },
      {
        systemName: "inventory",
        displayName: "Inventory",
        description: "Stock levels and movements",
        icon: "layers",
        defaultFields: [
          { name: "product_name", label: "Product", type: "text", required: true, showInList: true },
          {
            name: "type",
            label: "Type",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "in", label: "Stock In", color: "#22c55e" },
                { value: "out", label: "Stock Out", color: "#ef4444" },
                { value: "adjustment", label: "Adjustment", color: "#f59e0b" }
              ]
            }
          },
          { name: "quantity", label: "Quantity", type: "number", required: true, showInList: true },
          { name: "date", label: "Date", type: "date", showInList: true },
          { name: "notes", label: "Notes", type: "textarea" }
        ]
      },
      {
        systemName: "orders",
        displayName: "Orders",
        description: "Customer orders",
        icon: "shopping-cart",
        defaultFields: [
          { name: "order_number", label: "Order #", type: "text", required: true, showInList: true },
          { name: "customer_name", label: "Customer", type: "text", required: true, showInList: true },
          { name: "total", label: "Total", type: "currency", showInList: true },
          { name: "date", label: "Date", type: "date", showInList: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "pending", label: "Pending", color: "#f59e0b" },
                { value: "processing", label: "Processing", color: "#3b82f6" },
                { value: "shipped", label: "Shipped", color: "#8b5cf6" },
                { value: "delivered", label: "Delivered", color: "#22c55e" },
                { value: "cancelled", label: "Cancelled", color: "#ef4444" }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: "time",
    name: "Time",
    description: "Schedule appointments and track time",
    icon: "clock",
    color: "#ec4899",
    defaultModules: [
      {
        systemName: "appointments",
        displayName: "Appointments",
        description: "Scheduled meetings and events",
        icon: "calendar",
        defaultFields: [
          { name: "title", label: "Title", type: "text", required: true, showInList: true },
          { name: "date", label: "Date", type: "date", required: true, showInList: true },
          { name: "time", label: "Time", type: "text", showInList: true },
          { name: "duration", label: "Duration (min)", type: "number" },
          { name: "location", label: "Location", type: "text" },
          { name: "attendee", label: "Attendee", type: "text", showInList: true },
          { name: "notes", label: "Notes", type: "textarea" },
          {
            name: "status",
            label: "Status",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "scheduled", label: "Scheduled", color: "#3b82f6" },
                { value: "completed", label: "Completed", color: "#22c55e" },
                { value: "cancelled", label: "Cancelled", color: "#ef4444" },
                { value: "no_show", label: "No Show", color: "#f59e0b" }
              ]
            }
          }
        ]
      },
      {
        systemName: "timesheet",
        displayName: "Timesheet",
        description: "Track time worked",
        icon: "clock",
        defaultFields: [
          { name: "description", label: "Description", type: "text", required: true, showInList: true },
          { name: "date", label: "Date", type: "date", required: true, showInList: true },
          { name: "hours", label: "Hours", type: "number", required: true, showInList: true },
          { name: "project", label: "Project", type: "text", showInList: true },
          { name: "billable", label: "Billable", type: "checkbox" }
        ]
      }
    ]
  },
  {
    id: "places",
    name: "Places",
    description: "Manage locations and addresses",
    icon: "map-pin",
    color: "#06b6d4",
    defaultModules: [
      {
        systemName: "locations",
        displayName: "Locations",
        description: "Physical locations",
        icon: "map-pin",
        defaultFields: [
          { name: "name", label: "Location Name", type: "text", required: true, showInList: true },
          {
            name: "type",
            label: "Type",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "office", label: "Office" },
                { value: "warehouse", label: "Warehouse" },
                { value: "store", label: "Store" },
                { value: "other", label: "Other" }
              ]
            }
          },
          { name: "address", label: "Address", type: "textarea", showInList: true },
          { name: "phone", label: "Phone", type: "phone" },
          { name: "notes", label: "Notes", type: "textarea" }
        ]
      }
    ]
  },
  {
    id: "files",
    name: "Files",
    description: "Store and organize documents",
    icon: "file",
    color: "#64748b",
    defaultModules: [
      {
        systemName: "documents",
        displayName: "Documents",
        description: "Important files and documents",
        icon: "file-text",
        defaultFields: [
          { name: "name", label: "Document Name", type: "text", required: true, showInList: true },
          {
            name: "type",
            label: "Type",
            type: "select",
            showInList: true,
            options: {
              choices: [
                { value: "contract", label: "Contract" },
                { value: "proposal", label: "Proposal" },
                { value: "report", label: "Report" },
                { value: "invoice", label: "Invoice" },
                { value: "other", label: "Other" }
              ]
            }
          },
          { name: "file", label: "File", type: "file", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "date", label: "Date", type: "date", showInList: true }
        ]
      }
    ]
  },
  {
    id: "talk",
    name: "Talk",
    description: "Communication and messaging",
    icon: "message-circle",
    color: "#a855f7",
    defaultModules: [
      {
        systemName: "notes",
        displayName: "Notes",
        description: "Quick notes and memos",
        icon: "file-text",
        defaultFields: [
          { name: "title", label: "Title", type: "text", required: true, showInList: true },
          { name: "content", label: "Content", type: "textarea", required: true },
          { name: "date", label: "Date", type: "date", showInList: true },
          { name: "tags", label: "Tags", type: "text", showInList: true }
        ]
      }
    ]
  },
  {
    id: "reports",
    name: "Reports",
    description: "Analytics and insights",
    icon: "bar-chart-2",
    color: "#0ea5e9",
    defaultModules: []
    // Reports are generated, not record-based
  },
  {
    id: "settings",
    name: "Settings",
    description: "CRM configuration",
    icon: "settings",
    color: "#78716c",
    defaultModules: []
    // Settings are handled separately
  }
];
function getPillarById(pillarId) {
  return PILLARS.find((p) => p.id === pillarId);
}
function getDefaultPillars() {
  return ["people", "work", "money"];
}

// worker/crm/generator.ts
var BUSINESS_PRESETS = [
  {
    id: "retail",
    name: "Retail / E-commerce",
    description: "Sell products to customers",
    icon: "shopping-cart",
    pillars: ["people", "stock", "money", "work"],
    moduleRenames: {
      "contacts": "Customers",
      "products": "Inventory"
    }
  },
  {
    id: "services",
    name: "Services / Agency",
    description: "Provide services to clients",
    icon: "briefcase",
    pillars: ["people", "work", "money", "time"],
    moduleRenames: {
      "contacts": "Clients",
      "tasks": "Jobs",
      "projects": "Cases"
    }
  },
  {
    id: "clinic",
    name: "Clinic / Healthcare",
    description: "Medical practice management",
    icon: "heart",
    pillars: ["people", "time", "money", "files"],
    moduleRenames: {
      "contacts": "Patients",
      "appointments": "Appointments",
      "documents": "Records"
    }
  },
  {
    id: "education",
    name: "Education / Training",
    description: "Manage students and courses",
    icon: "book",
    pillars: ["people", "work", "time", "money"],
    moduleRenames: {
      "contacts": "Students",
      "projects": "Courses",
      "tasks": "Assignments"
    }
  },
  {
    id: "realestate",
    name: "Real Estate",
    description: "Property and client management",
    icon: "home",
    pillars: ["people", "places", "money", "files"],
    moduleRenames: {
      "contacts": "Clients",
      "locations": "Properties"
    }
  },
  {
    id: "hospitality",
    name: "Hospitality / Restaurant",
    description: "Hotels, restaurants, cafes",
    icon: "coffee",
    pillars: ["people", "stock", "money", "time"],
    moduleRenames: {
      "contacts": "Guests",
      "products": "Menu Items",
      "orders": "Reservations"
    }
  },
  {
    id: "custom",
    name: "Custom / Other",
    description: "Build your own CRM",
    icon: "settings",
    pillars: ["people", "work", "money"],
    moduleRenames: {}
  }
];
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 50);
}
async function createCrmFromWizard(env, tenantId, wizardData) {
  const appId = crypto.randomUUID();
  const slug = generateSlug(wizardData.name);
  const preset = BUSINESS_PRESETS.find((p) => p.id === wizardData.businessType);
  const enabledPillars = wizardData.customPillars || preset?.pillars || getDefaultPillars();
  const app2 = await CrmAppEntity.create(env, {
    id: appId,
    tenantId,
    name: wizardData.name,
    slug,
    description: `CRM for ${wizardData.businessName || wizardData.name}`,
    icon: preset?.icon || "briefcase",
    businessType: wizardData.businessType,
    config: {
      moduleRenames: preset?.moduleRenames || {}
    },
    enabledPillars,
    branding: {
      primaryColor: wizardData.primaryColor || "#6366f1",
      logoUrl: wizardData.logoUrl
    },
    isActive: true
  });
  const modules = [];
  let sortOrder = 0;
  for (const pillarId of enabledPillars) {
    const pillarDef = getPillarById(pillarId);
    if (!pillarDef)
      continue;
    for (const moduleDef of pillarDef.defaultModules) {
      const moduleId = crypto.randomUUID();
      const displayName = preset?.moduleRenames[moduleDef.systemName] || moduleDef.displayName;
      const module = await ModuleEntity.create(env, {
        id: moduleId,
        appId,
        pillar: pillarId,
        systemName: moduleDef.systemName,
        displayName,
        description: moduleDef.description,
        icon: moduleDef.icon,
        color: pillarDef.color,
        enabled: true,
        sortOrder: sortOrder++,
        config: {
          allowCreate: true,
          allowEdit: true,
          allowDelete: true,
          allowExport: true
        }
      });
      modules.push(module);
      let fieldOrder = 0;
      for (const fieldDef of moduleDef.defaultFields) {
        await FieldEntity.create(env, {
          id: crypto.randomUUID(),
          moduleId,
          name: fieldDef.name,
          label: fieldDef.label,
          type: fieldDef.type,
          required: fieldDef.required || false,
          unique: false,
          placeholder: fieldDef.placeholder,
          options: fieldDef.options || {},
          validation: {},
          sortOrder: fieldOrder++,
          showInList: fieldDef.showInList !== false,
          showInForm: true,
          isSystem: false
        });
      }
      await ViewEntity.create(env, {
        id: crypto.randomUUID(),
        moduleId,
        name: "All " + displayName,
        type: "table",
        config: { pageSize: 25 },
        filters: [],
        sort: [{ field: "created_at", direction: "desc" }],
        columns: moduleDef.defaultFields.filter((f) => f.showInList !== false).map((f) => f.name),
        isDefault: true,
        isShared: true
      });
      const hasStatusField = moduleDef.defaultFields.some((f) => f.name === "status");
      if (hasStatusField) {
        await ViewEntity.create(env, {
          id: crypto.randomUUID(),
          moduleId,
          name: displayName + " Board",
          type: "kanban",
          config: { kanbanField: "status" },
          filters: [],
          sort: [],
          columns: [],
          isDefault: false,
          isShared: true
        });
      }
    }
  }
  return { app: app2, modules };
}
function previewCrmStructure(businessType) {
  const preset = BUSINESS_PRESETS.find((p) => p.id === businessType);
  const pillarIds = preset?.pillars || getDefaultPillars();
  const pillars = pillarIds.map((pillarId) => {
    const pillarDef = getPillarById(pillarId);
    if (!pillarDef)
      return null;
    return {
      id: pillarId,
      name: pillarDef.name,
      color: pillarDef.color,
      modules: pillarDef.defaultModules.map((m) => ({
        systemName: m.systemName,
        displayName: preset?.moduleRenames[m.systemName] || m.displayName,
        icon: m.icon
      }))
    };
  }).filter(Boolean);
  return { pillars };
}

// worker/saas-routes.ts
function registerSaasRoutes(app2) {
  app2.get("/api/saas/my-tenant", async (c) => {
    const userId = c.req.query("userId");
    if (!userId) {
      return bad(c, "userId is required");
    }
    let tenant = await TenantEntity.getByOwnerId(c.env, userId);
    if (!tenant) {
      const slug = `tenant-${userId.substring(0, 8)}`;
      tenant = await TenantEntity.create(c.env, {
        id: crypto.randomUUID(),
        name: "My Workspace",
        slug,
        ownerId: userId,
        plan: "free",
        branding: {},
        settings: {}
      });
    }
    return ok(c, { tenant });
  });
  app2.get("/api/saas/tenants", async (c) => {
    const tenants = await TenantEntity.list(c.env);
    return ok(c, { tenants });
  });
  app2.get("/api/saas/tenants/by-owner/:ownerId", async (c) => {
    const { ownerId } = c.req.param();
    const tenant = await TenantEntity.getByOwnerId(c.env, ownerId);
    if (!tenant) {
      return notFound(c, "Tenant not found for this owner");
    }
    return ok(c, { tenant });
  });
  app2.get("/api/saas/tenants/:tenantId", async (c) => {
    const { tenantId } = c.req.param();
    const tenant = await TenantEntity.getById(c.env, tenantId);
    if (!tenant) {
      return notFound(c, "Tenant not found");
    }
    return ok(c, tenant);
  });
  app2.put("/api/saas/tenants/:tenantId", async (c) => {
    const { tenantId } = c.req.param();
    const body = await c.req.json();
    const success = await TenantEntity.update(c.env, tenantId, body);
    if (!success) {
      return notFound(c, "Tenant not found");
    }
    const updated = await TenantEntity.getById(c.env, tenantId);
    return ok(c, updated);
  });
  app2.get("/api/saas/presets", async (c) => {
    return ok(c, { presets: BUSINESS_PRESETS });
  });
  app2.get("/api/saas/pillars", async (c) => {
    return ok(c, { pillars: PILLARS.map((p) => ({ id: p.id, name: p.name, description: p.description, icon: p.icon, color: p.color })) });
  });
  app2.get("/api/saas/preview/:businessType", async (c) => {
    const { businessType } = c.req.param();
    const preview = previewCrmStructure(businessType);
    return ok(c, preview);
  });
  app2.get("/api/saas/tenants/:tenantId/apps", async (c) => {
    const { tenantId } = c.req.param();
    const apps = await CrmAppEntity.getByTenantId(c.env, tenantId);
    return ok(c, { apps });
  });
  app2.post("/api/saas/tenants/:tenantId/apps", async (c) => {
    const { tenantId } = c.req.param();
    const tenant = await TenantEntity.getById(c.env, tenantId);
    if (!tenant) {
      return notFound(c, "Tenant not found");
    }
    const wizardData = await c.req.json();
    if (!wizardData.businessType || !wizardData.name) {
      return bad(c, "businessType and name are required");
    }
    try {
      const result = await createCrmFromWizard(c.env, tenantId, wizardData);
      return ok(c, result);
    } catch (error) {
      console.error("CRM creation failed:", error);
      return bad(c, "Failed to create CRM");
    }
  });
  app2.get("/api/saas/apps/:appId", async (c) => {
    const { appId } = c.req.param();
    const app3 = await CrmAppEntity.getById(c.env, appId);
    if (!app3) {
      return notFound(c, "App not found");
    }
    const modules = await ModuleEntity.getByAppId(c.env, appId);
    return ok(c, { app: app3, modules });
  });
  app2.put("/api/saas/apps/:appId", async (c) => {
    const { appId } = c.req.param();
    const body = await c.req.json();
    const success = await CrmAppEntity.update(c.env, appId, body);
    if (!success) {
      return notFound(c, "App not found");
    }
    const updated = await CrmAppEntity.getById(c.env, appId);
    return ok(c, updated);
  });
  app2.delete("/api/saas/apps/:appId", async (c) => {
    const { appId } = c.req.param();
    const success = await CrmAppEntity.delete(c.env, appId);
    if (!success) {
      return notFound(c, "App not found");
    }
    return ok(c, { deleted: true });
  });
  app2.get("/api/saas/apps/:appId/modules", async (c) => {
    const { appId } = c.req.param();
    const modules = await ModuleEntity.getByAppId(c.env, appId);
    return ok(c, { modules });
  });
  app2.get("/api/saas/modules/:moduleId", async (c) => {
    const { moduleId } = c.req.param();
    const module = await ModuleEntity.getById(c.env, moduleId);
    if (!module) {
      return notFound(c, "Module not found");
    }
    const fields = await FieldEntity.getByModuleId(c.env, moduleId);
    const views = await ViewEntity.getByModuleId(c.env, moduleId);
    return ok(c, { module, fields, views });
  });
  app2.put("/api/saas/modules/:moduleId", async (c) => {
    const { moduleId } = c.req.param();
    const body = await c.req.json();
    const success = await ModuleEntity.update(c.env, moduleId, body);
    if (!success) {
      return notFound(c, "Module not found");
    }
    const updated = await ModuleEntity.getById(c.env, moduleId);
    return ok(c, updated);
  });
  app2.get("/api/saas/modules/:moduleId/fields", async (c) => {
    const { moduleId } = c.req.param();
    const fields = await FieldEntity.getByModuleId(c.env, moduleId);
    return ok(c, { fields });
  });
  app2.post("/api/saas/modules/:moduleId/fields", async (c) => {
    const { moduleId } = c.req.param();
    const body = await c.req.json();
    if (!body.name || !body.label || !body.type) {
      return bad(c, "name, label, and type are required");
    }
    const fields = await FieldEntity.getByModuleId(c.env, moduleId);
    const maxOrder = fields.reduce((max, f) => Math.max(max, f.sortOrder), 0);
    const field = await FieldEntity.create(c.env, {
      id: crypto.randomUUID(),
      moduleId,
      name: body.name,
      label: body.label,
      type: body.type,
      required: body.required || false,
      unique: false,
      placeholder: body.placeholder,
      options: body.options || {},
      validation: {},
      sortOrder: maxOrder + 1,
      showInList: true,
      showInForm: true,
      isSystem: false
    });
    return ok(c, field);
  });
  app2.put("/api/saas/fields/:fieldId", async (c) => {
    const { fieldId } = c.req.param();
    const body = await c.req.json();
    const success = await FieldEntity.update(c.env, fieldId, body);
    return ok(c, { success });
  });
  app2.delete("/api/saas/fields/:fieldId", async (c) => {
    const { fieldId } = c.req.param();
    const success = await FieldEntity.delete(c.env, fieldId);
    return ok(c, { deleted: success });
  });
  app2.get("/api/saas/modules/:moduleId/records", async (c) => {
    const { moduleId } = c.req.param();
    const limit = parseInt(c.req.query("limit") || "100");
    const offset = parseInt(c.req.query("offset") || "0");
    const records = await RecordEntity.getByModuleId(c.env, moduleId, limit, offset);
    const total = await RecordEntity.countByModuleId(c.env, moduleId);
    return ok(c, { records, total, limit, offset });
  });
  app2.get("/api/saas/records/:recordId", async (c) => {
    const { recordId } = c.req.param();
    const record = await RecordEntity.getById(c.env, recordId);
    if (!record) {
      return notFound(c, "Record not found");
    }
    const activities = await ActivityEntity.getByRecordId(c.env, recordId);
    return ok(c, { record, activities });
  });
  app2.post("/api/saas/modules/:moduleId/records", async (c) => {
    const { moduleId } = c.req.param();
    const body = await c.req.json();
    const module = await ModuleEntity.getById(c.env, moduleId);
    if (!module) {
      return notFound(c, "Module not found");
    }
    const record = await RecordEntity.create(c.env, {
      id: crypto.randomUUID(),
      appId: module.appId,
      moduleId,
      data: body.data || {},
      createdBy: body.createdBy,
      updatedBy: body.createdBy
    });
    return ok(c, record);
  });
  app2.put("/api/saas/records/:recordId", async (c) => {
    const { recordId } = c.req.param();
    const body = await c.req.json();
    const existing = await RecordEntity.getById(c.env, recordId);
    if (!existing) {
      return notFound(c, "Record not found");
    }
    const newData = { ...existing.data, ...body.data };
    const success = await RecordEntity.update(c.env, recordId, newData, body.updatedBy);
    if (success) {
      const updated = await RecordEntity.getById(c.env, recordId);
      return ok(c, updated);
    }
    return bad(c, "Failed to update record");
  });
  app2.delete("/api/saas/records/:recordId", async (c) => {
    const { recordId } = c.req.param();
    const success = await RecordEntity.delete(c.env, recordId);
    return ok(c, { deleted: success });
  });
  app2.post("/api/saas/records/:recordId/activities", async (c) => {
    const { recordId } = c.req.param();
    const body = await c.req.json();
    if (!body.type || !body.content) {
      return bad(c, "type and content are required");
    }
    const activity = await ActivityEntity.create(c.env, {
      id: crypto.randomUUID(),
      recordId,
      type: body.type,
      content: body.content,
      metadata: {},
      createdBy: body.createdBy
    });
    return ok(c, activity);
  });
  app2.get("/api/saas/modules/:moduleId/views", async (c) => {
    const { moduleId } = c.req.param();
    const views = await ViewEntity.getByModuleId(c.env, moduleId);
    return ok(c, { views });
  });
  app2.post("/api/saas/modules/:moduleId/views", async (c) => {
    const { moduleId } = c.req.param();
    const body = await c.req.json();
    if (!body.name || !body.type) {
      return bad(c, "name and type are required");
    }
    const view = await ViewEntity.create(c.env, {
      id: crypto.randomUUID(),
      moduleId,
      name: body.name,
      type: body.type,
      config: body.config || {},
      filters: [],
      sort: [],
      columns: body.columns || [],
      isDefault: false,
      isShared: true
    });
    return ok(c, view);
  });
  app2.put("/api/saas/views/:viewId", async (c) => {
    const { viewId } = c.req.param();
    const body = await c.req.json();
    const success = await ViewEntity.update(c.env, viewId, body);
    return ok(c, { success });
  });
  app2.delete("/api/saas/views/:viewId", async (c) => {
    const { viewId } = c.req.param();
    const success = await ViewEntity.delete(c.env, viewId);
    return ok(c, { deleted: success });
  });
  app2.get("/api/saas/tenants/:tenantId/stats", async (c) => {
    const { tenantId } = c.req.param();
    const apps = await CrmAppEntity.getByTenantId(c.env, tenantId);
    let totalRecords = 0;
    let totalCrmUsers = 0;
    for (const app3 of apps) {
      totalRecords += await RecordEntity.countByAppId(c.env, app3.id);
      totalCrmUsers += await CrmUserEntity.countByAppId(c.env, app3.id);
    }
    const tenant = await TenantEntity.getById(c.env, tenantId);
    return ok(c, {
      totalApps: apps.length,
      totalRecords,
      totalCrmUsers,
      plan: tenant?.plan || "free",
      apps: apps.slice(0, 5)
      // Recent 5 apps
    });
  });
  app2.get("/api/saas/apps/:appId/stats", async (c) => {
    const { appId } = c.req.param();
    const modules = await ModuleEntity.getByAppId(c.env, appId);
    const moduleStats = await Promise.all(
      modules.map(async (m) => ({
        moduleId: m.id,
        moduleName: m.displayName,
        recordCount: await RecordEntity.countByModuleId(c.env, m.id)
      }))
    );
    const totalRecords = moduleStats.reduce((sum, s) => sum + s.recordCount, 0);
    const totalUsers = await CrmUserEntity.countByAppId(c.env, appId);
    const recentRecords = await RecordEntity.getByAppId(c.env, appId, 10);
    return ok(c, {
      totalRecords,
      totalUsers,
      moduleStats,
      recentRecords
    });
  });
}

// shared/saas-types.ts
var DEFAULT_ROLE_PERMISSIONS = {
  owner: {
    canCreateRecords: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canManageUsers: true,
    canManageSettings: true
  },
  admin: {
    canCreateRecords: true,
    canEditRecords: true,
    canDeleteRecords: true,
    canManageUsers: true,
    canManageSettings: false
  },
  member: {
    canCreateRecords: true,
    canEditRecords: true,
    canDeleteRecords: false,
    canManageUsers: false,
    canManageSettings: false
  },
  viewer: {
    canCreateRecords: false,
    canEditRecords: false,
    canDeleteRecords: false,
    canManageUsers: false,
    canManageSettings: false
  }
};

// worker/crm-auth-routes.ts
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "crm-salt-v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function verifyPassword(password, hash) {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}
var TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1e3;
function registerCrmAuthRoutes(app2) {
  app2.post("/api/crm/:appId/auth/login", async (c) => {
    const { appId } = c.req.param();
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return bad(c, "Email and password are required");
    }
    const result = await CrmUserEntity.getByEmail(c.env, appId, email);
    if (!result) {
      return bad(c, "Invalid email or password");
    }
    const { user, passwordHash } = result;
    const isValid = await verifyPassword(password, passwordHash);
    if (!isValid) {
      return bad(c, "Invalid email or password");
    }
    if (!user.isActive) {
      return bad(c, "Account is deactivated");
    }
    const token = generateToken();
    const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
    await CrmSessionEntity.create(c.env, {
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      expiresAt
    });
    await CrmUserEntity.update(c.env, user.id, { lastLoginAt: Date.now() });
    return ok(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        permissions: user.permissions
      },
      token,
      expiresAt
    });
  });
  app2.post("/api/crm/:appId/auth/logout", async (c) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token) {
      const session = await CrmSessionEntity.getByToken(c.env, token);
      if (session) {
        await CrmSessionEntity.deleteByUserId(c.env, session.userId);
      }
    }
    return ok(c, { success: true });
  });
  app2.get("/api/crm/:appId/auth/me", async (c) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return c.json({ success: false, error: "No token provided" }, 401);
    }
    const session = await CrmSessionEntity.getByToken(c.env, token);
    if (!session) {
      return c.json({ success: false, error: "Invalid or expired token" }, 401);
    }
    const user = await CrmUserEntity.getById(c.env, session.userId);
    if (!user || !user.isActive) {
      return c.json({ success: false, error: "User not found or inactive" }, 401);
    }
    return ok(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        permissions: user.permissions
      }
    });
  });
  app2.post("/api/crm/:appId/auth/setup", async (c) => {
    const { appId } = c.req.param();
    const { email, password, name } = await c.req.json();
    if (!email || !password || !name) {
      return bad(c, "Email, password, and name are required");
    }
    if (password.length < 6) {
      return bad(c, "Password must be at least 6 characters");
    }
    const app3 = await CrmAppEntity.getById(c.env, appId);
    if (!app3) {
      return notFound(c, "CRM not found");
    }
    const existingUsers = await CrmUserEntity.getByAppId(c.env, appId);
    if (existingUsers.length > 0) {
      return bad(c, "CRM already has users. Use invite to add more.");
    }
    const passwordHash = await hashPassword(password);
    const user = await CrmUserEntity.create(c.env, {
      id: crypto.randomUUID(),
      appId,
      email,
      name,
      passwordHash,
      role: "owner",
      permissions: DEFAULT_ROLE_PERMISSIONS.owner,
      isActive: true
    });
    const token = generateToken();
    const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
    await CrmSessionEntity.create(c.env, {
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      expiresAt
    });
    return ok(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      expiresAt
    });
  });
  app2.post("/api/crm/:appId/users/invite", async (c) => {
    const { appId } = c.req.param();
    const { email, name, role, password } = await c.req.json();
    if (!email || !name || !password) {
      return bad(c, "Email, name, and password are required");
    }
    const existing = await CrmUserEntity.getByEmail(c.env, appId, email);
    if (existing) {
      return bad(c, "User with this email already exists");
    }
    const passwordHash = await hashPassword(password);
    const user = await CrmUserEntity.create(c.env, {
      id: crypto.randomUUID(),
      appId,
      email,
      name,
      passwordHash,
      role: role || "member",
      permissions: DEFAULT_ROLE_PERMISSIONS[role || "member"],
      isActive: true
    });
    return ok(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  });
  app2.get("/api/crm/:appId/users", async (c) => {
    const { appId } = c.req.param();
    const users = await CrmUserEntity.getByAppId(c.env, appId);
    return ok(c, {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatarUrl,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt
      }))
    });
  });
  app2.put("/api/crm/:appId/users/:userId", async (c) => {
    const { userId } = c.req.param();
    const body = await c.req.json();
    const updates = {};
    if (body.name !== void 0)
      updates.name = body.name;
    if (body.role !== void 0) {
      updates.role = body.role;
      updates.permissions = DEFAULT_ROLE_PERMISSIONS[body.role];
    }
    if (body.isActive !== void 0)
      updates.isActive = body.isActive;
    const success = await CrmUserEntity.update(c.env, userId, updates);
    if (!success) {
      return notFound(c, "User not found");
    }
    const updated = await CrmUserEntity.getById(c.env, userId);
    return ok(c, { user: updated });
  });
  app2.delete("/api/crm/:appId/users/:userId", async (c) => {
    const { userId } = c.req.param();
    await CrmSessionEntity.deleteByUserId(c.env, userId);
    const success = await CrmUserEntity.delete(c.env, userId);
    return ok(c, { deleted: success });
  });
  app2.post("/api/crm/:appId/auth/change-password", async (c) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return c.json({ success: false, error: "No token provided" }, 401);
    }
    const session = await CrmSessionEntity.getByToken(c.env, token);
    if (!session) {
      return c.json({ success: false, error: "Invalid token" }, 401);
    }
    const { currentPassword, newPassword } = await c.req.json();
    if (!currentPassword || !newPassword) {
      return bad(c, "Current and new password are required");
    }
    if (newPassword.length < 6) {
      return bad(c, "New password must be at least 6 characters");
    }
    const user = await CrmUserEntity.getById(c.env, session.userId);
    if (!user) {
      return notFound(c, "User not found");
    }
    const userWithPassword = await CrmUserEntity.getByEmail(c.env, user.appId, user.email);
    if (!userWithPassword) {
      return notFound(c, "User not found");
    }
    const isValid = await verifyPassword(currentPassword, userWithPassword.passwordHash);
    if (!isValid) {
      return bad(c, "Current password is incorrect");
    }
    const newHash = await hashPassword(newPassword);
    await CrmUserEntity.update(c.env, user.id, { passwordHash: newHash });
    return ok(c, { success: true });
  });
}

// worker/migration-routes.ts
function registerMigrationRoutes(app2) {
  app2.post("/api/admin/migrate-clients", async (c) => {
    let dryRun = false;
    let businessType = "services";
    try {
      const body = await c.req.json();
      dryRun = body.dryRun ?? false;
      businessType = body.businessType ?? "services";
    } catch {
    }
    const results = [];
    try {
      const { items: clients } = await ClientEntity.list(c.env);
      for (const client of clients) {
        try {
          const existingTenant = await TenantEntity.getByOwnerId(c.env, client.id);
          if (existingTenant) {
            results.push({
              clientId: client.id,
              clientCompany: client.company,
              tenantId: existingTenant.id,
              success: true,
              error: "Already migrated"
            });
            continue;
          }
          if (dryRun) {
            results.push({
              clientId: client.id,
              clientCompany: client.company,
              tenantId: "DRY_RUN",
              success: true
            });
            continue;
          }
          const tenantId = crypto.randomUUID();
          const slug = client.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 50) || `tenant-${Date.now()}`;
          const tenant = await TenantEntity.create(c.env, {
            id: tenantId,
            name: client.company || "My Workspace",
            slug,
            ownerId: client.id,
            plan: "free",
            branding: {},
            settings: {
              timezone: "Asia/Karachi",
              currency: "PKR"
            }
          });
          const wizardData = {
            businessType,
            businessName: client.company || "My Business",
            name: `${client.company || "My"} CRM`,
            primaryColor: "#6366f1"
          };
          await createCrmFromWizard(
            c.env,
            tenant.id,
            wizardData
          );
          results.push({
            clientId: client.id,
            clientCompany: client.company,
            tenantId: tenant.id,
            success: true
          });
        } catch (err) {
          results.push({
            clientId: client.id,
            clientCompany: client.company,
            tenantId: "",
            success: false,
            error: err instanceof Error ? err.message : "Unknown error"
          });
        }
      }
      const successCount = results.filter((r) => r.success && !r.error?.includes("Already migrated")).length;
      const alreadyMigrated = results.filter((r) => r.error?.includes("Already migrated")).length;
      const failedCount = results.filter((r) => !r.success).length;
      return ok(c, {
        dryRun,
        totalClients: clients.length,
        migrated: successCount,
        alreadyMigrated,
        failed: failedCount,
        results
      });
    } catch (err) {
      console.error("Migration error:", err);
      return bad(c, err instanceof Error ? err.message : "Migration failed");
    }
  });
  app2.get("/api/admin/migration-status", async (c) => {
    try {
      const { items: clients } = await ClientEntity.list(c.env);
      const tenants = await TenantEntity.list(c.env);
      const migratedClients = clients.filter(
        (client) => tenants.some((t) => t.ownerId === client.id)
      );
      return ok(c, {
        totalClients: clients.length,
        migratedClients: migratedClients.length,
        pendingClients: clients.length - migratedClients.length,
        totalTenants: tenants.length,
        clients: clients.map((client) => ({
          id: client.id,
          company: client.company,
          status: client.status,
          migrated: tenants.some((t) => t.ownerId === client.id),
          tenantId: tenants.find((t) => t.ownerId === client.id)?.id
        }))
      });
    } catch (err) {
      console.error("Migration status error:", err);
      return bad(c, "Failed to get migration status");
    }
  });
  app2.post("/api/admin/migrate-client/:clientId", async (c) => {
    const { clientId } = c.req.param();
    let businessType = "services";
    try {
      const body = await c.req.json();
      businessType = body.businessType ?? "services";
    } catch {
    }
    try {
      const clientEntity = new ClientEntity(c.env, clientId);
      const client = await clientEntity.getState();
      if (!client.id) {
        return bad(c, "Client not found");
      }
      const existingTenant = await TenantEntity.getByOwnerId(c.env, clientId);
      if (existingTenant) {
        return ok(c, {
          success: true,
          alreadyMigrated: true,
          tenant: existingTenant
        });
      }
      const tenantId = crypto.randomUUID();
      const slug = client.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 50) || `tenant-${Date.now()}`;
      const tenant = await TenantEntity.create(c.env, {
        id: tenantId,
        name: client.company || "My Workspace",
        slug,
        ownerId: clientId,
        plan: "free",
        branding: {},
        settings: {
          timezone: "Asia/Karachi",
          currency: "PKR"
        }
      });
      const wizardData = {
        businessType,
        businessName: client.company || "My Business",
        name: `${client.company || "My"} CRM`,
        primaryColor: "#6366f1"
      };
      const { app: crmApp, modules } = await createCrmFromWizard(
        c.env,
        tenant.id,
        wizardData
      );
      return ok(c, {
        success: true,
        alreadyMigrated: false,
        tenant,
        crmApp,
        modulesCreated: modules.length
      });
    } catch (err) {
      console.error("Single migration error:", err);
      return bad(c, err instanceof Error ? err.message : "Migration failed");
    }
  });
}

// worker/user-routes.ts
var mockHash = async (password) => `hashed_${password}`;
var generatePassword = (length = 10) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01223456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
function userRoutes(app2) {
  app2.post("/api/admin/login", async (c) => {
    const { email, password } = await c.req.json();
    if (email === "appchahiye@gmail.com" && password === "Eiahta@840") {
      const adminId = "admin-user-01";
      const adminUserEntity = new UserEntity(c.env, adminId);
      if (!await adminUserEntity.exists()) {
        await UserEntity.create(c.env, {
          id: adminId,
          email: "appchahiye@gmail.com",
          name: "Admin User",
          role: "admin",
          passwordHash: await mockHash("Eiahta@840")
        });
      }
      const userState = await adminUserEntity.getState();
      const user = {
        id: adminId,
        email: "appchahiye@gmail.com",
        name: "Admin User",
        role: "admin",
        avatarUrl: userState.avatarUrl
      };
      const response = {
        user,
        token: "mock-jwt-token-for-appchahiye-admin"
      };
      return ok(c, response);
    }
    return bad(c, "Invalid credentials");
  });
  app2.post("/api/clients/register", async (c) => {
    const { name, email, company, projectType } = await c.req.json();
    if (!name || !email || !company || !projectType) {
      return bad(c, "Missing required fields");
    }
    const { items: users } = await UserEntity.list(c.env);
    if (users.some((u) => u.email === email)) {
      return bad(c, "A user with this email already exists.");
    }
    try {
      const userId = crypto.randomUUID();
      const password_plaintext = generatePassword();
      const passwordHash = await mockHash(password_plaintext);
      const newUser = {
        id: userId,
        name,
        email,
        role: "client",
        passwordHash,
        avatarUrl: `https://i.pravatar.cc/150?u=${userId}`,
        notificationPreferences: {
          projectUpdates: true,
          newMessages: true
        }
      };
      await UserEntity.create(c.env, newUser);
      const newClient = {
        id: userId,
        // Client ID is the same as User ID for simplicity
        userId,
        company,
        projectType,
        portalUrl: "/portal/:clientId",
        status: "pending",
        createdAt: Date.now()
      };
      await ClientEntity.create(c.env, newClient);
      const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 50) || `workspace-${Date.now()}`;
      await TenantEntity.create(c.env, {
        id: crypto.randomUUID(),
        name: company || "My Workspace",
        slug: `${slug}-${userId.substring(0, 6)}`,
        ownerId: userId,
        plan: "free",
        branding: {},
        settings: {
          timezone: "Asia/Karachi",
          currency: "PKR"
        }
      });
      const response = {
        client: newClient,
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
        password_plaintext
      };
      return ok(c, response);
    } catch (error) {
      console.error("Registration failed:", error);
      return bad(c, "An error occurred during registration.");
    }
  });
  app2.post("/api/clients/login", async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return bad(c, "Email and password are required");
    }
    const { items: users } = await UserEntity.list(c.env);
    const user = users.find((u) => u.email === email);
    if (!user) {
      return bad(c, "User not found");
    }
    const passwordHash = await mockHash(password);
    if (user.passwordHash !== passwordHash) {
      return bad(c, "Invalid credentials");
    }
    if (user.role !== "client") {
      return bad(c, "Access denied");
    }
    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl
      },
      token: `mock-jwt-token-for-client-${user.id}`
    };
    return ok(c, response);
  });
  app2.get("/api/admin/clients", async (c) => {
    const { items: clients } = await ClientEntity.list(c.env);
    const { items: users } = await UserEntity.list(c.env);
    const usersById = new Map(users.map((u) => [u.id, u]));
    const clientsWithUsers = clients.map((client) => ({
      ...client,
      user: usersById.get(client.userId)
    }));
    return ok(c, clientsWithUsers);
  });
  app2.put("/api/admin/clients/:clientId/status", async (c) => {
    const { clientId } = c.req.param();
    const { status } = await c.req.json();
    if (!status || !["pending", "active", "completed"].includes(status)) {
      return bad(c, "Invalid status provided.");
    }
    const clientEntity = new ClientEntity(c.env, clientId);
    if (!await clientEntity.exists()) {
      return notFound(c, "Client not found.");
    }
    await clientEntity.patch({ status });
    return ok(c, { message: "Client status updated successfully." });
  });
  app2.get("/api/admin/clients/:clientId/projects", async (c) => {
    const { clientId } = c.req.param();
    const { items: allProjects } = await ProjectEntity.list(c.env);
    const clientProjects = allProjects.filter((p) => p.clientId === clientId);
    return ok(c, clientProjects);
  });
  app2.post("/api/admin/clients/:clientId/projects", async (c) => {
    const { clientId } = c.req.param();
    const { title } = await c.req.json();
    if (!title)
      return bad(c, "Title is required");
    const newProject = {
      id: crypto.randomUUID(),
      clientId,
      title,
      progress: 0,
      deadline: null,
      notes: "",
      updatedAt: Date.now()
    };
    await ProjectEntity.create(c.env, newProject);
    return ok(c, newProject);
  });
  app2.put("/api/admin/projects/:projectId", async (c) => {
    const { projectId } = c.req.param();
    const updates = await c.req.json();
    const projectEntity = new ProjectEntity(c.env, projectId);
    if (!await projectEntity.exists())
      return notFound(c);
    await projectEntity.patch({ ...updates, updatedAt: Date.now() });
    return ok(c, await projectEntity.getState());
  });
  app2.post("/api/admin/projects/:projectId/milestones", async (c) => {
    const { projectId } = c.req.param();
    const { title, description } = await c.req.json();
    if (!title)
      return bad(c, "Title is required");
    const newMilestone = {
      id: crypto.randomUUID(),
      projectId,
      title,
      description,
      status: "todo",
      dueDate: null,
      files: [],
      updatedAt: Date.now()
    };
    await MilestoneEntity.create(c.env, newMilestone);
    return ok(c, newMilestone);
  });
  app2.put("/api/admin/milestones/:milestoneId", async (c) => {
    const { milestoneId } = c.req.param();
    const updates = await c.req.json();
    const milestoneEntity = new MilestoneEntity(c.env, milestoneId);
    if (!await milestoneEntity.exists())
      return notFound(c);
    await milestoneEntity.patch({ ...updates, updatedAt: Date.now() });
    return ok(c, await milestoneEntity.getState());
  });
  app2.get("/api/admin/services", async (c) => {
    const { items: services } = await ServiceEntity.list(c.env);
    return ok(c, services);
  });
  app2.post("/api/admin/services", async (c) => {
    const { name, description, type, price } = await c.req.json();
    if (!name || !type || price == null)
      return bad(c, "Missing required fields");
    const newService = {
      id: crypto.randomUUID(),
      name,
      description,
      type,
      price
    };
    await ServiceEntity.create(c.env, newService);
    return ok(c, newService);
  });
  app2.put("/api/admin/services/:serviceId", async (c) => {
    const { serviceId } = c.req.param();
    const updates = await c.req.json();
    const serviceEntity = new ServiceEntity(c.env, serviceId);
    if (!await serviceEntity.exists())
      return notFound(c);
    await serviceEntity.patch(updates);
    return ok(c, await serviceEntity.getState());
  });
  app2.delete("/api/admin/services/:serviceId", async (c) => {
    const { serviceId } = c.req.param();
    const deleted = await ServiceEntity.delete(c.env, serviceId);
    if (!deleted)
      return notFound(c, "Service not found");
    return ok(c, { message: "Service deleted" });
  });
  app2.get("/api/admin/invoices", async (c) => {
    const { items: invoices } = await InvoiceEntity.list(c.env);
    const { items: clients } = await ClientEntity.list(c.env);
    const { items: users } = await UserEntity.list(c.env);
    const { items: services } = await ServiceEntity.list(c.env);
    const clientsById = new Map(clients.map((cl) => [cl.id, cl]));
    const usersById = new Map(users.map((u) => [u.id, u]));
    const servicesById = new Map(services.map((s) => [s.id, s]));
    const invoicesWithClientInfo = invoices.map((inv) => {
      const client = clientsById.get(inv.clientId);
      const user = client ? usersById.get(client.userId) : void 0;
      const invoiceServices = inv.serviceIds ? inv.serviceIds.map((id) => servicesById.get(id)).filter((s) => s !== void 0) : [];
      return {
        ...inv,
        clientName: user?.name || "N/A",
        clientCompany: client?.company || "N/A",
        services: invoiceServices
      };
    });
    return ok(c, invoicesWithClientInfo);
  });
  app2.post("/api/admin/clients/:clientId/invoices", async (c) => {
    const { clientId } = c.req.param();
    const { serviceIds } = await c.req.json();
    if (!serviceIds || serviceIds.length === 0) {
      return bad(c, "At least one service must be selected.");
    }
    const { items: allServices } = await ServiceEntity.list(c.env);
    const servicesById = new Map(allServices.map((s) => [s.id, s]));
    let amount = 0;
    for (const id of serviceIds) {
      const service = servicesById.get(id);
      if (!service)
        return bad(c, `Service with ID ${id} not found.`);
      amount += service.price;
    }
    if (amount < 0)
      return bad(c, "Total amount cannot be negative.");
    const newInvoice = {
      id: crypto.randomUUID(),
      clientId,
      amount,
      status: "pending",
      pdf_url: `/mock-invoice-${crypto.randomUUID()}.pdf`,
      issuedAt: Date.now(),
      serviceIds
    };
    await InvoiceEntity.create(c.env, newInvoice);
    return ok(c, newInvoice);
  });
  app2.put("/api/admin/invoices/:invoiceId", async (c) => {
    const { invoiceId } = c.req.param();
    const { status } = await c.req.json();
    if (!status || !["pending", "paid"].includes(status))
      return bad(c, "Invalid status");
    const invoiceEntity = new InvoiceEntity(c.env, invoiceId);
    if (!await invoiceEntity.exists())
      return notFound(c);
    await invoiceEntity.patch({ status });
    return ok(c, await invoiceEntity.getState());
  });
  app2.get("/api/chat/:clientId", async (c) => {
    const { clientId } = c.req.param();
    const { items: allMessages } = await MessageEntity.list(c.env);
    const conversationMessages = allMessages.filter((m) => m.clientId === clientId);
    const { items: allUsers } = await UserEntity.list(c.env);
    const usersById = new Map(allUsers.map((u) => [u.id, u]));
    const adminId = "admin-user-01";
    if (!usersById.has(adminId)) {
      const admin = { id: adminId, email: "appchahiye@gmail.com", name: "Admin User", role: "admin", passwordHash: "" };
      await UserEntity.create(c.env, admin);
      usersById.set(admin.id, admin);
    }
    const messagesWithSender = conversationMessages.map((msg) => {
      const sender = usersById.get(msg.senderId);
      return {
        ...msg,
        sender: {
          name: sender?.name || "Unknown",
          role: sender?.role || "client"
        }
      };
    }).sort((a, b) => a.createdAt - b.createdAt);
    return ok(c, messagesWithSender);
  });
  app2.post("/api/chat/:clientId", async (c) => {
    const { clientId } = c.req.param();
    const { senderId, content } = await c.req.json();
    if (!senderId || !content)
      return bad(c, "Sender and content are required");
    const clientEntity = new ClientEntity(c.env, clientId);
    if (!await clientEntity.exists())
      return notFound(c, "Client not found");
    const { items: allUsers } = await UserEntity.list(c.env);
    const adminUser = allUsers.find((u) => u.role === "admin");
    if (!adminUser)
      return bad(c, "Admin user not configured");
    const sender = allUsers.find((u) => u.id === senderId);
    if (!sender)
      return notFound(c, "Sender not found");
    const receiverId = sender.role === "admin" ? clientId : adminUser.id;
    const newMessage = {
      id: crypto.randomUUID(),
      clientId,
      senderId,
      receiverId,
      content,
      attachments: [],
      createdAt: Date.now()
    };
    await MessageEntity.create(c.env, newMessage);
    return ok(c, newMessage);
  });
  app2.get("/api/portal/:clientId/projects", async (c) => {
    const { clientId } = c.req.param();
    const { items: allProjects } = await ProjectEntity.list(c.env);
    const { items: allMilestones } = await MilestoneEntity.list(c.env);
    const clientProjects = allProjects.filter((p) => p.clientId === clientId);
    const projectsWithMilestones = clientProjects.map((project) => ({
      ...project,
      milestones: allMilestones.filter((m) => m.projectId === project.id).sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
    }));
    return ok(c, projectsWithMilestones);
  });
  app2.get("/api/portal/:clientId/invoices", async (c) => {
    const { clientId } = c.req.param();
    const { items: allInvoices } = await InvoiceEntity.list(c.env);
    const clientInvoices = allInvoices.filter((inv) => inv.clientId === clientId);
    const { items: allServices } = await ServiceEntity.list(c.env);
    const servicesById = new Map(allServices.map((s) => [s.id, s]));
    const invoicesWithServices = clientInvoices.map((inv) => {
      const invoiceServices = inv.serviceIds ? inv.serviceIds.map((id) => servicesById.get(id)).filter((s) => s !== void 0) : [];
      return { ...inv, services: invoiceServices };
    });
    return ok(c, invoicesWithServices);
  });
  app2.get("/api/portal/:clientId/services", async (c) => {
    const { items: services } = await ServiceEntity.list(c.env);
    return ok(c, services);
  });
  app2.get("/api/portal/:clientId/account", async (c) => {
    const { clientId } = c.req.param();
    const userEntity = new UserEntity(c.env, clientId);
    const clientEntity = new ClientEntity(c.env, clientId);
    if (!await userEntity.exists() || !await clientEntity.exists()) {
      return notFound(c, "Client account not found");
    }
    const user = await userEntity.getState();
    const client = await clientEntity.getState();
    const profile = {
      name: user.name,
      email: user.email,
      company: client.company,
      avatarUrl: user.avatarUrl
    };
    return ok(c, profile);
  });
  app2.put("/api/portal/:clientId/account", async (c) => {
    const { clientId } = c.req.param();
    const { name, company, avatarUrl } = await c.req.json();
    if (!name || !company)
      return bad(c, "Name and company are required");
    const userEntity = new UserEntity(c.env, clientId);
    const clientEntity = new ClientEntity(c.env, clientId);
    if (!await userEntity.exists() || !await clientEntity.exists()) {
      return notFound(c, "Client account not found");
    }
    await userEntity.patch({ name, avatarUrl });
    await clientEntity.patch({ company });
    return ok(c, { message: "Profile updated successfully" });
  });
  app2.post("/api/portal/:clientId/change-password", async (c) => {
    const { clientId } = c.req.param();
    const { currentPassword, newPassword } = await c.req.json();
    if (!currentPassword || !newPassword)
      return bad(c, "All password fields are required");
    const userEntity = new UserEntity(c.env, clientId);
    if (!await userEntity.exists())
      return notFound(c, "User not found");
    const user = await userEntity.getState();
    const currentPasswordHash = await mockHash(currentPassword);
    if (user.passwordHash !== currentPasswordHash) {
      return bad(c, "Current password does not match");
    }
    const newPasswordHash = await mockHash(newPassword);
    await userEntity.patch({ passwordHash: newPasswordHash });
    return ok(c, { message: "Password changed successfully" });
  });
  app2.get("/api/portal/:clientId/notifications", async (c) => {
    const { clientId } = c.req.param();
    const userEntity = new UserEntity(c.env, clientId);
    if (!await userEntity.exists()) {
      return notFound(c, "User not found");
    }
    const user = await userEntity.getState();
    return ok(c, user.notificationPreferences || { projectUpdates: true, newMessages: true });
  });
  app2.put("/api/portal/:clientId/notifications", async (c) => {
    const { clientId } = c.req.param();
    const prefs = await c.req.json();
    const userEntity = new UserEntity(c.env, clientId);
    if (!await userEntity.exists()) {
      return notFound(c, "User not found");
    }
    await userEntity.patch({ notificationPreferences: prefs });
    return ok(c, { message: "Preferences updated." });
  });
  app2.get("/api/content", async (c) => {
    const contentEntity = await WebsiteContentEntity.ensureExists(c.env);
    const content = await contentEntity.getState();
    return ok(c, content);
  });
  app2.put("/api/content", async (c) => {
    const contentEntity = await WebsiteContentEntity.ensureExists(c.env);
    const newContent = await c.req.json();
    console.log("Received content for update:", newContent);
    if (!newContent) {
      return bad(c, "Invalid content data");
    }
    await contentEntity.save(newContent);
    console.log("Content saved successfully.");
    return ok(c, { message: "Content updated successfully" });
  });
  app2.post("/api/forms/submit", async (c) => {
    const body = await c.req.json();
    if (!body.name || !body.email || !body.projectDescription) {
      return bad(c, "Missing required fields");
    }
    try {
      const newSubmission = {
        id: crypto.randomUUID(),
        ...body,
        submittedAt: Date.now()
      };
      await FormSubmissionEntity.create(c.env, newSubmission);
      return ok(c, { message: "Form submitted successfully!" });
    } catch (error) {
      console.error("Form submission failed:", error);
      return bad(c, "An error occurred during submission.");
    }
  });
  app2.get("/api/admin/forms", async (c) => {
    const { items } = await FormSubmissionEntity.list(c.env);
    items.sort((a, b) => b.submittedAt - a.submittedAt);
    return ok(c, items);
  });
  app2.get("/api/admin/dashboard-stats", async (c) => {
    const { items: clients } = await ClientEntity.list(c.env);
    const { items: projects } = await ProjectEntity.list(c.env);
    const totalLeads = clients.length;
    const activeClients = clients.filter((cl) => cl.status === "active").length;
    const projectsInProgress = projects.filter((p) => p.progress < 100).length;
    const conversionRate = totalLeads > 0 ? activeClients / totalLeads * 100 : 0;
    const stats = {
      totalLeads,
      activeClients,
      projectsInProgress,
      conversionRate: parseFloat(conversionRate.toFixed(1))
    };
    return ok(c, stats);
  });
  app2.get("/api/admin/analytics-data", async (c) => {
    const { items: clients } = await ClientEntity.list(c.env);
    const { items: projects } = await ProjectEntity.list(c.env);
    const leadsPerMonth = {};
    const sixMonthsAgo = /* @__PURE__ */ new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthKey = d.toLocaleString("default", { month: "short" });
      leadsPerMonth[monthKey] = 0;
    }
    clients.forEach((client) => {
      const clientDate = new Date(client.createdAt);
      if (clientDate >= sixMonthsAgo) {
        const monthKey = clientDate.toLocaleString("default", { month: "short" });
        if (leadsPerMonth[monthKey] !== void 0) {
          leadsPerMonth[monthKey]++;
        }
      }
    });
    const clientsById = new Map(clients.map((cl) => [cl.id, cl]));
    const completedProjects = projects.filter((p) => p.progress === 100);
    const projectCompletionTimes = completedProjects.slice(0, 10).map((p) => {
      const client = clientsById.get(p.clientId);
      const startTime = client ? client.createdAt : p.updatedAt;
      const endTime = p.updatedAt;
      const timeDiff = endTime - startTime;
      const days = Math.max(1, Math.round(timeDiff / (1e3 * 60 * 60 * 24)));
      return { name: p.title.substring(0, 10) + "...", time: days };
    });
    const data = {
      leadsPerMonth: Object.entries(leadsPerMonth).map(([name, leads]) => ({ name, leads })),
      projectCompletionTimes
    };
    return ok(c, data);
  });
  app2.get("/api/portal/:clientId/activity", async (c) => {
    const { clientId } = c.req.param();
    const { items: allProjects } = await ProjectEntity.list(c.env);
    const { items: allMilestones } = await MilestoneEntity.list(c.env);
    const clientProjects = allProjects.filter((p) => p.clientId === clientId);
    const clientProjectIds = new Set(clientProjects.map((p) => p.id));
    const clientMilestones = allMilestones.filter((m) => clientProjectIds.has(m.projectId));
    const activity = [];
    clientProjects.forEach((p) => {
      activity.push({
        id: `p-${p.id}`,
        type: "project_created",
        text: `Project "${p.title}" was created.`,
        timestamp: p.updatedAt
        // Assuming creation time is last update for simplicity
      });
    });
    clientMilestones.forEach((m) => {
      activity.push({
        id: `m-${m.id}`,
        type: "milestone_updated",
        text: `Milestone "${m.title}" was updated to "${m.status.replace("_", " ")}".`,
        timestamp: m.updatedAt
      });
    });
    activity.sort((a, b) => b.timestamp - a.timestamp);
    return ok(c, activity.slice(0, 10));
  });
  app2.delete("/api/admin/invoices/:invoiceId", async (c) => {
    const { invoiceId } = c.req.param();
    const deleted = await InvoiceEntity.delete(c.env, invoiceId);
    if (!deleted)
      return notFound(c, "Invoice not found");
    return ok(c, { message: "Invoice deleted" });
  });
  app2.delete("/api/admin/milestones/:milestoneId", async (c) => {
    const { milestoneId } = c.req.param();
    const deleted = await MilestoneEntity.delete(c.env, milestoneId);
    if (!deleted)
      return notFound(c, "Milestone not found");
    return ok(c, { message: "Milestone deleted" });
  });
  app2.delete("/api/admin/projects/:projectId", async (c) => {
    const { projectId } = c.req.param();
    const { items: allMilestones } = await MilestoneEntity.list(c.env);
    const milestonesToDelete = allMilestones.filter((m) => m.projectId === projectId).map((m) => m.id);
    await MilestoneEntity.deleteMany(c.env, milestonesToDelete);
    const deleted = await ProjectEntity.delete(c.env, projectId);
    if (!deleted)
      return notFound(c, "Project not found");
    return ok(c, { message: "Project and its milestones deleted" });
  });
  app2.delete("/api/chat/:clientId", async (c) => {
    const { clientId } = c.req.param();
    const { items: allMessages } = await MessageEntity.list(c.env);
    const messagesToDelete = allMessages.filter((m) => m.clientId === clientId).map((m) => m.id);
    const deletedCount = await MessageEntity.deleteMany(c.env, messagesToDelete);
    return ok(c, { message: `${deletedCount} messages deleted` });
  });
  app2.delete("/api/admin/clients/:clientId", async (c) => {
    const { clientId } = c.req.param();
    const { items: allProjects } = await ProjectEntity.list(c.env);
    const clientProjects = allProjects.filter((p) => p.clientId === clientId);
    const { items: allMilestones } = await MilestoneEntity.list(c.env);
    for (const project of clientProjects) {
      const milestonesToDelete = allMilestones.filter((m) => m.projectId === project.id).map((m) => m.id);
      await MilestoneEntity.deleteMany(c.env, milestonesToDelete);
      await ProjectEntity.delete(c.env, project.id);
    }
    const { items: allInvoices } = await InvoiceEntity.list(c.env);
    const invoicesToDelete = allInvoices.filter((i) => i.clientId === clientId).map((i) => i.id);
    await InvoiceEntity.deleteMany(c.env, invoicesToDelete);
    const { items: allMessages } = await MessageEntity.list(c.env);
    const messagesToDelete = allMessages.filter((m) => m.clientId === clientId).map((m) => m.id);
    await MessageEntity.deleteMany(c.env, messagesToDelete);
    const clientDeleted = await ClientEntity.delete(c.env, clientId);
    await UserEntity.delete(c.env, clientId);
    if (!clientDeleted)
      return notFound(c, "Client not found");
    return ok(c, { message: "Client and all associated data deleted" });
  });
  app2.post("/api/upload", async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file");
      const folder = formData.get("folder") || "content";
      const entityId = formData.get("entityId") || crypto.randomUUID();
      if (!file) {
        return bad(c, "No file provided");
      }
      if (file.size > 10 * 1024 * 1024) {
        return bad(c, "File size exceeds 10MB limit");
      }
      const validFolders = ["avatars", "milestones", "invoices", "content", "attachments"];
      const safeFolder = validFolders.includes(folder) ? folder : "content";
      const key = generateFileKey(safeFolder, entityId, file.name);
      const contentType = file.type || getContentType(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const result = await uploadFile(c.env, key, arrayBuffer, contentType, {
        originalName: file.name,
        size: file.size
      });
      return ok(c, result);
    } catch (error) {
      console.error("Upload failed:", error);
      return bad(c, "File upload failed");
    }
  });
  app2.get("/api/files/*", async (c) => {
    const key = c.req.path.replace("/api/files/", "");
    if (!key) {
      return bad(c, "File key is required");
    }
    const result = await getFile(c.env, key);
    if (!result) {
      return notFound(c, "File not found");
    }
    const headers = new Headers();
    headers.set("Content-Type", result.metadata.contentType);
    headers.set("Content-Length", result.metadata.size.toString());
    headers.set("Cache-Control", "public, max-age=31536000");
    if (!result.metadata.contentType.startsWith("image/")) {
      headers.set("Content-Disposition", `attachment; filename="${result.metadata.originalName}"`);
    }
    return new Response(result.object.body, { headers });
  });
  app2.delete("/api/files/*", async (c) => {
    const key = c.req.path.replace("/api/files/", "");
    if (!key) {
      return bad(c, "File key is required");
    }
    const deleted = await deleteFile(c.env, key);
    if (!deleted) {
      return notFound(c, "File not found or could not be deleted");
    }
    return ok(c, { message: "File deleted successfully" });
  });
  app2.get("/api/files-list/:folder", async (c) => {
    const { folder } = c.req.param();
    const entityId = c.req.query("entityId");
    const prefix = entityId ? `${folder}/${entityId}/` : `${folder}/`;
    const result = await listFiles(c.env, prefix);
    return ok(c, result);
  });
  app2.get("/api/auth/google", async (c) => {
    const callbackUrl = getCallbackUrl(c.req.raw);
    const authUrl = getGoogleAuthUrl(c.env, callbackUrl);
    return c.redirect(authUrl);
  });
  app2.get("/api/auth/google/callback", async (c) => {
    const code = c.req.query("code");
    const error = c.req.query("error");
    if (error) {
      return c.redirect("/?error=google_auth_denied");
    }
    if (!code) {
      return c.redirect("/?error=no_auth_code");
    }
    try {
      const callbackUrl = getCallbackUrl(c.req.raw);
      const tokens = await exchangeCodeForTokens(c.env, code, callbackUrl);
      const googleUser = await getGoogleUserInfo(tokens.access_token);
      const existingUsers = await UserEntity.list(c.env);
      let existingUser = existingUsers.items.find((u) => u.email === googleUser.email);
      let userId;
      let clientId;
      let isNewUser = false;
      if (existingUser) {
        userId = existingUser.id;
        const clients = await ClientEntity.list(c.env);
        const client = clients.items.find((cl) => cl.userId === userId);
        if (client) {
          clientId = client.id;
        } else {
          const newClient = await ClientEntity.create(c.env, {
            id: userId,
            userId,
            company: googleUser.name + "'s Company",
            portalUrl: "/portal/:clientId",
            projectType: "Google OAuth Signup",
            status: "pending",
            createdAt: Date.now()
          });
          clientId = newClient.id;
        }
      } else {
        isNewUser = true;
        userId = crypto.randomUUID();
        clientId = userId;
        await UserEntity.create(c.env, {
          id: userId,
          email: googleUser.email,
          name: googleUser.name,
          role: "client",
          passwordHash: `google_oauth_${googleUser.id}`,
          avatarUrl: googleUser.picture
        });
        await ClientEntity.create(c.env, {
          id: clientId,
          userId,
          company: googleUser.name + "'s Company",
          portalUrl: "/portal/:clientId",
          projectType: "Google OAuth Signup",
          status: "pending",
          createdAt: Date.now()
        });
      }
      const portalUrl = `/portal/${clientId}?auth=google&welcome=${isNewUser ? "true" : "false"}`;
      return c.redirect(portalUrl);
    } catch (err) {
      console.error("Google OAuth error:", err);
      return c.redirect("/?error=google_auth_failed");
    }
  });
  registerSaasRoutes(app2);
  registerCrmAuthRoutes(app2);
  registerMigrationRoutes(app2);
}

// worker/index.ts
var app = new Hono2();
app.use("*", logger());
app.use("/api/*", cors({ origin: "*", allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], allowHeaders: ["Content-Type", "Authorization"] }));
userRoutes(app);
app.get("/api/health", (c) => c.json({ success: true, data: { status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() } }));
app.post("/api/client-errors", async (c) => {
  try {
    const e = await c.req.json();
    if (!e.message)
      return c.json({ success: false, error: "Missing required fields" }, 400);
    console.error("[CLIENT ERROR]", JSON.stringify(e, null, 2));
    return c.json({ success: true });
  } catch (error) {
    console.error("[CLIENT ERROR HANDLER] Failed:", error);
    return c.json({ success: false, error: "Failed to process" }, 500);
  }
});
app.notFound((c) => c.json({ success: false, error: "Not Found" }, 404));
app.onError((err, c) => {
  console.error(`[ERROR] ${err}`);
  return c.json({ success: false, error: "Internal Server Error" }, 500);
});
console.log(`Server is running`);
var worker_default = { fetch: app.fetch };

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
};
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
var jsonError = async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
};
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-3vXiAB/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}

// .wrangler/tmp/bundle-3vXiAB/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  };
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      };
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  GlobalDurableObject,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
