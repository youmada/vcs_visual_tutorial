import { Commit } from "./commit";
import { Contents } from "./contents";
import { Layout } from "./layout";
import { Vcs } from "./vcs";
import { WorkingAreaLayout } from "./workingAreaLayout";

export class RepositoryAreaLayout {
  /**
   * ハイライト要素を格納する配列
   */
  private static highlight: SVGCircleElement[] = [];
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
    // ボタンコンテナをリポジトリエリアに追加
    Layout.repository.appendChild(RepositoryAreaLayout.buttonContainer());

    return Layout.repository;
  }

  /**
   * ハイライト機能を管理・操作する
   * @param ele ハイライトする要素
   */

  private static highlightHandler(ele: SVGCircleElement): void {
    // 現在ハイライトしている要素がクリックされた場合、ハイライトを解除
    if (RepositoryAreaLayout.highlight.length > 0 && RepositoryAreaLayout.highlight[0] === ele) {
      ele.removeAttribute("stroke");
      RepositoryAreaLayout.highlight = [];
      return;
    }
    // ハイライトされている要素が存在する場合、最後の要素を削除
    if (RepositoryAreaLayout.highlight.length > 0) {
      const lastElement = RepositoryAreaLayout.highlight.pop()!;
      lastElement.removeAttribute("stroke"); // ハイライトを解除
    }
    // ハイライトされている要素が存在しない場合、ハイライトする
    if (RepositoryAreaLayout.highlight.length === 0) {
      RepositoryAreaLayout.highlight.push(ele);
      ele.setAttribute("stroke", "blue"); // ハイライト
      return;
    }
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
    if (commit.getId() === Vcs.repository.head) {
      commitElement.setAttribute("fill", "skyblue");
    }
    // クリックイベントリスナーを追加
    commitElement.addEventListener("click", () => {
      RepositoryAreaLayout.highlightHandler(commitElement);
    });
    return commitElement;
  }

  /**
   * コミットツリーを作成する。
   */
  private static createCommitTree(): void {
    const commitTree = document.createElement("div");
    commitTree.classList.add("commit-tree");
    Layout.repository.appendChild(commitTree);
    // SVG要素を作成し、それをコミットツリーに追加
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    commitTree.appendChild(svg);
    // LIFO形式でコミット要素を生成
    const initialX = svg.getBoundingClientRect().width / 2;
    const initialY = svg.getBoundingClientRect().height - 100;
    RepositoryAreaLayout.createCommitElementsLIFO(commitTree, svg, initialX, initialY);
    setTimeout(() => {
      // IDを参照しているコミット要素同士を繋ぐ線を生成
      for (const branchHead in Vcs.repository.branchList) {
        const commit = Vcs.repository.commitList[Vcs.repository.branchList[branchHead]];
        RepositoryAreaLayout.createAllLines(commit, commitTree, svg);
      }
    }, 0);
  }

  /**
   * 再帰的にコミット要素を生成して、コミットツリーに追加する。
   * @param commit 最新のコミット
   * @param commitTree コミットツリー
   * @param svg SVG要素
   * @param x x座標
   * @param y y座標
   */
  private static createCommitElementsLIFO(commitTree: HTMLDivElement, svg: SVGSVGElement, x: number, y: number): void {
    const stack = RepositoryAreaLayout.stackCommit();

    let branchXOffset = 0;
    const branchOffsets: { [name: string]: number } = {
      master: 0,
    };
    const branchYOffset = y;
    while (stack.length > 0) {
      const currentCommit = stack.pop()!;
      // ブランチごとにx座標をオフセット
      if (branchOffsets[currentCommit.getBranch()] == null) {
        branchXOffset += 100;
        branchOffsets[currentCommit.getBranch()] = branchXOffset;
      }
      const commitX = x + branchOffsets[currentCommit.getBranch()];
      // コミット要素を作成し、それをコミットツリーに追加
      const commitElement = RepositoryAreaLayout.commitElement(currentCommit, commitX, y);
      svg.appendChild(commitElement);
      y -= 100; // 新しいコミット（子コミット）を上に配置する
    }

    commitTree.scrollTop = commitTree.scrollHeight;
    // ブランチ名を表示
    for (const branchName in branchOffsets) {
      RepositoryAreaLayout.createBranchName(svg, branchOffsets, branchYOffset, branchName);
    }
  }

  /**
   * それぞれのブランチの要素位置の下部にブランチ名を表示する。
   * @param svg SVG要素
   * @param branchOffsets ブランチオフセット
   * @param branchYOffset ブランチYオフセット
   * @param branchName ブランチ名
   * @returns
   */
  private static createBranchName(svg: SVGSVGElement, branchOffsets: { [name: string]: number }, branchYOffset: number, branchName: string) {
    const branchNameElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    branchNameElement.setAttribute("x", (svg.getBoundingClientRect().width / 2 + branchOffsets[branchName] - 30).toString());
    branchNameElement.setAttribute("y", (branchYOffset + 50).toString());
    branchNameElement.setAttribute("fill", "gray");
    branchNameElement.textContent = branchName;
    branchNameElement.style.cursor = "pointer";
    branchNameElement.addEventListener("click", async () => {
      const userResponse = confirm(`ブランチ${branchName}にチェックアウトしますか？`);
      if (!userResponse) return;
      const branchHead = Vcs.repository.branchList[branchName];
      Vcs.repository.checkOut(branchHead);
      await Contents.checkoutHandler(Vcs.repository.commitList[branchHead].tree);
      RepositoryAreaLayout.createRepositoryArea();
      WorkingAreaLayout.createWorkingArea();
    });
    svg.appendChild(branchNameElement);
  }

  private static stackCommit(): Commit[] {
    const stack: Commit[] = [];
    // リポジトリ内の全てのブランチを取得
    const branches = Object.values(Vcs.repository.branchList);
    for (const branch of branches) {
      let currentCommit = Vcs.repository.commitList[branch];
      while (currentCommit !== null) {
        // 既にコミット要素が存在する場合は何もしない
        if (stack.some((commit) => commit.getId() === currentCommit.getId())) break;
        stack.push(currentCommit);
        if (currentCommit.getParentId() === null) break;
        currentCommit = Vcs.repository.commitList[currentCommit.getParentId()!];
      }
    }

    // コミットを時間順にソート
    stack.sort((a, b) => b.time.getTime() - a.time.getTime());

    return stack;
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
    const parentId = commit.getParentId();
    if (parentId !== null) {
      const commitElement = svg.querySelector(`[data-commit-id='${commit.getId()}']`) as SVGCircleElement;
      const parentCommit = Vcs.repository.commitList[parentId];
      const parentCommitElement = svg.querySelector(`[data-commit-id='${parentId}']`) as SVGCircleElement;
      // コミット要素同士を繋ぐ線を作成

      RepositoryAreaLayout.createLine(commitElement, parentCommitElement, svg);
      // 親コミットの線を生成
      RepositoryAreaLayout.createAllLines(parentCommit, commitTree, svg);
    }
  }

  /**
   * ブランチ生成ボタンを作成する。
   * @returns 作成されたブランチ生成ボタンのHTMLButtonElement
   */
  private static createBranchButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = "ブランチを生成";
    button.addEventListener("click", async () => {
      if (RepositoryAreaLayout.highlight.length === 0) return alert("ブランチを生成するコミットをクリックしてください");
      const branchName = prompt("ブランチ名を入力してください");
      if (branchName === null || branchName === "") return;
      const chosenCommitId = RepositoryAreaLayout.highlight[0].getAttribute("data-commit-id");
      await Vcs.repository.createBranch(branchName, chosenCommitId!);
      RepositoryAreaLayout.createRepositoryArea();
    });
    return button;
  }

  /**
   * チェックアウトボタンを作成する。
   * @returns 作成されたチェックアウトボタンのHTMLButtonElement
   */

  private static createCheckoutButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = "チェックアウト";
    button.addEventListener("click", async () => {
      if (RepositoryAreaLayout.highlight.length === 0) return alert("チェックアウトするコミットをクリックしてください");
      const chosenCommitId = RepositoryAreaLayout.highlight[0].getAttribute("data-commit-id");
      Vcs.repository.checkOut(chosenCommitId!);
      await Contents.checkoutHandler(Vcs.repository.commitList[chosenCommitId!].tree);
      RepositoryAreaLayout.createRepositoryArea();
      WorkingAreaLayout.createWorkingArea();
      // ハイライトを解除
      RepositoryAreaLayout.highlight = [];
    });
    return button;
  }

  /**
   * リポジトリエリアのボタンコンテナを作成する。
   * @returns 作成されたボタンコンテナのHTMLDivElement
   */

  private static buttonContainer(): HTMLDivElement {
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(RepositoryAreaLayout.createBranchButton());
    buttonContainer.appendChild(RepositoryAreaLayout.createCheckoutButton());
    return buttonContainer;
  }
}
