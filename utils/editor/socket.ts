import { EventEmitter } from "eventemitter3";

type Callback = (...args: any[]) => void;

export interface MockSocketOptions {
  /** Enable debug logging. Defaults to true in development mode. */
  debug?: boolean;
}

/**
 * Mock implementation of socket.io-client using mitt for event handling.
 *
 * @template ListenEvents - Events Server -> Client
 * @template EmitEvents - Events Client -> Server
 */
export class MockSocket<
  ListenEvents extends Record<string, Callback> = any,
  EmitEvents extends Record<string, Callback> = any
> {
  private static _staticEmitter = new EventEmitter();
  static on<E extends string>(event: E, listener: Callback) {
    MockSocket._staticEmitter.on(event, listener);
  }
  static off<E extends string>(event: E, listener?: Callback) {
    MockSocket._staticEmitter.off(event, listener);
  }

  public active = true;
  public connected: boolean = false;
  public disconnected: boolean = true;
  public recovered = false;
  public id: string = "";
  public io = {
    setOpenToken: () => {
      /* no-op */
    },
    setSessionToken: () => {
      /* no-op */
    },
    on: () => {
      /* no-op */
    },
    reconnectionAttempts: () => {
      /* no-op */
    },
    reconnectionDelay: () => {
      /* no-op */
    },
    reconnectionDelayMax: () => {
      /* no-op */
    },
    timeout: () => {
      /* no-op */
    },
    transports: () => {
      /* no-op */
    },
    upgrade: () => {
      /* no-op */
    },
    upgradeTransport: () => {
      /* no-op */
    },
    upgradeTimeout: () => {
      /* no-op */
    },
  };

  private _clientEmitter = new EventEmitter();
  private _serverEmitter = new EventEmitter();

  // Instance debug flag (can override global)
  private _debug: boolean;

  constructor(options: MockSocketOptions = {}) {
    this._debug = options.debug ?? process.env?.NODE_ENV === "development";
    this.connect(); // Auto-connect on instantiation
  }

  private _log(...args: any[]): void {
    if (this._debug) {
      console.log("[MockSocket]", ...args);
    }
  }

  open() {
    return this.connect();
  }

  compress() {}

  /**
   * Simulates connection establishment and generates a new Session ID.
   */
  connect() {
    this.connected = true;
    this.disconnected = false;
    this.id = Math.random().toString(36).substring(2, 15);
    setTimeout(() => {
      this._trigger("connect");
      MockSocket._staticEmitter.emit("connect", { socket: this });
    }, 0);
    return this;
  }

  disconnect() {
    this.connected = false;
    this.disconnected = true;
    this._trigger("disconnect");
    MockSocket._staticEmitter.emit("disconnect", { socket: this });
    return this;
  }

  close(): this {
    return this.disconnect();
  }

  /**
   * Triggers local listeners (internal helper).
   * Used to simulate incoming server events.
   */
  private _trigger(event: string, ...args: any[]): this {
    this._log(`trigger event: ${event}`, ...args);
    this._clientEmitter.emit(event, ...args);
    return this;
  }

  // --- Client API ---

  /**
   * Registers a listener for an event from the server.
   */
  on<E extends keyof ListenEvents & string>(
    event: E,
    listener: ListenEvents[E]
  ): this {
    this._clientEmitter.on(event, listener);
    return this;
  }

  /**
   * Registers a one-time listener for an event from the server.
   */
  once<E extends keyof ListenEvents & string>(
    event: E,
    listener: ListenEvents[E]
  ): this {
    this._clientEmitter.once(event, listener);
    return this;
  }

  /**
   * Removes a listener for an event.
   */
  off<E extends keyof ListenEvents & string>(
    event: E,
    listener?: ListenEvents[E]
  ): this {
    this._clientEmitter.off(event, listener);
    return this;
  }

  /**
   * Removes all listeners, or those of the specified event.
   */
  removeAllListeners(event?: string): this {
    this._clientEmitter.removeAllListeners(event);
    return this;
  }

  /**
   * Sends a message to the server using the 'message' event.
   * This is a shorthand for `emit('message', ...args)`.
   */
  send(...args: Parameters<EmitEvents["message"]>): this {
    if (!this.connected) return this;
    this.emit("message", ...args);
    return this;
  }

  /**
   * Sends a message to the server.
   * First tries global middlewares, then instance handler defined by `serverSideOn`.
   */
  emit<E extends keyof EmitEvents & string>(
    event: E,
    ...args: Parameters<EmitEvents[E]>
  ): this {
    this._log(`emit: ${event}`, ...args);

    if (!this.connected) return this;

    const processEmit = async () => {
      this._serverEmitter.emit(event, ...args);
    };

    // Execute asynchronously
    setTimeout(() => processEmit(), 0);
    return this;
  }

  public server = {
    on: (event: string, listener: Callback) => {
      this._serverEmitter.on(event, listener);
    },
    off: (event: string, listener?: Callback) => {
      this._serverEmitter.off(event, listener);
    },
    emit: (event: string, ...args: any[]) => {
      this._clientEmitter.emit(event, ...args);
    },
  };
}

/**
 * Factory function compatible with socket.io-client API.
 * Usage: const socket = io() or io(url, options)
 */
export function io(url?: string, options?: MockSocketOptions): MockSocket {
  return new MockSocket(options);
}

// Add namespace support for socket.io compatibility
export interface SocketIOStatic {
  (url?: string, options?: MockSocketOptions): MockSocket;
}

// Create the io function with static methods attached
const ioWithStatics = io as SocketIOStatic;

// Export as default for compatibility
export default ioWithStatics;
