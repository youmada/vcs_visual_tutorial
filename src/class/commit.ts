import { Tree } from "./tree";

/*/
Commitクラス
Treeを子要素に取って2回目以降のコミットではparentCommitIDを取り参照できるようにする。

createID(): IDを生成する。
/*/

export class Commit {
  private id: string | null;
  message: string;
  tree: Tree;
  private parentCommitId: string | null;

  constructor(tree: Tree) {
    this.id = null;
    this.message = "";
    this.tree = tree;
    this.parentCommitId = null;
  }

  static async init(message: string, tree: Tree, parentCommitId: string | null = null): Promise<Commit> {
    const commit = new Commit(tree);
    commit.message = message;
    commit.parentCommitId = parentCommitId;
    commit.id = await commit.createId();
    return commit;
  }

  async createId(): Promise<string> {
    const currentDate = new Date();
    const msgUint8 = new TextEncoder().encode(String(currentDate + this.message));
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  getId() {
    return this.id!;
  }

  getParentId() {
    return this.parentCommitId;
  }
}
