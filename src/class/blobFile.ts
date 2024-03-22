const crypto = require("crypto");
export class BlobFile {
  id: string;
  name: string;
  text: string;
  constructor(name: string, text: string) {
    this.name = name;
    this.text = text;
    this.id = "";
  }

  createId() {
    const hash = crypto.createHash("sha1");
    hash.update(this.name + this.text);
    this.id = hash.digest("hex");
  }

  updateText(text: string) {
    this.text = text;
    this.createId();
  }
}
