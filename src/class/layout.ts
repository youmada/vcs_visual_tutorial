import { toggleDisplay } from "../util";
import StagingAreaLayout from "./stagingAreaLayout";
import { WorkingAreaLayout } from "./workingAreaLayout";

export class Layout {
  static rightContainer = document.createElement("div");
  static container = document.createElement("div");
  static repository = this.createVcsElement("Repository", "left");
  static staging = this.createVcsElement("Staging", "top");
  static working = this.createVcsElement("Working", "bottom");

  static createVcsElement(text: string, className: string): HTMLDivElement {
    const element = document.createElement("div");
    element.textContent = text;
    element.classList.add(className);
    return element;
  }

  static initVCSPage = () => {
    const initPageDiv = document.getElementById("initPage");
    const vcsPageDiv = document.getElementById("vcsPage");
    if (initPageDiv && vcsPageDiv) {
      toggleDisplay("initPage", false);
      toggleDisplay("vcsPage", true);
    }
  };

  static initPage(): void {
    // initボタンの作成
    const initButton = document.createElement("button");
    initButton.textContent = "Init";
    initButton.addEventListener("click", () => Layout.initVCSPage());
    initButton.style.display = "block";
    initButton.style.margin = "auto";

    // タイトル作成
    const title = document.createElement("h1");
    title.textContent = "VVT";
    title.style.textAlign = "center";

    // サブタイトル作成
    const subTitle = document.createElement("p");
    subTitle.textContent = "VCS Visual Tutorial";
    subTitle.style.textAlign = "center";

    const initPageDiv = document.getElementById("initPage");
    if (initPageDiv) {
      initPageDiv.appendChild(title);
      initPageDiv.appendChild(subTitle);
      initPageDiv.appendChild(initButton);
    }
  }

  static createVcsPageLayout(): void {
    // vcsページに必要なレイアウト要素の作成
    // vcsページ全体をラップする
    Layout.container.classList.add("container");

    // 右側のコンテンツのラップ

    Layout.rightContainer.classList.add("right");

    const vcsPageDiv = document.getElementById("vcsPage");
    if (vcsPageDiv) {
      // 前のコンテンツがあった場合に削除する
      Layout.container.appendChild(Layout.repository);
      Layout.container.appendChild(Layout.rightContainer);
      Layout.rightContainer.appendChild(StagingAreaLayout.createStagingArea());
      Layout.rightContainer.appendChild(WorkingAreaLayout.createWorkingArea());
      vcsPageDiv.appendChild(Layout.container);
    }
  }

  static updateVcsPage(): void {
    // VCSページの要素を取得
    const vcsPageDiv = document.getElementById("vcsPage");

    if (vcsPageDiv) {
      // 既存の内容をクリア
      vcsPageDiv.innerHTML = "";

      // 新しいレイアウト要素を作成
      Layout.container = document.createElement("div");
      Layout.container.classList.add("container");

      Layout.rightContainer = document.createElement("div");
      Layout.rightContainer.classList.add("right");

      Layout.repository = document.createElement("div"); // 仮にdiv要素を作成します。実際には適切な要素を作成してください。

      // 新しい内容を追加
      Layout.container.appendChild(Layout.repository);
      Layout.container.appendChild(Layout.rightContainer);
      Layout.rightContainer.appendChild(StagingAreaLayout.createStagingArea());
      Layout.rightContainer.appendChild(WorkingAreaLayout.createWorkingArea());
      vcsPageDiv.appendChild(Layout.container);
    }
  }
}
