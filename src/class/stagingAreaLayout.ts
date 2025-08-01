import { FormData, showModal } from "../util.ts";
import { Layout } from "./layout.ts";
import { RepositoryAreaLayout } from "./repositoryAreaLayout.ts";
import { Vcs } from "./vcs.ts";

/**
 * ステージングエリアのレイアウトを管理するクラス。
 */

export class StagingAreaLayout {
  /**
   * ステージングエリアを作成します。
   * @returns 作成されたステージングエリアのHTMLDivElement
   */
  static createStagingArea(): HTMLDivElement {
    // ステージングエリアのタイトルを作成
    const title = document.createElement("h3");
    title.classList.add("area-title");
    title.textContent = "ステージング";

    // ファイル表示エリアを作成
    const fileDisplayArea = StagingAreaLayout.fileDisplayArea();

    // 要素をステージングエリアに追加
    Layout.staging.innerHTML = "";
    Layout.staging.appendChild(title);
    Layout.staging.appendChild(fileDisplayArea);

    return Layout.staging;
  }

  /**
   * テキストとクリックイベントハンドラを指定してボタンを作成します。
   * @param text ボタンに表示するテキスト
   * @param fn ボタンがクリックされたときに実行される関数
   * @returns 作成されたボタンのHTMLButtonElement
   */
  static createButton(text: string, fn: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("button");
    button.textContent = text;
    button.addEventListener("click", fn);
    return button;
  }

  /**
   * ファイル表示エリアを作成します。
   * @returns 作成されたファイル表示エリアのHTMLDivElement
   */
  static fileDisplayArea() {
    const container = document.createElement("div");
    container.classList.add("split-container");

    // ステージングされたファイルを表示するエリアを作成
    const stagedFileArea = document.createElement("div");
    stagedFileArea.classList.add("split-item");
    stagedFileArea.innerHTML = `
    <p>ステージング</p>
    `;

    // コミットボタンを作成
    stagedFileArea.appendChild(StagingAreaLayout.commitBtn());

    // ステージングエリアにあるファイルを表示
    const stagedFilesDiv = document.createElement("div");
    for (const key in Vcs.repository.index.stagedFiles) {
      const file = Vcs.repository.index.stagedFiles[key];
      const fileEle = document.createElement("div");
      fileEle.innerHTML = `
        <p class="file">${file.name}</p>
        `;
      stagedFilesDiv.appendChild(fileEle);
    }
    stagedFileArea.appendChild(stagedFilesDiv);

    // 変更されたファイルを表示するエリアを作成
    const changedFileArea = document.createElement("div");
    changedFileArea.classList.add("split-item");
    changedFileArea.innerHTML = `
    <p>変更ファイル</p>
    `;

    const changeFilesDiv = document.createElement("div");
    for (const file of Vcs.changeFiles) {
      const fileEle = document.createElement("div");
      fileEle.innerHTML = `
        <p class="file">${file.name}</p>
        `;
      changeFilesDiv.appendChild(fileEle);
    }
    changedFileArea.appendChild(changeFilesDiv);

    // ステージングボタンを作成
    changedFileArea.appendChild(StagingAreaLayout.stagedBtn());

    container.append(stagedFileArea, changedFileArea);
    return container;
  }

  /**
   * コミットメッセージのモーダルを作成します。
   * @returns 作成されたコミットメッセージのモーダルのHTMLFormElement
   */
  private static commitMessageModal(): HTMLFormElement {
    const form = document.createElement("form");
    const commitMessageInput = document.createElement("input");
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = "コミット";
    commitMessageInput.type = "text";
    commitMessageInput.id = "commitMessage";
    commitMessageInput.required = true;
    commitMessageInput.placeholder = "コミットメッセージを入力してください";
    form.appendChild(commitMessageInput);
    form.appendChild(submitBtn);
    return form;
  }

  /**
   * コミットボタンを作成します。
   * @returns 作成されたコミットボタンのHTMLButtonElement
   */
  private static commitBtn() {
    return StagingAreaLayout.createButton("コミット", () => {
      // ステージングエリアにあるファイルがない場合、エラーを表示
      if (Object.keys(Vcs.repository.index.stagedFiles).length === 0) {
        alert("ステージングエリアにファイルがありません");
        return;
      }
      // 過去のコミットにチェックアウトしている時にブランチを作っていない状態でコミットしようとした場合。エラーを表示。
      const currentCommit = Vcs.repository.head; // 現在のコミットID
      // 現在のコミットに子コミットが存在するかどうか
      const isParentCommitId = Object.values(Vcs.repository.commitList).some((commit) => commit.getParentId() === currentCommit);
      if (isParentCommitId) {
        alert("過去のコミットから新しくコミットする際は、ブランチを作成してください");
        return;
      }
      // コミットメッセージのモーダルを表示
      showModal<commitData>("コミットメッセージ", StagingAreaLayout.commitMessageModal(), {}, async (formData: FormData<commitData>) => {
        // コミットメッセージを取得
        const message = document.getElementById("commitMessage") as HTMLInputElement;
        formData.message = message.value;

        // コミットを実行
        if (formData.message) {
          await Vcs.repository.commit(formData.message);
          StagingAreaLayout.createStagingArea();
          RepositoryAreaLayout.createRepositoryArea();
        }
      });
    });
  }

  /**
   * ステージングボタンを作成します。
   * @returns 作成されたステージングボタンのHTMLButtonElement
   */
  private static stagedBtn() {
    return StagingAreaLayout.createButton("ステージング", () => {
      Vcs.repository.stage(Vcs.changeFiles);
      Vcs.changeFiles = [];
      StagingAreaLayout.createStagingArea();
    });
  }
}

interface commitData {
  message: string;
}
