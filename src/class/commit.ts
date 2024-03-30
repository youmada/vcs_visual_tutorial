import { Tree } from "./tree";
const crypto = require("crypto");
/*/
Commitクラス
Treeを子要素に取って2回目以降のコミットではparentCommitIDを取り参照できるようにする。

createID(): IDを生成する。
/*/

export class Commit {
  id: string;
  message: string;
  tree: Tree;
  parentCommitId: string | null;
  constructor(message: string, tree: Tree, parentCommitId: string | null = null) {
    this.message = message;
    this.tree = tree;
    this.id = this.createId();
    this.parentCommitId = parentCommitId;
  }

  private createId(): string {
    const currentDate = new Date();
    const user = "tutorialUser";
    const hash = crypto.createHash("sha1");
    hash.update(currentDate + user + this.message);
    return hash.digest("hex");
  }
}
