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
   * @param x x座標
   * @param y y座標
   * @returns 作成されたコミット要素のSVGCircleElement
   */
  private static commitElement(commit: Commit, x: number, y: number): SVGCircleElement {
    const commitElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    commitElement.setAttribute("cx", x.toString());
    commitElement.setAttribute("cy", y.toString());
    commitElement.setAttribute("r", "30");
    commitElement.setAttribute("fill", "#ccc");
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
    // SVG要素を作成し、それをコミットツリーに追加
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    commitTree.appendChild(svg);
    // 再帰的にコミット要素を生成
    // ブランチをずらすためのカウンター
    let count = 0;
    // ブランチごとにコミット要素を生成
    for (const branch in Vcs.repository.branchList) {
      // 各ブランチの最新コミット
      const latestCommit = Vcs.repository.commitList[Vcs.repository.branchList[branch]];
      const initialX = svg.getBoundingClientRect().width / 2 - count * 100;
      const initialY = svg.getBoundingClientRect().height - 100;
      RepositoryAreaLayout.recursiveCreateCommitElement(latestCommit, commitTree, svg, initialX, initialY);
      setTimeout(() => {
        // 再帰的にコミット要素同士を繋ぐ線を生成
        RepositoryAreaLayout.createAllLines(latestCommit, commitTree, svg);
      }, 0);
      count++;
    }
  }

  /**
   * 再帰的にコミット要素を生成して、コミットツリーに追加する。
   * @param commit 最新のコミット
   * @param commitTree コミットツリー
   * @returns 作成されたコミットツリーのHTMLDivElement
   */
  private static recursiveCreateCommitElement(commit: Commit, commitTree: HTMLDivElement, svg: SVGSVGElement, x: number, y: number) {
    // 既にコミット要素が存在する場合は何もしない
    if (svg.querySelector(`[data-commit-id='${commit.getId()}']`)) return;
    // コミット要素を作成し、それをコミットツリーに追加
    const commitElement = RepositoryAreaLayout.commitElement(commit, x, y);
    svg.appendChild(commitElement);
    const parentId = commit.getParentId();
    if (parentId !== null) {
      const parentCommit = Vcs.repository.commitList[parentId];
      const parentY = y - 100;
      let parentX = x;
      RepositoryAreaLayout.recursiveCreateCommitElement(parentCommit, commitTree, svg, parentX, parentY);
    }
  }

  /**
   * コミット要素同士を繋ぐ線を生成する。
   * @param commitElement コミット要素
   * @param parentCommitElement 親コミット要素
   * @param svg SVG要素
   */
  private static createLine(commitElement: SVGCircleElement, parentCommitElement: SVGCircleElement, svg: SVGSVGElement) {
    setTimeout(() => {
      const x1 = parseFloat(commitElement.getAttribute("cx")!);
      const y1 = parseFloat(commitElement.getAttribute("cy")!);
      const x2 = parseFloat(parentCommitElement.getAttribute("cx")!);
      const y2 = parseFloat(parentCommitElement.getAttribute("cy")!);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);

      const offsetRadius = 30 + 5; // circle radius + offset
      const offsetX = offsetRadius * Math.cos(angle);
      const offsetY = offsetRadius * Math.sin(angle);

      // SVGライン要素を作成し、それをSVG要素に追加
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", (x1 + offsetX).toString());
      line.setAttribute("y1", (y1 + offsetY).toString());
      line.setAttribute("x2", (x2 - offsetX).toString());
      line.setAttribute("y2", (y2 - offsetY).toString());
      line.setAttribute("stroke", "black");
      line.setAttribute("stroke-width", "5");
      line.setAttribute("stroke-dasharray", "4 2");
      svg.appendChild(line);
    }, 0);
  }

  /**
   * 再帰的にコミット要素同士を繋ぐ線を生成する。
   * @param commit コミット
   * @param commitTree コミットツリー
   * @param svg SVG要素
   */
  private static createAllLines(commit: Commit, commitTree: HTMLDivElement, svg: SVGSVGElement) {
    const commitElement = commitTree.querySelector(`[data-commit-id='${commit.getId()}']`) as SVGCircleElement;
    const parentId = commit.getParentId();
    if (parentId !== null) {
      const parentCommit = Vcs.repository.commitList[parentId];
      const parentCommitElement = commitTree.querySelector(`[data-commit-id='${parentCommit.getId()}']`) as SVGCircleElement;
      // コミット要素同士を繋ぐ線を作成
      RepositoryAreaLayout.createLine(commitElement, parentCommitElement, svg);
      // 親コミットの線を生成
      RepositoryAreaLayout.createAllLines(parentCommit, commitTree, svg);
    }
  }
}
