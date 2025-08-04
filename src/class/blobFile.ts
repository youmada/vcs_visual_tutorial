/**
 * BlobFileオブジェクトは、ファイルの名前、テキストデータ、親フォルダのパス、IDを保持します。
 * @property name - ファイルの名前
 * @property text - ファイルのテキストデータ
 * @property path - ファイルのパス
 * @property id - ファイルのID
 */
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

  /**
   * BlobFileオブジェクトを初期化します。この段階でIDも生成されます。
   * @param name ファイルの名前
   * @param text ファイルのテキストデータ
   * @param path ファイルのパス
   * @returns 初期化されたBlobFileオブジェクト
   */
  static async init(name: string, text: string, path: string): Promise<BlobFile> {
    const blobFile = new BlobFile();
    blobFile.name = name;
    blobFile.text = text;
    blobFile.path = path;
    blobFile.id = await blobFile.createId();
    return blobFile;
  }

  /**
   * BlobFileオブジェクトの識別子を生成します。
   * IDは、ファイルの名前、パス、テキストデータから生成されます。
   * @returns 生成された識別子
   */
  async createId(): Promise<string> {
    const msgUint8 = new TextEncoder().encode(this.name + this.path + this.text);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  /**
   * BlobFileオブジェクトのIDを更新します。
   */
  async updateId() {
    this.id = await this.createId();
  }

  /**
   * BlobFileオブジェクトのテキストデータを更新します。
   * @param text 更新するテキストデータ
   */
  updateText(text: string) {
    this.text = text;
  }

  /**
   * BlobFileオブジェクトのパスを更新します。
   * @param path 更新するパス。親フォルダのnameをとる
   */
  updatePath(path: string) {
    this.path = path;
  }

  /**
   * BlobFileオブジェクトの識別子を取得します。
   * @returns 識別子
   */
  getId(): string {
    return this.id!;
  }
}
