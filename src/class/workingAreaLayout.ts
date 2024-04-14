import { FormData, showModal } from "../util";
import { BlobFile } from "./blobFile";
import { Contents } from "./contents";
import { Folder } from "./folder";
import { Layout } from "./layout";
import { StagingAreaLayout } from "./stagingAreaLayout";
import { Vcs } from "./vcs";

export class WorkingAreaLayout {
  static activeContents: BlobFile | Folder | null = null;
  
  static buttonContainer(): HTMLDivElement {
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-Container");

    // フォルダ作成ボタンを作成
    const createFolderButton = document.createElement("button");
    createFolderButton.textContent = "フォルダ作成";
    createFolderButton.addEventListener("click", (event) => {
      event.preventDefault();
      showModal<folderData>("フォルダ作成", WorkingAreaLayout.createFolderModal(), {}, async (formData: FormData<folderData>) => {
        const nameInput = document.getElementById("folderName") as HTMLInputElement;
        formData.name = nameInput.value;
        await Contents.addFolder(formData.name, Contents.currentParent);
        WorkingAreaLayout.createWorkingArea();
      });
    });

    // ファイル作成ボタンを作成
    const createFileButton = document.createElement("button");
    createFileButton.textContent = "ファイル作成";
    createFileButton.addEventListener("click", (event) => {
      event.preventDefault();
      showModal<fileData>("ファイル作成", WorkingAreaLayout.createFileModal(), {}, async (formData: FormData<fileData>) => {
        const nameInput = document.getElementById("fileName") as HTMLInputElement;
        const textInput = document.getElementById("fileText") as HTMLInputElement;
        formData.name = nameInput.value;
        formData.text = textInput.value;
        await Contents.addFile(formData.name, formData.text, Contents.currentParent);
        WorkingAreaLayout.createWorkingArea();
      });
    });

    // ワーキングエリアでファイル操作ボタンを追加
    buttonContainer.appendChild(createFolderButton);
    buttonContainer.appendChild(createFileButton);
    return buttonContainer;
  }

  static fileDisplayArea() {
    const fileDisplayArea = document.createElement("div");
    fileDisplayArea.classList.add("file-display-area");
    const contents = Contents.currentParent.contents;
    if (Object.keys(contents).length == 0) {
      fileDisplayArea.innerHTML = `
          no file or folder
          `;
    }
    if (Contents.currentParent.name !== "root") {
      const backButton = document.createElement("button");
      backButton.textContent = "go back to prev level";
      backButton.addEventListener("click", () => {
        Contents.prevLevel();
        WorkingAreaLayout.createWorkingArea();
      });
      fileDisplayArea.appendChild(backButton);
    }
    for (const content in contents) {
      const fileEle = document.createElement("div");
      if (contents[content] instanceof BlobFile) {
        fileEle.innerHTML = `
        <p>${content}</p>
        <p>type::file</p>
        `;
      } else if (contents[content] instanceof Folder) {
        fileEle.innerHTML = `
        <p>${content}</p>
        <p>type::folder</p>
        `;
      }
      fileDisplayArea.appendChild(fileEle);

      // 各contentをダブルクリックしたときの処理
      fileEle.addEventListener("dblclick", () => {
        const item = contents[content];
        if (item instanceof Folder) {
          Contents.nextLevel(item);
          WorkingAreaLayout.createWorkingArea();
        } else if (item instanceof BlobFile) {
          showModal<fileData>("ファイル編集", WorkingAreaLayout.updateFileModal(item), {}, async (formData: FormData<fileData>) => {
            const textInput = document.getElementById("fileText") as HTMLInputElement;
            formData.text = textInput.value;
            const prevId = item.getId();
            await item.updateText(formData.text);
            await item.updateId();
            const newFile = item;
            Vcs.checkChangeFile(newFile, prevId);
            WorkingAreaLayout.createWorkingArea();
            StagingAreaLayout.createStagingArea();
          });
        }
      });

      // 各contentをクリックしたときの処理
      fileEle.addEventListener("click", () => {
        const activeElements = document.querySelectorAll(".file-display-area div");
        const isActiveElement = fileEle.classList.contains("active");

        // 要素のactive状態を切り替える
        activeElements.forEach((ele) => {
          ele.classList.remove("active");
        });
        fileEle.classList.toggle("active", !isActiveElement);

        if (!isActiveElement) {
          // 要素がactiveの場合、activeContentsに追加
          WorkingAreaLayout.activeContents = contents[content];
        } else {
          // 要素がactiveでない場合、activeContentsを削除
          WorkingAreaLayout.activeContents = null;
        }
      });
    }
    return fileDisplayArea;
  }

  static createWorkingArea(): HTMLDivElement {
    // 初期化する
    Layout.working.innerHTML = `
    <h3>Working</h3>
    <p>currentLevel::${Contents.currentParent.name}</p>
    `;
    Layout.working.appendChild(WorkingAreaLayout.fileDisplayArea());
    Layout.working.appendChild(WorkingAreaLayout.buttonContainer());
    return Layout.working;
  }

  static createFileModal() {
    // ファイル名入力欄を追加
    const form = document.createElement("form");
    const fileNameInput = document.createElement("input");
    fileNameInput.type = "text";
    fileNameInput.id = "fileName";
    fileNameInput.placeholder = "ファイル名";
    fileNameInput.required = true;
    form.appendChild(fileNameInput);
    // ファイルテキスト入力欄を追加
    const fileTextInput = document.createElement("textarea");
    fileTextInput.id = "fileText";
    fileTextInput.placeholder = "ファイルの内容";
    form.appendChild(fileTextInput);
    // 送信ボタンを追加
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "送信";
    form.appendChild(submitButton);
    return form;
  }

  static createFolderModal() {
    // フォルダ名入力欄を追加
    const form = document.createElement("form");
    const folderNameInput = document.createElement("input");
    folderNameInput.type = "text";
    folderNameInput.id = "folderName";
    folderNameInput.placeholder = "フォルダ名";
    folderNameInput.required = true;
    form.appendChild(folderNameInput);
    // 送信ボタンを追加
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "送信";
    form.appendChild(submitButton);
    return form;
  }

  static updateFileModal(item: BlobFile) {
    const form = document.createElement("form");
    const fileName = document.createElement("p");
    fileName.textContent = item.name;
    const fileTextInput = document.createElement("textarea");
    fileTextInput.id = "fileText";
    fileTextInput.innerText = item.text;
    form.appendChild(fileName);
    form.appendChild(fileTextInput);
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "更新";
    form.appendChild(submitButton);
    return form;
  }
}

interface fileData {
  name: string;
  text: string;
}

interface folderData {
  name: string;
}
