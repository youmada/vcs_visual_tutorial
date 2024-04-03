import { BlobFile } from "./blobFile";
const crypto = require("crypto");
/*/ Folderクラス
BlobFileを格納するためのオブジェクトを生成する。
idはハッシュ値なので、フォルダを管理するRepositoryクラスに
同一名のフォルダの生成をチェックするメソッドをつける。
createId(): ID生成。
updatePath():再帰的に子要素のpathを変更させる。
updateName(): フォルダ名を変更し、IDを再生成する。
createFile(): BlobFileクラスをインスタンス化する
createFolder(): Folderクラスをインスタンス化する
pushFile(): 生成したBlobFileインスタンスをfoldersプロパティに格納
isCheckSameFile(): 同一名のファイル生成をチェックする
/*/
export class Folder {
  name: string;
  contents: { [name: string]: BlobFile | Folder };
  id: string;
  path: string;
  constructor(name: string, path: string = "root") {
    this.name = name;
    this.contents = {};
    this.id = this.createId();
    this.path = path;
  }

  createId(): string {
    const hash = crypto.createHash("sha1");
    hash.update(this.name);
    return hash.digest("hex");
  }

  updatePath(path: string) {
    for (const key in this.contents) {
      const item = this.contents[key];
      if (item instanceof BlobFile) {
        item.updatePath(path);
      } else {
        item.path = path;
      }
      item.createId();
    }
  }

  updateName(nameText: string) {
    this.name = nameText;
    this.updatePath(nameText);
  }

  createFile(name: string, text: string): BlobFile | void {
    if (this.isCheckSame(name)) {
      console.log("file name is already");
      return;
    }
    const file = new BlobFile(name, text, this.name);
    this.contents[file.name] = file;
    return file;
  }

  createFolder(name: string): Folder | void {
    if (this.isCheckSame(name)) {
      console.log("file name is already");
      return;
    }
    const folder = new Folder(name, this.name);
    this.contents[folder.name] = folder;
    return folder;
  }

  isCheckSame(fileName: string): boolean {
    const isCheck = this.contents[fileName] ? true : false;
    return isCheck;
  }
}
