const crypto = require("crypto");
/*/
BlobFileクラス
path: ファイルが格納されているフォルダの名前
/*/

export class BlobFile {
  id: string;
  name: string;
  text: string;
  path: string;
  constructor(name: string, text: string, path: string = "root") {
    this.name = name;
    this.text = text;
    this.path = path;
    this.id = this.createId();
  }

  createId() {
    const hash = crypto.createHash("sha1");
    hash.update(this.name + this.text + this.path);
    return hash.digest("hex");
  }

  updatePath(path: string) {
    this.path = path;
  }

  updateText(text: string): string {
    this.text = text;
    this.createId();
    return this.id;
  }
}
