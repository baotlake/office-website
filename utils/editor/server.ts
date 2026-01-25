import { converter } from "./x2t";
import { MockSocket } from "./socket";
import { User, Participant, AscSaveTypes } from "./types";
import { emptyDocx, emptyPdf, emptyPptx, emptyXlsx } from "./empty";
import { getDocumentType, getFileExt } from "./utils";

function mergeBuffers(buffers: Uint8Array[]) {
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
  const mergedBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const buffer of buffers) {
    mergedBuffer.set(buffer, offset);
    offset += buffer.length;
  }
  return mergedBuffer;
}

function randomId() {
  return Math.random().toString(36).substring(2, 9);
}

function getUrl(data: Uint8Array, type?: string) {
  const blob = new Blob([data as Uint8Array<ArrayBuffer>], {
    type: type || "application/octet-stream",
  });
  return URL.createObjectURL(blob);
}

export class EditorServer {
  private id = "";
  private socket: MockSocket | null = null;
  private sessionId: string = "session-id";
  private user: User = {
    id: "uid",
    name: "Me",
  };
  private participants: Participant[] = [];
  private syncChangesIndex = 0;
  private loadPromise: Promise<void> | null = null;

  private file: File | null = null;
  private fileType: string = "docx";
  private title: string = "";
  private fsMap: Map<string, Uint8Array> = new Map();
  private urlsMap: Map<string, string> = new Map();

  private downloadId: string = "";
  private downloadParts: Uint8Array[] = [];

  private options: any = {};

  constructor(options: any = {}) {
    this.options = options;
    this.send = this.send.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  async open(
    file: File,
    { fileType, fileName }: { fileType?: string; fileName?: string } = {},
  ) {
    const title = fileName || file.name;
    this.fileType = fileType || getFileExt(file.name) || "docx";
    const documentType = getDocumentType(this.fileType);
    this.id = randomId();
    this.file = file;
    this.title = title;
    const buffer = await file.arrayBuffer();
    this.loadPromise = this.loadDocument(buffer, this.fileType);

    return {
      id: this.id,
      documentType,
    };
  }

  openNew(fileType?: string) {
    this.fileType = fileType || "docx";
    // TODO: should generate new id?
    this.id = this.id || randomId();
    this.title = "New Document";
    const documentType = getDocumentType(this.fileType);

    let binData: Uint8Array | null = null;

    switch (documentType) {
      case "word":
        binData = Uint8Array.from(emptyDocx, (v) => v.charCodeAt(0));
        break;
      case "cell":
        binData = Uint8Array.from(emptyXlsx, (v) => v.charCodeAt(0));
        break;
      case "slide":
        binData = Uint8Array.from(emptyPptx, (v) => v.charCodeAt(0));
        break;
      case "pdf":
        binData = Uint8Array.from(emptyPdf, (v) => v.charCodeAt(0));
        break;
    }

    if (!binData) {
      throw new Error("Failed to create new document");
    }

    this.fsMap.set("Editor.bin", binData);
    this.urlsMap.set("Editor.bin", getUrl(binData));

    return {
      id: this.id,
      documentType: documentType,
    };
  }

  async openUrl(
    url: string,
    { fileType, fileName }: { fileType?: string; fileName?: string } = {},
  ) {
    const title = fileName || url.split("/").pop() || "Document";
    this.fileType = fileType || getFileExt(title) || "docx";
    const documentType = getDocumentType(this.fileType);
    this.id = randomId();
    this.title = title;
    const buffer = () => fetch(url).then((res) => res.arrayBuffer());
    this.loadPromise = this.loadDocument(buffer, this.fileType);

    return {
      id: this.id,
      documentType,
    };
  }

  getDocument() {
    if (!this.id) {
      this.openNew();
    }

    return {
      fileType: this.fileType,
      key: this.id,
      title: this.title,
      url: "/" + this.id,
    };
  }

  getUser() {
    return this.user;
  }

  private async loadDocument(
    buffer: ArrayBuffer | (() => Promise<ArrayBuffer>),
    fileType: string,
  ) {
    if (typeof buffer == "function") {
      buffer = await buffer();
    }

    let output: Uint8Array | null = null;
    let media: { [key: string]: Uint8Array } = {};

    if (fileType == "pdf") {
      output = new Uint8Array(buffer);
    } else {
      const result = await converter.convert({
        data: buffer,
        fileFrom: "doc." + fileType,
        fileTo: "Editor.bin",
      });
      output = result.output;
      media = result.media;
    }

    if (!output) {
      throw new Error("Failed to convert file");
    }

    if (this.urlsMap.size > 0) {
      this.urlsMap.forEach((url) => URL.revokeObjectURL(url));
    }
    this.fsMap.set("Editor.bin", output);
    this.urlsMap.set("Editor.bin", getUrl(output));
    for (const name in media) {
      this.addMedia(name, media[name]);
    }
  }

  private addMedia(name: string, data: Uint8Array) {
    const pathname = "media/" + name;
    const url = getUrl(data);
    this.fsMap.set(pathname, data);
    this.urlsMap.set(pathname, url);
    return url;
  }

  handleConnect({ socket }: { socket: MockSocket }) {
    console.log("connect: ", socket);

    this.socket = socket;
    const { send, sessionId } = this;

    this.participants = [
      {
        connectionId: this.sessionId,
        encrypted: false,
        id: this.user.id,
        idOriginal: this.user.id,
        indexUser: 1,
        isCloseCoAuthoring: false,
        isLiveViewer: false,
        username: this.user.name,
        view: false,
      },
    ];

    socket.server.on("message", this.handleMessage);

    send({
      maxPayload: 100000000,
      pingInterval: 25000,
      pingTimeout: 20000,
      sid: sessionId,
      upgrades: [],
    });

    send({
      type: "license",
      license: {
        type: 3,
        buildNumber: 8,
        buildVersion: "9.3.0",
        light: false,
        mode: 0,
        rights: 1,
        protectionSupport: true,
        isAnonymousSupport: true,
        liveViewerSupport: true,
        branding: false,
        customization: true,
        advancedApi: false,
      },
    });
  }

  handleDisconnect({ socket }: { socket: MockSocket }) {
    console.log("disconnect: ", socket);
    this.socket = null;
  }

  send(msg: any) {
    if (!this.socket) {
      console.error("Socket is not connected");
      return;
    }
    this.socket.server.emit("message", msg);
  }

  async handleMessage(msg: any, ...args: unknown[]) {
    console.log("[msg]: ", msg, args);

    const { send, sessionId, participants, user } = this;
    switch (msg.type) {
      case "auth":
        const changes: unknown[] = [];
        send({
          type: "authChanges",
          changes: changes,
        });
        send({
          type: "auth",
          result: 1,
          sessionId: sessionId,
          participants: participants,
          locks: [],
          //   changes: changes,
          //   changesIndex: 0,
          indexUser: 1,
          buildVersion: "9.3.0",
          buildNumber: 9,
          licenseType: 3,
          editorType: 2,
          mode: "edit",
          permissions: {
            comment: true,
            chat: true,
            download: true,
            edit: true,
            fillForms: false,
            modifyFilter: true,
            protect: true,
            print: true,
            review: false,
            copy: true,
          },
        });

        try {
          if (this.loadPromise) {
            await this.loadPromise;
          }
          send({
            type: "documentOpen",
            data: {
              type: "open",
              status: "ok",
              data: {
                ...Object.fromEntries(this.urlsMap),
              },
            },
          });
        } catch (err) {
          console.error(err);
          // TODO: send error message
          send({
            type: "documentOpen",
            data: {
              type: "open",
              status: "ok",
              data: {
                "Editor.bin": "",
              },
            },
          });
        }
        break;
      case "isSaveLock":
        send({
          type: "saveLock",
          saveLock: false,
        });
        break;
      case "saveChanges":
        send({
          type: "unSaveLock",
          index: -1,
          syncChangesIndex: ++this.syncChangesIndex,
          time: +new Date(),
        });
        break;
      case "getLock":
        send({
          type: "getLock",
          locks: {
            [msg.block]: {
              time: +new Date(),
              user: user?.id,
              block: msg.block,
            },
          },
        });
        send({
          type: "releaseLock",
          locks: {
            [msg.block]: {
              time: +new Date(),
              user: user?.id,
              block: msg.block,
            },
          },
        });
        break;
    }
  }

  async handleRequest(req: Request) {
    const u = new URL(req.url);

    const { id: key, send } = this;
    // console.log("[msg] server: ", u, key);

    if (u.pathname.endsWith("/downloadas/" + key)) {
      const cmd = JSON.parse(u.searchParams.get("cmd") || "{}");
      const buffer = await req.arrayBuffer();

      console.log("downloadAs -> ", cmd, buffer);

      const fileTo = "doc." + cmd.title.split(".").pop();
      let formatTo = cmd.outputformat;
      if (!formatTo && fileTo.endsWith(".pdf")) {
        formatTo = 513;
      }

      const download = async () => {
        const input = mergeBuffers(this.downloadParts);
        let fileFrom = "from.bin";
        if (cmd.format == "pdf") {
          fileFrom = "from.pdf";
        }

        let { output } = await converter.convert({
          data: input.buffer,
          fileFrom: fileFrom,
          fileTo: fileTo,
          formatTo: formatTo,
          media: Object.fromEntries(this.fsMap),
        });
        if (!output && cmd.format == "pdf") {
          output = input;
        }
        if (!output) {
          throw Error("convert failed");
        }
        const blob = new Blob([new Uint8Array(output)]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = cmd.title || "test.docx";
        a.click();
        URL.revokeObjectURL(url);

        setTimeout(() => {
          send({
            type: "documentOpen",
            data: {
              type: "save",
              status: "ok",
              data: "data:,",
              filetype: "pptx",
            },
          });
        }, 100);
      };

      switch (cmd.savetype) {
        case AscSaveTypes.PartStart:
          this.downloadId = "_" + Math.round(Math.random() * 1000);
          this.downloadParts = [new Uint8Array(buffer)];
          break;
        case AscSaveTypes.Part:
          this.downloadParts.push(new Uint8Array(buffer));
          break;
        case AscSaveTypes.Complete:
          this.downloadParts.push(new Uint8Array(buffer));
          await download();
          this.downloadParts = [];
          break;
        case AscSaveTypes.CompleteAll:
          this.downloadId = "_" + Math.round(Math.random() * 1000);
          this.downloadParts = [new Uint8Array(buffer)];
          await download();
          this.downloadParts = [];
          break;
      }

      return Response.json({
        status: "ok",
        type: "save",
        data: this.downloadId,
      });
    }

    if (u.pathname.endsWith("/upload/" + key)) {
      const buffer = await req.arrayBuffer();
      const data = new Uint8Array(buffer);
      const filename = Date.now() + ".png";
      const pathname = "media/" + filename;
      const url = this.addMedia(filename, data);
      return Response.json({ [pathname]: url });
    }

    return null;
  }
}
