import { Folder } from "../class/folder";
import { describe, test, expect } from "vitest";
import { BlobFile } from "../class/blobFile";
global.crypto = require("crypto");

describe("Folderクラスのテスト", async () => {
  const folder = await Folder.init("testFolder", "root");
  test("初期化テスト", () => {
    expect(folder.name).toBe("testFolder");
    expect(folder.path).toBe("root");
    expect(folder.getId()).toBeTypeOf("string");
    expect(folder.contents).toEqual({});
  });

  test("メソッドテスト", async () => {
    // updateName()のテスト
    folder.updateName("updateName");
    expect(folder.name).toBe("updateName");

    //createFile()のテスト
    const file = await BlobFile.init("file", "テスト", "updatePath");
    folder.insertContent(file);
    expect(folder.contents["file"]).toEqual(file);
    expect(folder.isCheckSame("file")).toBeTruthy;
    expect(folder.isCheckSame("undefined file")).toBeFalsy;

    //createFolder()のテスト
    const folder2 = await Folder.init("folder2", "updatePath");
    folder.insertContent(folder2);
    expect(folder.contents["folder2"]).toEqual(folder2);
    expect(folder.isCheckSame("folder2")).toBeTruthy;
    expect(folder.isCheckSame("undefined file")).toBeTruthy;

    //updatePath()のテスト
    folder.updatePath("secondUpdate");
    expect(folder.path).toBe("secondUpdate");
  });
});
