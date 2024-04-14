// /**
//  * @jest-environment jsdom
//  */
// import { WorkingAreaLayout } from "../class/workingAreaLayout";
// import { Contents } from "../class/contents";
// import { BlobFile } from "../class/blobFile";
// import { Folder } from "../class/folder";
// import { Layout } from "../class/layout";
// import { showModal } from "../util";
// import { StagingAreaLayout } from "../class/stagingAreaLayout";

// describe("WorkingAreaLayoutクラスのテスト", () => {
//   beforeEach(() => {
//     Contents.init();
//     jest.resetAllMocks();
//     document.body.innerHTML = `
//       <div id="workingArea"></div>
//     `;
//     Layout.working = document.getElementById("workingArea")! as HTMLDivElement;
//   });

//   afterEach(() => {
//     document.body.innerHTML = "";
//   });

//   describe("fileDisplayAreaメソッドのテスト", () => {
//     it("ファイル一覧エリアが正しく作成されること", () => {
//       const fileDisplayArea = WorkingAreaLayout.fileDisplayArea();

//       expect(fileDisplayArea.classList.contains("file-display-area")).toBe(true);
//       expect(fileDisplayArea.children.length).toBe(0);
//     });

//     it("ファイル一覧エリアにファイルとフォルダが表示されること", async () => {
//       const folder = await Folder.init("テストフォルダ", Contents.currentParent);
//       const file = await BlobFile.init("テストファイル", "テストテキスト", Contents.currentParent.name);
//       Contents.currentParent.contents = {
//         テストフォルダ: folder,
//         テストファイル: file,
//       };

//       const fileDisplayArea = WorkingAreaLayout.fileDisplayArea();

//       expect(fileDisplayArea.children.length).toBe(2);
//       expect(fileDisplayArea.children[0].textContent).toContain("テストフォルダ");
//       expect(fileDisplayArea.children[1].textContent).toContain("テストファイル");
//     });

//     it("ファイル一覧エリアに戻るボタンが表示されること", () => {
//       Contents.currentParent.name = "root";

//       const fileDisplayArea = WorkingAreaLayout.fileDisplayArea();

//       expect(fileDisplayArea.children.length).toBe(1);
//       expect(fileDisplayArea.children[0].textContent).toContain("go back to prev level");
//     });

//     it("ファイル一覧エリアのファイルクリックイベントが正しく動作すること", async () => {
//       const folder = await Folder.init("テストフォルダ", Contents.currentParent);
//       const file = await BlobFile.init("テストファイル", "テストテキスト", Contents.currentParent.name);
//       Contents.currentParent.contents = {
//         テストフォルダ: folder,
//         テストファイル: file,
//       };
//       const fileDisplayArea = WorkingAreaLayout.fileDisplayArea();
//       const fileElement = document.createElement("div");
//       fileDisplayArea.appendChild(fileElement);

//       fileElement.click();
//       // アクティブ化
//       expect(fileElement.classList.contains("active")).toBe(true);
//       expect(WorkingAreaLayout.activeContents).toBe(file);

//       fileElement.click();
//       // 非アクティブ化
//       expect(fileElement.classList.contains("active")).toBe(false);
//       expect(WorkingAreaLayout.activeContents).toBe(null);
//     });

//     it("ファイル一覧エリアのフォルダダブルクリックイベントが正しく動作すること", async () => {
//       const folder = await Folder.init("テストフォルダ", Contents.currentParent);
//       Contents.currentParent.contents = {
//         テストフォルダ: folder,
//       };
//       const fileDisplayArea = WorkingAreaLayout.fileDisplayArea();
//       const folderElement = document.createElement("div");
//       fileDisplayArea.appendChild(folderElement);
//       Contents.nextLevel = jest.fn();
//       WorkingAreaLayout.createWorkingArea = jest.fn();

//       folderElement.dispatchEvent(new MouseEvent("dblclick"));

//       expect(Contents.nextLevel).toHaveBeenCalledWith(folder);
//       expect(WorkingAreaLayout.createWorkingArea).toHaveBeenCalled();
//     });

//     it("ファイル一覧エリアのファイルダブルクリックイベントが正しく動作すること", async () => {
//       const file = await BlobFile.init("テストファイル", "テストテキスト", Contents.currentParent.name);
//       Contents.currentParent.contents = {
//         テストファイル: file,
//       };
//       WorkingAreaLayout.fileDisplayArea();
//       const fileElement = document.getElementsByTagName("p")[0];

//       fileElement.dispatchEvent(new MouseEvent("dblclick"));
//       // 更新前のファイルIDを取得
//       const prevId = file.getId();

//       expect(showModal).toHaveBeenCalled();
//       const form = document.querySelector("form")!;
//       const textInput = document.getElementById("fileText")!;
//       textInput.textContent = "更新テキスト";
//       form.dispatchEvent(new MouseEvent("submit"));
//       const newFile = file;
//       expect(WorkingAreaLayout.createWorkingArea()).toHaveBeenCalled();
//       expect(StagingAreaLayout.createStagingArea()).toHaveBeenCalled();

//       // ファイルが更新されたか確認
//       expect(newFile.getId()).not.toBe(prevId);
//       expect(WorkingAreaLayout.activeContents).toBe(newFile);
//     });
//   });

//   describe("createWorkingAreaメソッドのテスト", () => {
//     it("WorkingAreaが正しく作成されること", () => {
//       const workingArea = WorkingAreaLayout.createWorkingArea();
//       expect(workingArea.children.length).toBe(2);
//       expect(workingArea.children[0].classList.contains("file-display-area")).toBe(true);
//       expect(workingArea.children[1].classList.contains("button-Container")).toBe(true);
//       expect(workingArea.children[1].children.length).toBe(2);
//     });
//   });
// });
