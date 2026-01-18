export class X2tConverter {
  private scriptUrl: string;
  private initPromise: Promise<void> | null = null;

  public x2t: any;

  constructor({ scriptUrl }: { scriptUrl: string }) {
    this.scriptUrl = scriptUrl;
    this.init();
  }

  public async init() {
    if (this.initPromise) {
      return await this.initPromise;
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(this.scriptUrl, location.href).href;

      await new Promise<void>((res, rej) => {
        script.onload = () => res();
        script.onerror = () => rej();
        document.head.appendChild(script);
      });

      this.x2t = (window as any).Module;
      await new Promise<void>((res) => {
        this.x2t.onRuntimeInitialized = () => {
          res();
        };
      });

      try {
        this.x2t.FS.mkdir("/working");
        this.x2t.FS.mkdir("/working/media");
        this.x2t.FS.mkdir("/working/fonts");
        this.x2t.FS.mkdir("/working/themes");
      } catch (err) {
        console.error(err);
      }

      resolve();
    });

    await this.initPromise;
  }

  public async convert(
    data: ArrayBuffer,
    inputFormat: string,
    outputFormat: string,
    options = {
      media: {} as Record<string, ArrayBuffer>,
      fonts: {} as Record<string, ArrayBuffer>,
      themes: {} as Record<string, ArrayBuffer>,
    }
  ) {
    await this.init();

    const fileFrom = "/working/doc." + inputFormat;
    const fileTo = "/working/doc." + outputFormat;

    const params = `<?xml version="1.0" encoding="utf-8"?>
<TaskQueueDataConvert
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
>
    <m_sFileFrom>${fileFrom}</m_sFileFrom>
    <m_sThemeDir>/working/themes</m_sThemeDir>
    <m_sFileTo>${fileTo}</m_sFileTo>
    <m_bIsNoBase64>false</m_bIsNoBase64>
    <m_sFontDir>/working/fonts/</m_sFontDir>
</TaskQueueDataConvert>`;

    this.x2t.FS.writeFile(fileFrom, new Uint8Array(data));
    this.x2t.FS.writeFile("/working/params.xml", params);
    try {
      // running conversion
      this.x2t.ccall("main1", ["number"], ["string"], ["/working/params.xml"]);
    } catch (e) {
      console.error(e);
    }

    let output: ArrayBuffer | null = null;
    try {
      output = this.x2t.FS.readFile(fileTo);
    } catch (e) {
      console.error("Failed reading converted file", e);
    }
    let medias: { name: string; data: Uint8Array }[] = [];
    try {
      medias = await this.readMedia();
    } catch (e) {
      console.error("Failed reading media files", e);
    }

    return { output, medias };
  }

  private async readMedia() {
    const images: { name: string; data: Uint8Array }[] = [];
    const files = this.x2t.FS.readdir("/working/media/");
    files.forEach((file: string) => {
      if (file !== "." && file !== "..") {
        var fileData = this.x2t.FS.readFile("/working/media/" + file, {
          encoding: "binary",
        });
        images.push({
          name: file,
          data: fileData,
        });
      }
    });
    return images;
  }
}

export const converter = new X2tConverter({
  scriptUrl: "/x2t/x2t.js",
});
