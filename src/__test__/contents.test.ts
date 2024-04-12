import { Contents } from "../class/contents";
import { Folder } from "../class/folder";
import { BlobFile } from "../class/blobFile";
global.crypto = require("crypto");

describe("Contents", () => {
  let rootFolder: Folder;

  beforeEach(async () => {
    rootFolder = await Contents.init();
  });

  test("フォルダにファイルを追加するテスト", async () => {
    const folder = await Folder.init("TestFolder", rootFolder);
    await Contents.addFile("TestFile", "", folder);
    expect(folder.contents).toHaveProperty("TestFile");
    expect(folder.contents["TestFile"]).toBeInstanceOf(BlobFile);
  });

  test("フォルダにフォルダを追加するテスト", async () => {
    const parentFolder = await Folder.init("ParentFolder", rootFolder);
    await Contents.addFolder("ChildFolder", parentFolder);

    expect(parentFolder.contents).toHaveProperty("ChildFolder");
    expect(parentFolder.contents["ChildFolder"]).toBeInstanceOf(Folder);
  });

  test("フォルダで特定のファイルやフォルダを検索するテスト", async () => {
    const parentFolder = await Folder.init("ParentFolder", rootFolder);
    const childFolder = await Folder.init("ChildFolder", parentFolder);
    const file = await BlobFile.init("TestFile.txt", "", parentFolder.name);

    parentFolder.insertContent(childFolder);
    parentFolder.insertContent(file);

    /*/
    parentFolder -> childFolder
    parentFolder -> file
    /*/
    const result1 = Contents.searchContent(childFolder, parentFolder);
    const result2 = Contents.searchContent(file, parentFolder);
    const result3 = Contents.searchContent(file, childFolder);

    expect(result1).toBe(childFolder);
    expect(result2).toBe(file);
    expect(result3).toBe(null);
  });

  test("階層を切り替えるメソッド - nextLevel", async () => {
    const parentFolder = await Folder.init("ParentFolder", null);
    const childFolder = await Folder.init("ChildFolder", parentFolder);
    Contents.nextLevel(parentFolder);
    expect(Contents.currentParent).toBe(parentFolder);

    Contents.nextLevel(childFolder);
    expect(Contents.currentParent).toBe(childFolder);
  });

  test("階層を切り替えるメソッド - prevLevel", async () => {
    const parentFolder = await Folder.init("ParentFolder", null);
    const childFolder = await Folder.init("ChildFolder", parentFolder);

    Contents.currentParent = childFolder;
    Contents.prevLevel();
    expect(Contents.currentParent).toBe(parentFolder);

    Contents.prevLevel();
    expect(Contents.currentParent).toBe(parentFolder);
  });
});
