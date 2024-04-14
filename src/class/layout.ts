import { toggleDisplay } from "../util";
import { StagingAreaLayout } from "./stagingAreaLayout";
import { WorkingAreaLayout } from "./workingAreaLayout";

/**
 * レイアウトクラス
 * アプリの全てのレイアウトを管理するクラス
 */
export class Layout {
  /**
   * vcs操作画面のメインのコンテナ要素
   * この要素に全ての要素を追加していく
   */
  static container = document.createElement("div");

  /**
   * vcs左側のコンテナ要素
   * この要素にリポジトリ要素を追加する
   */

  static leftContainer = document.createElement("div");

  /**
   * リポジトリ要素
   *  vcs操作画面の左側のコンテナ要素でもある
   */
  static repository = this.createVcsElement("Repository", "vcs-content");

  /**
   * vcs操作画面の右側のコンテナ要素
   */
  static rightContainer = document.createElement("div");

  /**
   * rightContainerの子要素。
   * ステージングエリア要素。
   */
  static staging = this.createVcsElement("Staging", "top");

  /**
   * rightContainerの子要素。
   * ワーキングエリア要素。
   */
  static working = this.createVcsElement("Working", "bottom");

  /**
   * VCS画面のコンテナ要素を作成するメソッド
   * @param text - 要素のテキスト
   * @param className - 要素のクラス名
   * @returns 作成されたHTMLDivElement
   */
  static createVcsElement(text: string, className: string): HTMLDivElement {
    const element = document.createElement("div");
    element.textContent = text;
    element.classList.add(className);
    return element;
  }

  /**
   * VCSページの初期化を行うメソッド
   * アプリのトップページを非表示にし、VCSページを表示する
   */
  static initVCSPage = () => {
    const initPageDiv = document.getElementById("initPage");
    const vcsPageDiv = document.getElementById("vcsPage");
    if (initPageDiv && vcsPageDiv) {
      toggleDisplay("initPage", false);
      toggleDisplay("vcsPage", true);
    }
  };

  /**
   * アプリのトップページの作成を行うメソッド
   */
  static initPage(): void {
    // initボタンの作成 および クリック時のイベントリスナーの追加
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

    // HTMLファイルにあるinitページに要素を追加
    const initPageDiv = document.getElementById("initPage");
    if (initPageDiv) {
      initPageDiv.appendChild(title);
      initPageDiv.appendChild(subTitle);
      initPageDiv.appendChild(initButton);
    }
  }

  /**
   * VCSページのレイアウトを作成するメソッド
   * ページを初期化時に一度だけ呼び出す
   * ページ更新にはupdateVcsPageを使用する
   */
  static createVcsPageLayout(): void {
    // vcsページに必要なレイアウト要素の作成
    // vcsページ全体をラップする
    Layout.container.classList.add("container");

    // 左側のコンテンツのラップ
    Layout.leftContainer.classList.add("left");
    // 右側のコンテンツのラップ
    Layout.rightContainer.classList.add("right");

    const vcsPageDiv = document.getElementById("vcsPage");
    if (vcsPageDiv) {
      // 新しい内容を追加
      // left container
      Layout.container.appendChild(Layout.leftContainer);
      Layout.leftContainer.appendChild(Layout.repository);
      // right container
      Layout.container.appendChild(Layout.rightContainer);
      Layout.rightContainer.appendChild(StagingAreaLayout.createStagingArea());
      Layout.rightContainer.appendChild(WorkingAreaLayout.createWorkingArea());

      // vcsページに要素を追加
      vcsPageDiv.appendChild(Layout.container);
    }
  }

  /**
   * VCSページを更新するメソッド
   */
  static updateVcsPage(): void {
    // vcsページに必要なレイアウト要素の作成
    // vcsページ全体をラップする
    Layout.container.classList.add("container");

    // 左側のコンテンツのラップ
    Layout.leftContainer.classList.add("left");
    // 右側のコンテンツのラップ
    Layout.rightContainer.classList.add("right");

    // VCSページの要素を取得
    const vcsPageDiv = document.getElementById("vcsPage");

    if (vcsPageDiv) {
      // 既存の内容をクリア
      vcsPageDiv.innerHTML = "";
      // 新しい内容を追
      Layout.container.appendChild(Layout.leftContainer);
      Layout.leftContainer.appendChild(Layout.repository);
      Layout.container.appendChild(Layout.rightContainer);
      Layout.rightContainer.appendChild(StagingAreaLayout.createStagingArea());
      Layout.rightContainer.appendChild(WorkingAreaLayout.createWorkingArea());
      vcsPageDiv.appendChild(Layout.container);
    }
  }
}
