import { Commit } from "./commit";
import { Layout } from "./layout";
import { Vcs } from "./vcs";

export class RepositoryAreaLayout {
  /**
   * リポジトリエリアを作成します。
   * @returns 作成されたリポジトリエリアのHTMLDivElement
   *
   */
  static createRepositoryArea(): HTMLDivElement {
    // リポジトリエリアのタイトルを作成
    const title = document.createElement("h3");
    title.classList.add("area-title");
    title.textContent = "リポジトリ";

    // 要素をリポジトリエリアに追加
    Layout.repository.innerHTML = "";
    Layout.repository.appendChild(title);
    // nullの場合は表示できるものが無いので何もしない
    if (Vcs.repository.head !== null) {
      RepositoryAreaLayout.createCommitTree();
    }

    return Layout.repository;
  }

  /**
   * コミット要素を作成する。
   * @param commit commitListの要素
   * @returns 作成されたコミット要素のHTMLDivElement
   */
  private static commitElement(commit: Commit): HTMLDivElement {
    const commitElement = document.createElement("div");
    commitElement.classList.add("commit-element");
    commitElement.setAttribute("data-commit-id", commit.getId());
    return commitElement;
  }

  /**
   * コミットツリーを作成する。
   * @returns 作成されたコミットツリーのHTMLDivElement
   */
  private static createCommitTree() {
    const commitTree = document.createElement("div");
    commitTree.classList.add("commit-tree");
    Layout.repository.appendChild(commitTree);
    const head = Vcs.repository.head;
    const latestCommit = Vcs.repository.commitList[head!];
    // SVG要素を作成し、それをコミットツリーに追加
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // svg.setAttribute("width", "100%");
    // svg.setAttribute("height", "100%");
    commitTree.appendChild(svg);
    // 再帰的にコミット要素を生成
    RepositoryAreaLayout.recursiveCreateCommitElement(latestCommit, commitTree);
    console.log(commitTree);
    setTimeout(() => {
      // 再帰的にコミット要素同士を繋ぐ線を生成
      RepositoryAreaLayout.createAllLines(latestCommit, commitTree, svg);
    }, 0);
  }

  /**
   * 再帰的にコミット要素を生成して、コミットツリーに追加する。
   * @param commit 最新のコミット
   * @param commitTree コミットツリー
   * @returns 作成されたコミットツリーのHTMLDivElement
   */
  private static recursiveCreateCommitElement(commit: Commit, commitTree: HTMLDivElement) {
    // コミット要素を作成し、それをコミットツリーに追加
    const commitElement = RepositoryAreaLayout.commitElement(commit);
    commitTree.appendChild(commitElement);
    const parentId = commit.getParentId();
    if (parentId !== null) {
      const parentCommit = Vcs.repository.commitList[parentId];
      RepositoryAreaLayout.recursiveCreateCommitElement(parentCommit, commitTree);
    }
  }

  /**
   * コミット要素同士を繋ぐ線を生成する。
   * @param commitElement コミット要素
   * @param parentCommitElement 親コミット要素
   * @param svg SVG要素
   */
  private static createLine(commitElement: HTMLDivElement, parentCommitElement: HTMLDivElement, svg: SVGSVGElement) {
    setTimeout(() => {
      // コミット要素と親コミット要素の位置を取得
      const commitElementRect = commitElement.getBoundingClientRect();
      const parentCommitElementRect = parentCommitElement.getBoundingClientRect();
      console.log(commitElementRect);
      console.log(parentCommitElementRect);

      // コミット要素と親コミット要素の中心のx座標を計算
      const commitElementCenterX = (commitElementRect.left + commitElementRect.width / 2) - 20;
      const parentCommitElementCenterX = (parentCommitElementRect.left + parentCommitElementRect.width / 2) - 20;

      // SVGライン要素を作成し、それをSVG要素に追加
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", (commitElementCenterX).toString());
      line.setAttribute("y1", (commitElementRect.bottom + 40).toString());
      line.setAttribute("x2", (parentCommitElementCenterX).toString());
      line.setAttribute("y2", (commitElementRect.top - 40).toString());
      line.setAttribute("stroke", "black");
      line.setAttribute("stroke-width", "5");
      line.setAttribute("stroke-dasharray", "4 2");
      svg.appendChild(line);
      console.log(line);
    }, 0);
  }

  /**
   * 再帰的にコミット要素同士を繋ぐ線を生成する。
   * @param commit コミット
   * @param commitTree コミットツリー
   * @param svg SVG要素
   */
  private static createAllLines(commit: Commit, commitTree: HTMLDivElement, svg: SVGSVGElement) {
    const commitElement = commitTree.querySelector(`[data-commit-id='${commit.getId()}']`) as HTMLDivElement;
    const parentId = commit.getParentId();
    if (parentId !== null) {
      const parentCommit = Vcs.repository.commitList[parentId];
      const parentCommitElement = commitTree.querySelector(`[data-commit-id='${parentCommit.getId()}']`) as HTMLDivElement;
      // コミット要素同士を繋ぐ線を作成
      RepositoryAreaLayout.createLine(commitElement, parentCommitElement, svg);
      // 親コミットの線を生成
      RepositoryAreaLayout.createAllLines(parentCommit, commitTree, svg);
    }
  }
}
