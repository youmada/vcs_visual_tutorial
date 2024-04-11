import { Tree } from "./tree";
/**
 * コミットを表すクラス。
 * initメソッドでコミットを初期化する。
 * コミットにはメッセージ、ツリー、親コミットIDが含まれる。
 * コミットIDはメッセージと現在の日付から生成される。
 * コミットIDはコミットの一意性を保証するために使用される。
 * コミットIDはコミットが作成されるたびに異なる値になる。
 */
export class Commit {
  private id: string | null;
  message: string;
  tree: Tree;
  private parentCommitId: string | null;

  /**
   * コミットを初期化する。constructorメソッドでコミットを初期化することは想定しない。initメソッドを使用すること。
   * @param tree The tree associated with the commit.
   */
  constructor(tree: Tree) {
    this.id = null;
    this.message = "";
    this.tree = tree;
    this.parentCommitId = null;
  }

  /**
   * 初期化するための静的メソッド。
   * @param message コミットメッセージ。
   * @param tree コミットに関連付けられたツリー。
   * @param parentCommitId 親コミットID。デフォルトはnull。
   * @returns 初期化されたコミットオブジェクトを返します。
   */
  static async init(message: string, tree: Tree, parentCommitId: string | null = null): Promise<Commit> {
    const commit = new Commit(tree);
    commit.message = message;
    commit.parentCommitId = parentCommitId;
    commit.id = await commit.createId();
    return commit;
  }

  /**
   * コミットIDを生成する。現在時刻とメッセージからSHA-1ハッシュを生成する。
   * @returns 生成されたコミットID。Promiseオブジェクトで返される。
   */
  async createId(): Promise<string> {
    const currentDate = new Date();
    const msgUint8 = new TextEncoder().encode(String(currentDate + this.message));
    const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  /**
   * idを返す。
   * @returns コミットIDを返す
   */
  getId() {
    return this.id!;
  }

  /**
   * 親コミットIDを返す。
   * @returns 親コミットIDを返す。親コミットがない場合はnullを返す。
   */
  getParentId() {
    return this.parentCommitId;
  }
}
