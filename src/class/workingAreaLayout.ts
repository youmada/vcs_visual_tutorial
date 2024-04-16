import { FormData, showModal } from "../util";
import { BlobFile } from "./blobFile";
import { Contents } from "./contents";
import { Folder } from "./folder";
import { Layout } from "./layout";
import { StagingAreaLayout } from "./stagingAreaLayout";
import { Vcs } from "./vcs";

/**
 * WorkingAreaLayoutクラスは、作業エリアのレイアウトを管理するクラスです。
 * フォルダやファイルの作成、表示、編集などの機能を提供します。
 */
export class WorkingAreaLayout {
  static activeContents: BlobFile | Folder | null = null;

  /**
   * フォルダ作成、ファイル作成のボタンを作成します。
   * @param text ボタンのテキスト
   * @param modalTitle モーダルのタイトル
   * @param modalContent モーダルの内容
   * @param onSubmit モーダルの送信ボタンを押したときの処理
   * @returns 作成されたボタンのHTMLButtonElement
   */
  private static createButton(text: string, modalTitle: string, modalContent: HTMLElement, onSubmit: (formData: FormData<any>) => Promise<void>) {
    const button = document.createElement("button");
    button.textContent = text;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      // ボタンクリックで、showModalを呼び出す。
      showModal<any>(modalTitle, modalContent, {}, onSubmit);
    });
    return button;
  }

  /**
   * モーダルのsubmitイベントで呼び出されるコールバック関数
   */
  private static async createFolderCallback(formData: FormData<folderData>) {
    // フォルダ名を取得
    const nameInput = document.getElementById("folderName") as HTMLInputElement;
    formData.name = nameInput.value;
    // フォルダを作成
    await Contents.addFolder(formData.name, Contents.currentParent);
    // フォルダを作成した後、WorkingAreaを再描画
    WorkingAreaLayout.createWorkingArea();
  }

  /**
   * モーダルのsubmitイベントで呼び出されるコールバック関数
   */
  private static async createFileCallback(formData: FormData<fileData>) {
    // ファイル名とファイルテキストを取得
    const nameInput = document.getElementById("fileName") as HTMLInputElement;
    const textInput = document.getElementById("fileText") as HTMLInputElement;
    formData.name = nameInput.value;
    formData.text = textInput.value;
    // ファイルを作成
    await Contents.addFile(formData.name, formData.text, Contents.currentParent);
    Vcs.changeFiles.push(Contents.folder.contents[formData.name] as BlobFile);
    // ファイルを作成した後、WorkingAreaを再描画
    WorkingAreaLayout.createWorkingArea();
    StagingAreaLayout.createStagingArea();
  }

  private static buttonContainer(): HTMLDivElement {
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-Container");

    // フォルダ作成のボタン
    const createFolderButton = WorkingAreaLayout.createButton(
      "フォルダ作成",
      "フォルダ作成",
      WorkingAreaLayout.createFolderModal(),
      WorkingAreaLayout.createFolderCallback
    );

    // ファイル作成のボタン
    const createFileButton = WorkingAreaLayout.createButton(
      "ファイル作成",
      "ファイル作成",
      WorkingAreaLayout.createFileModal(),
      WorkingAreaLayout.createFileCallback
    );

    // ボタンをボタンコンテナに追加
    buttonContainer.appendChild(createFolderButton);
    buttonContainer.appendChild(createFileButton);
    return buttonContainer;
  }

  /**
   * ファイル一覧を表示するエリアを作成します。
   * @returns 作成されたファイル一覧のHTMLDivElement
   */
  static fileDisplayArea() {
    const fileDisplayArea = document.createElement("div");
    fileDisplayArea.classList.add("file-display-area");
    const contents = Contents.currentParent.contents;

    // contentsが空の場合、ファイルやフォルダが存在しない旨を表示
    if (Object.keys(contents).length == 0) {
      fileDisplayArea.innerHTML = `
          no file or folder
          `;
    }
    // currentParentが、ルートディレクトリ以外の場合、一つ上の階層に戻るボタンを表示
    if (Contents.currentParent.name !== "root") {
      const backButton = document.createElement("button");
      backButton.textContent = "go back to prev level";
      backButton.addEventListener("click", () => {
        Contents.prevLevel();
        WorkingAreaLayout.createWorkingArea();
      });
      fileDisplayArea.appendChild(backButton);
    }
    // ファイルとフォルダを表示して、クリックイベントを付与
    WorkingAreaLayout.contentsClickEvent(contents, fileDisplayArea);

    return fileDisplayArea;
  }

  /**
   * それぞれのcontentにクリックイベントを付与する。
   * @param contents ContentsクラスのrootFolderにあるファイルとフォルダのオブジェクト
   * @param fileArea ファイルとフォルダを表示するdivEle
   */
  private static contentsClickEvent(contents: { [name: string]: Folder | BlobFile }, fileArea: HTMLDivElement) {
    // contentsの各要素を表示 contentsが存在しない場合は、何も表示しない
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
      fileArea.appendChild(fileEle);
      WorkingAreaLayout.boubleClickHandler(contents[content], fileEle);
      WorkingAreaLayout.singleClickHandler(contents[content], fileEle);
    }
  }

  /**
   * シングルクリック時のそれぞれの要素の挙動を設定するメソッド
   * @param ele フォルダかファイルの要素
   */

  private static singleClickHandler(content: BlobFile | Folder, ele: HTMLElement) {
    // 各contentをクリックしたときの処理
    // クリックした要素にactiveクラスを付与し、activeContentsにその要素を格納。クリックした要素をハイライトする。
    ele.addEventListener("click", () => {
      const activeElements = document.querySelectorAll(".file-display-area div");
      const isActiveElement = ele.classList.contains("active");

      // 要素のactive状態を切り替える
      activeElements.forEach((ele) => {
        ele.classList.remove("active");
      });
      ele.classList.toggle("active", !isActiveElement);

      if (!isActiveElement) {
        // 要素がactiveの場合、activeContentsに追加
        WorkingAreaLayout.activeContents = content;
      } else {
        // 要素がactiveでない場合、activeContentsを削除
        WorkingAreaLayout.activeContents = null;
      }
    });
  }

  /**
   * ダブルクリック時のそれぞれの要素の挙動を設定するメソッド
   * @param content FolderかBlobFileオブジェクト
   * @param ele html要素
   */

  private static boubleClickHandler(content: BlobFile | Folder, ele: HTMLElement) {
    // 各contentをダブルクリックしたときの処理
    ele.addEventListener("dblclick", () => {
      const item = content;
      if (item instanceof Folder) {
        // フォルダをダブルクリックした場合、そのフォルダにcurrentParentを変更して、WorkingAreaを再描画
        Contents.nextLevel(item);
        WorkingAreaLayout.createWorkingArea();
      } else if (item instanceof BlobFile) {
        // ファイルをダブルクリックした場合、そのファイルを編集するモーダルを表示。ファイル名は変更できない
        showModal<fileData>("ファイル編集", WorkingAreaLayout.updateFileModal(item), {}, async (formData: FormData<fileData>) => {
          const textInput = document.getElementById("fileText") as HTMLInputElement;
          formData.text = textInput.value;
          // ファイルを更新した場合、ID再生成と、changedFilesに追加。また、WorkingAreaとStagingAreaを再描画
          const prevId = item.getId();
          item.updateText(formData.text);
          await item.updateId();
          const newFile = item;
          Vcs.checkChangeFile(newFile, prevId);
          WorkingAreaLayout.createWorkingArea();
          StagingAreaLayout.createStagingArea();
        });
      }
    });
  }

  /**
   * WorkingAreaのレイアウトを作成。
   * 再描画する際にも使用できる。
   * @returns 作成されたWorkingAreaのHTMLDivElement
   */
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

  /**
   * ファイル作成時のモーダル内部の要素
   * @returns form要素を出力
   */
  private static createFileModal(): HTMLFormElement {
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

  private static createFolderModal() {
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

  /**
   * ファイル更新用のモーダルを作成します。
   * @param item 更新するファイルのインスタンス
   * @returns 作成されたファイル更新用モーダルのHTMLFormElement
   */
  private static updateFileModal(item: BlobFile): HTMLFormElement {
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

// ファイル作成時のフォームデータ
interface fileData {
  name: string;
  text: string;
}

// フォルダ作成時のフォームデータ
interface folderData {
  name: string;
}
