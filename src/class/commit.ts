import { Tree } from "./tree.ts";
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
  private branch: string;
  private parentCommitId: string | null;
  private secondParentCommitId: string | null;
  time: Date;

  /**
   * コミットを初期化する。constructorメソッドでコミットを初期化することは想定しない。initメソッドを使用すること。
   * @param tree The tree associated with the commit.
   * @param branch The branch to which the commit belongs.
   */
  constructor(tree: Tree, branch: string) {
    this.id = null;
    this.message = "";
    this.tree = tree;
    this.parentCommitId = null;
    this.secondParentCommitId = null;
    this.branch = branch;
    this.time = new Date();
  }

  /**
   * 初期化するための静的メソッド。
   * @param message コミットメッセージ。
   * @param tree コミットに関連付けられたツリー。
   * @param parentCommitId 親コミットID。デフォルトはnull。
   * @param branch コミットが属するブランチ名。
   * @returns 初期化されたコミットオブジェクトを返します。
   */
  static async init(message: string, tree: Tree, parentCommitId: string | null = null, branch: string): Promise<Commit> {
    const commit = new Commit(tree, branch);
    commit.message = message;
    commit.parentCommitId = parentCommitId;
    commit.secondParentCommitId = null;
    commit.id = await commit.createId();
    return commit;
  }

  /**
   * コミットの親コミットIDを設定する。
   * @param parentCommitId 親コミットID。
   */

  setParentCommitId(parentCommitId: string) {
    this.parentCommitId = parentCommitId;
  }

  /**
   * コミットの2番目の親コミットIDを設定する。
   * @param parentCommitId 2番目の親コミットID。
   */
  setSecondParentCommitId(parentCommitId: string) {
    this.secondParentCommitId = parentCommitId;
  }

  /**
   * ブランチ名を取得する。
   * @returns ブランチ名を返す。
   */

  getBranch() {
    return this.branch;
  }

  /**
   * ブランチ名を設定する。
   * @param branch ブランチ名。
   */
  setBranch(branch: string) {
    this.branch = branch;
  }

  /**
   * コミットIDを生成する。現在時刻とメッセージからSHA-1ハッシュを生成する。
   * @returns 生成されたコミットID。Promiseオブジェクトで返される。
   */
  async createId(): Promise<string> {
    const currentDate = new Date();
    const msgUint8 = new TextEncoder().encode(String(currentDate + this.message));
    const hashBuffer = await window.crypto.subtle.digest("SHA-1", msgUint8);
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

  /**
   * 2番目の親コミットIDを返す。
   * @returns 2番目の親コミットIDを返す。2番目の親コミットがない場合はnullを返す。
   */
  getSecondParentCommitId() {
    return this.secondParentCommitId;
  }
}
