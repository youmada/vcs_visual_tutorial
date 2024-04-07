export class BlobFile {
  name: string;
  text: string;
  path: string;
  id: string | null;

  constructor() {
    this.name = "";
    this.text = "";
    this.path = "";
    this.id = null;
  }

  static async init(name: string, text: string, path: string): Promise<BlobFile> {
    const blobFile = new BlobFile();
    blobFile.name = name;
    blobFile.text = text;
    blobFile.path = path;
    blobFile.id = await blobFile.createId();
    return blobFile;
  }

  async createId(): Promise<string> {
    const msgUint8 = new TextEncoder().encode(this.name + this.path + this.text);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  async updateText(text: string) {
    this.text = text;
  }

  updatePath(path: string) {
    this.path = path;
  }

  getId(): string {
    return this.id!;
  }
}
