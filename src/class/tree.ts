import { BlobFile } from "./blobFile";
import { Folder } from "./folder";

/*/
Treeクラス
フォルダとファイルを要素に取り、Commitクラスの子要素になる。

addEntry(): Treeオブジェクトに要素を追加する。
createID(): IDをハッシュ値で生成する。
/*/
export class Tree {
  entry: { [name: string]: BlobFile | Folder | Tree };
  id: string;
  constructor() {
    this.entry = {};
    this.id = "";
  }

  addEntry(object: BlobFile | Folder | Tree) {
    this.entry[object.id] = object;
    this.createId();
  }

  createId() {
    const combineId = () => {
      let sumIDString = "";
      for (const key in this.entry) {
        sumIDString += key;
      }
      return sumIDString;
    };
    const crypto = require("crypto");
    const hash = crypto.createHash("sha1");
    const combinedId = combineId();
    hash.update(combinedId);
    // フォルダ名の変更に際して、フォルダ名を使っているファイルのIDも変更する。
    this.id = hash.digest("hex");
  }
}
