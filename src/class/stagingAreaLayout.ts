import { FormData, showModal } from "../util";
import { Layout } from "./layout";
import { Vcs } from "./vcs";

class StagingAreaLayout {
  static createStagingArea(): HTMLDivElement {
    // Staging area title
    const title = document.createElement("h3");
    title.classList.add("area-title");
    title.textContent = "Staging";

    // File display area
    const fileDisplayArea = StagingAreaLayout.fileDisplayArea();
    // Append elements to staging area
    Layout.staging.innerHTML = "";
    Layout.staging.appendChild(title);
    Layout.staging.appendChild(fileDisplayArea);

    return Layout.staging;
  }

  static createButton(text: string, fn: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = text;
    button.addEventListener("click", fn);
    return button;
  }

  static fileDisplayArea() {
    const container = document.createElement("div");
    container.classList.add("split-container");

    // stagedFileを表示するHTML要素作成
    const stagedFileArea = document.createElement("div");
    stagedFileArea.classList.add("split-item");
    stagedFileArea.innerHTML = `
    <p>staging</p>
    `;
    const commitBtn = StagingAreaLayout.createButton("commit", () => {
      // モーダルの内容となる要素を作成
      const modalContent = StagingAreaLayout.commitMessageModal();
      // モーダルを表示
      showModal<commitData>("Commit Message", modalContent, {}, async (formData: FormData<commitData>) => {
        // コミットメッセージを取得
        const commitMessage = formData.message;

        // コミットを実行
        if (commitMessage) Vcs.repository.commit(commitMessage);
      });
    });
    stagedFileArea.appendChild(commitBtn);

    // changedFileを表示するHTML要素を作成
    const changedFileArea = document.createElement("div");
    changedFileArea.classList.add("split-item");
    changedFileArea.innerHTML = `
    <p>change files</p>
    `;
    const changeFilesDiv = document.createElement("div");
    for (const file of Vcs.changeFiles) {
      const fileEle = document.createElement("div");
      fileEle.innerHTML = `
        <p>${file.name}</p>
        `;
      changeFilesDiv.appendChild(fileEle);
    }
    changedFileArea.appendChild(changeFilesDiv);
    const stagedBtn = StagingAreaLayout.createButton("staged", () => {
      Vcs.repository.stage(Vcs.changeFiles);
    });

    changedFileArea.appendChild(stagedBtn);

    container.append(stagedFileArea, changedFileArea);
    return container;
  }

  static commitMessageModal(): HTMLInputElement {
    const commitMessageInput = document.createElement("input");
    commitMessageInput.type = "text";
    commitMessageInput.required = true;
    commitMessageInput.placeholder = "Enter commit message";
    return commitMessageInput;
  }
}
export default StagingAreaLayout;

interface commitData {
  message: string;
}
