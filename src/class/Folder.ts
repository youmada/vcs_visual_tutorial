import { BlobFile } from "./blobFile";
/*/ Folderクラス
createId(): ID生成。
updateName(): フォルダ名を変更し、IDを再生成する。
isCheckSameFile(): 同一名のファイル生成をチェックする
/*/
export class Folder {
  name: string;
  contents: { [name: string]: BlobFile | Folder };
  private id: string | null;
  path: string;
  constructor() {
    this.name = "";
    this.contents = {};
    this.path = "";
    this.id = null;
  }

  static async init(name: string, path: string): Promise<Folder> {
    const folder = new Folder();
    folder.name = name;
    folder.path = path;
    folder.id = await folder.createId();
    return folder;
  }

  insertContent(item: BlobFile | Folder) {
    if (this.isCheckSame(item.name)) {
      this.contents[item.name] = item;
    }
  }

  async createId(): Promise<string> {
    const msgUint8 = new TextEncoder().encode(this.name);
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  getId(): string {
    return this.id!;
  }

  updateName(nameText: string) {
    this.name = nameText;
  }

  updatePath(pathName: string) {
    this.path = pathName;
  }

  isCheckSame(fileName: string): boolean {
    return !this.contents[fileName] ? true : false;
  }
}
