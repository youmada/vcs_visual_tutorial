import { toggleDisplay } from "../util";

export class Layout {
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

  static initProcess(): void {
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
    const repository = this.createVcsElement("Repository", "left");
    const staging = this.createVcsElement("Staging", "top");
    const working = this.createVcsElement("Working", "bottom");

    // vcsページ全体をラップする
    const container = document.createElement("div");
    container.classList.add("container");

    // 右側のコンテンツのラップ
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("right");

    const vcsPageDiv = document.getElementById("vcsPage");
    if (vcsPageDiv) {
      // 前のコンテンツがあった場合に削除する
      vcsPageDiv.innerHTML = "";

      container.appendChild(repository);
      container.appendChild(rightContainer);
      rightContainer.appendChild(staging);
      rightContainer.appendChild(working);

      vcsPageDiv.appendChild(container);
    }
  }
}
