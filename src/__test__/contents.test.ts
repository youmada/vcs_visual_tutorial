import { Contents } from "../class/contents";
import { Folder } from "../class/folder";
import { BlobFile } from "../class/blobFile";
import { describe, test, expect, vi, beforeEach } from "vitest";
global.crypto = require("crypto");

describe("Contents", () => {
  let rootFolder: Folder;

  beforeEach(async () => {
    rootFolder = await Contents.init();
  });

  test("フォルダにファイルを追加するテスト", async () => {
    const folder = await Folder.init("TestFolder", "/");
    await Contents.addFile("TestFile.txt", "", folder);
    expect(folder.contents).toHaveProperty("TestFile.txt");
    expect(folder.contents["TestFile.txt"]).toBeInstanceOf(BlobFile);
  });

  test("フォルダにフォルダを追加するテスト", async () => {
    const parentFolder = await Folder.init("ParentFolder", "/");
    await Contents.addFolder("ChildFolder", parentFolder);

    expect(parentFolder.contents).toHaveProperty("ChildFolder");
    expect(parentFolder.contents["ChildFolder"]).toBeInstanceOf(Folder);
  });

  test("フォルダで特定のファイルやフォルダを検索するテスト", async () => {
    const parentFolder = await Folder.init("ParentFolder", "/");
    const childFolder = await Folder.init("ChildFolder", parentFolder.path);
    const file = await BlobFile.init("TestFile.txt", "", parentFolder.path);

    parentFolder.insertContent(childFolder);
    parentFolder.insertContent(file);

    console.log(parentFolder);
    const result1 = Contents.searchContent(childFolder, parentFolder);
    const result2 = Contents.searchContent(file, parentFolder);
    const result3 = Contents.searchContent(file, childFolder);

    expect(result1).toBe(childFolder);
    expect(result2).toBe(file);
    expect(result3).toBe(null);
  });
});
