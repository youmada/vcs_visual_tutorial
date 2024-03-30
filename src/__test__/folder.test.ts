import { Folder } from "../class/folder";
import { describe, test, expect } from "vitest";
import { BlobFile } from "../class/blobFile";
const crypto = require("crypto");
function createId(text: string): string {
  const hash = crypto.createHash("sha1");
  hash.update(text);
  return hash.digest("hex");
}

describe("Folderクラスのテスト", () => {
  const folder = new Folder("testFolder");
  test("初期化テスト", () => {
    expect(folder.name).toBe("testFolder");
    expect(folder.path).toBe("/");
    expect(folder.id).toBe(createId("testFolder"));
    expect(folder.contents).toEqual({});
  });

  test("メソッドテスト", () => {
    // updateName()のテスト
    folder.updateName("updateName");
    expect(folder.name).toBe("updateName");

    //createFile()のテスト
    folder.createFile("file", "testFile");
    expect(folder.contents["file"]).toEqual(new BlobFile("file", "testFile", "updateName"));
    expect(folder.isCheckSame("file")).toBeTruthy;
    expect(folder.isCheckSame("undefined file")).toBeFalsy;

    //createFolder()のテスト
    folder.createFolder("folder2");
    expect(folder.contents["folder2"]).toEqual(new Folder("folder2", "updateName"));
    expect(folder.isCheckSame("folder2")).toBeTruthy;
    expect(folder.isCheckSame("undefined file")).toBeTruthy;

    //updatePath()のテスト
    folder.updatePath("secondUpdate");
    expect(folder.contents["file"].path).toBe("secondUpdate");
    expect(folder.contents["folder2"].path).toBe("secondUpdate");
  });
});
