export interface XHRMiddleware {
  (request: Request): Response | null | Promise<Response | null>;
}

/**
 * Creates an XMLHttpRequest proxy class that supports middleware
 * @param BaseXHR The original XMLHttpRequest class
 * @returns The enhanced XMLHttpRequest class
 */
export function createXHRProxy(BaseXHR = globalThis.XMLHttpRequest) {
  return class ProxyXMLHttpRequest extends BaseXHR {
    private static _middlewares: XHRMiddleware[] = [];

    private _isMocked: boolean = false;
    private _requestMethod: string = "GET";
    private _requestUrl: string = "";
    private _requestHeaders: Headers = new Headers();
    private _requestBody: any = null;

    /**
     * Register global middleware
     */
    static use(middleware: XHRMiddleware) {
      this._middlewares.push(middleware);
    }

    /**
     * Clear all middleware
     */
    static clearMiddlewares() {
      this._middlewares = [];
    }

    open(
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null,
    ): void {
      this._requestMethod = method;
      this._requestUrl = url.toString();
      this._requestHeaders = new Headers();
      this._isMocked = false;

      // Call native open
      super.open(
        method,
        url,
        async,
        username ?? undefined,
        password ?? undefined,
      );
    }

    setRequestHeader(name: string, value: string): void {
      this._requestHeaders.append(name, value);

      // If it is not a mock request, also set it on the native XHR
      if (!this._isMocked) {
        super.setRequestHeader(name, value);
      }
    }

    send(body?: Document | XMLHttpRequestBodyInit | null): void {
      this._requestBody = body;

      // Try to run middleware
      this._tryMiddlewares()
        .then((handled) => {
          if (!handled) {
            // No middleware handled it, use native send
            super.send(body);
          }
        })
        .catch((err) => {
          console.error("ProxyXMLHttpRequest middleware error:", err);
          // Fallback to native implementation on error
          super.send(body);
        });
    }

    private async _tryMiddlewares(): Promise<boolean> {
      // Create Request object
      let request: Request;
      try {
        const reqInit: RequestInit = {
          method: this._requestMethod,
          headers: this._requestHeaders,
          body: this._requestBody as BodyInit,
          mode: "cors",
        };

        if (this.withCredentials) {
          reqInit.credentials = "include";
        }

        request = new Request(this._requestUrl, reqInit);
        console.log("ProxyXHR created request:", {
          url: this._requestUrl,
          method: request.method,
          hasBody: !!request.body,
          originalBody: this._requestBody,
        });
      } catch (e) {
        // Unable to create Request, do not use middleware
        return false;
      }

      // Run middleware
      for (const mw of ProxyXMLHttpRequest._middlewares) {
        const response = await mw(request.clone());
        if (response) {
          this._isMocked = true;
          await this._handleMockResponse(response);
          return true;
        }
      }

      return false;
    }

    private async _handleMockResponse(response: Response) {
      // 1. Trigger loadstart
      this.dispatchEvent(new ProgressEvent("loadstart"));

      // 2. HEADERS_RECEIVED (readyState = 2)
      Object.defineProperty(this, "readyState", {
        value: 2,
        writable: false,
        configurable: true,
      });
      this.dispatchEvent(new Event("readystatechange"));

      // 3. LOADING (readyState = 3)
      Object.defineProperty(this, "readyState", {
        value: 3,
        writable: false,
        configurable: true,
      });
      this.dispatchEvent(new Event("readystatechange"));

      try {
        // Read response body
        let responseData: any;

        if (this.responseType === "json") {
          responseData = await response.json();
        } else if (this.responseType === "arraybuffer") {
          responseData = await response.arrayBuffer();
        } else if (this.responseType === "blob") {
          responseData = await response.blob();
        } else if (this.responseType === "document") {
          const text = await response.text();
          responseData = new DOMParser().parseFromString(text, "text/xml");
        } else {
          responseData = await response.text();
        }

        // Set response properties
        Object.defineProperty(this, "status", {
          value: response.status,
          writable: false,
          configurable: true,
        });

        Object.defineProperty(this, "statusText", {
          value: response.statusText,
          writable: false,
          configurable: true,
        });

        Object.defineProperty(this, "response", {
          value: responseData,
          writable: false,
          configurable: true,
        });

        Object.defineProperty(this, "responseText", {
          value:
            typeof responseData === "string"
              ? responseData
              : JSON.stringify(responseData),
          writable: false,
          configurable: true,
        });

        Object.defineProperty(this, "responseURL", {
          value: response.url,
          writable: false,
          configurable: true,
        });

        // 4. Trigger progress event
        this.dispatchEvent(
          new ProgressEvent("progress", {
            lengthComputable: true,
            loaded: 100,
            total: 100,
          }),
        );

        // 5. DONE (readyState = 4)
        Object.defineProperty(this, "readyState", {
          value: 4,
          writable: false,
          configurable: true,
        });
        this.dispatchEvent(new Event("readystatechange"));

        // 6. Trigger load event
        this.dispatchEvent(new ProgressEvent("load"));

        // 7. Trigger loadend event
        this.dispatchEvent(new ProgressEvent("loadend"));
      } catch (e) {
        console.error("ProxyXHR: error handling response", e);

        // Set readyState to DONE
        Object.defineProperty(this, "readyState", {
          value: 4,
          writable: false,
          configurable: true,
        });
        this.dispatchEvent(new Event("readystatechange"));

        // Trigger error event
        this.dispatchEvent(new ProgressEvent("error"));
        this.dispatchEvent(new ProgressEvent("loadend"));
      }
    }
  };
}
