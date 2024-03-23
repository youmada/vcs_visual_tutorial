import { BlobFile } from "./blobFile";
const crypto = require("crypto");
/*/ Folderクラス
BlobFileを格納するためのオブジェクトを生成する。
idはハッシュ値なので、フォルダを管理するRepositoryクラスに
同一名のフォルダの生成をチェックするメソッドをつける。
createId(): ID生成。
updateName(): フォルダ名を変更し、IDを再生成する。
createFile(): BlobFileクラスをインスタンス化する
pushFile(): 生成したBlobFileインスタンスをfoldersプロパティに格納
isCheckSameFile(): 同一名のファイル生成をチェックする
/*/
export class Folder {
  name: string;
  folders: { [name: string]: BlobFile };
  id: string;
  constructor(name: string) {
    this.name = name;
    this.folders = {};
    this.id = this.createId();
  }

  private createId(): string {
    const hash = crypto.createHash("sha1");
    hash.update(this.name);
    // フォルダ名の変更に際して、フォルダ名を使っているファイルのIDも変更する。
    for (const key in this.folders) {
      // ファイルが保存しているフォルダ名を更新
      this.folders[key].updatePath(this.name);
      this.folders[key].createId();
    }
    return hash.digest("hex");
  }

  updateName(nameText: string) {
    this.name = nameText;
    this.id = this.createId();
  }

  createFile(name: string, text: string) {
    if (this.isCheckSameFile(name)) {
      console.log("file name is already");
      return;
    }
    const file = new BlobFile(name, text, this.name);
    this.folders[file.name] = file;
  }
  isCheckSameFile(fileName: string): boolean {
    const isCheck = this.folders[fileName] ? true : false;
    return isCheck;
  }
}
