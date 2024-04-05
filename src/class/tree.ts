import { BlobFile } from "./blobFile";
import { Folder } from "./folder";

export class Tree {
  entry: { [name: string]: BlobFile | Folder | Tree };
  private id: string | null;
  name: string;
  constructor() {
    this.entry = {};
    this.name = "";
    this.id = null;
  }

  static async init(name: string): Promise<Tree> {
    const tree = new Tree();
    tree.name = name;
    tree.id = await tree.createId();
    return tree;
  }

  addEntry(object: BlobFile | Tree) {
    const item = object;
    this.entry[item.getId()] = item;
    this.createId();
  }

  private async createId(): Promise<string> {
    const combineId = () => {
      let sumIDString = "";
      for (const key in this.entry) {
        sumIDString += key;
      }
      return sumIDString;
    };
    const msgUint8 = new TextEncoder().encode(combineId());
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  getId(): string {
    return this.id!;
  }
}
