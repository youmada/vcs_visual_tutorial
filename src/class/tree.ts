import { BlobFile } from "./blobFile";
import { Folder } from "./folder";

/**
 * Treeクラス。初期化にはinitメソッドを使用します。
 * @property entry - ツリーのエントリ:BlobFile, Folder, Treeのいずれかが入るkey-valueのオブジェクト
 * @property id - ツリーのID
 * @property name - ツリーの名前。フォルダに相当するので、フォルダ名が入る
 */
export class Tree {
  entry: { [name: string]: BlobFile | Folder | Tree };
  private id: string | null;
  name: string;

  constructor() {
    this.entry = {};
    this.name = "";
    this.id = null;
  }

  /**
   * 指定された名前で Tree インスタンスを初期化します。このメソッドでIDを生成する。
   * @param name ツリーの名前
   * @returns 初期化された Tree インスタンス Promiseとして返します。
   */
  static async init(name: string): Promise<Tree> {
    const tree = new Tree();
    tree.name = name;
    await tree.createId();
    return tree;
  }

  /**
   * ツリーにエントリを追加します。
   * @param object 追加するエントリ
   */
  addEntry(object: BlobFile | Tree) {
    const item = object;
    this.entry[item.getId()] = item;
    this.createId();
  }

  /**
   * ツリーの ID を取得します。
   * @returns ツリーの ID
   */
  getId(): string {
    return this.id!;
  }

  /**
   * ツリーの ID を生成します。 TreeオブジェクトのエントリIDを結合してハッシュ化します。
   */
  async createId() {
    const combineId = () => {
      const key = Object.keys(this.entry).sort();
      return key.join("");
    };
    const msgUint8 = new TextEncoder().encode(combineId());
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    this.id = hashHex;
  }
}
