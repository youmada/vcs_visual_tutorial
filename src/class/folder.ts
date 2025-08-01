import { BlobFile } from "./blobFile.ts";

/**
 * フォルダクラス
 * @property name フォルダ名
 * @property contents フォルダ内のコンテンツ
 * @property id フォルダのID
 * @property parent 親フォルダ
 */
export class Folder {
  name: string;
  contents: { [name: string]: BlobFile | Folder };
  private id: string | null;
  parent: Folder | null;

  constructor() {
    this.name = "";
    this.contents = {};
    this.parent = null;
    this.id = null;
  }

  /**
   * フォルダを初期化する。Folderクラスを使う時はこのメソッドから初期化する。
   * IDの生成も行う。
   * @param name フォルダ名
   * @param parent 親フォルダ
   * @returns Foilderインスタンス。
   */
  static async init(name: string, parent: Folder | null): Promise<Folder> {
    const folder = new Folder();
    folder.name = name;
    folder.parent = parent;
    folder.id = await folder.createId();
    return folder;
  }

  /**
   * 引数に渡すコンテンツ名を元に、フォルダ内のコンテンツを削除する。
   * @param name 削除するコンテンツ名
   */
  deleteContent(name: string) {
    delete this.contents[name];
  }

  /**
   * 引数に渡すコンテンツを同名のコンテンツがあるか、チェックしてからコンテンツ名をkeyとして挿入する。
   * 同名のコンテンツがある場合は挿入しない。
   * @param item 挿入するコンテンツ
   */
  insertContent(item: BlobFile | Folder) {
    if (this.isCheckSame(item.name)) {
      this.contents[item.name] = item;
    }
  }

  /**
   * IDを生成する
   * フォルダ名を元にIDを生成する。
   * @returns 生成されたID
   */
  async createId(): Promise<string> {
    const msgUint8 = new TextEncoder().encode(this.name);
    const hashBuffer = await window.crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  /**
   * IDを取得する
   * @returns フォルダのID
   */
  getId(): string {
    return this.id!;
  }

  /**
   * フォルダ名を更新する
   * @param nameText 新しいフォルダ名
   */
  updateName(nameText: string) {
    this.name = nameText;
  }

  /**
   * 同じ名前のファイルが存在するかチェックする
   * @param fileName ファイル名
   * @returns 同じ名前のファイルが存在しない場合はtrue、存在する場合はfalse
   */
  isCheckSame(fileName: string): boolean {
    return !this.contents[fileName] ? true : false;
  }
}
