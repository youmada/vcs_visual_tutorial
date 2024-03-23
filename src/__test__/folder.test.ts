import { Folder } from "../class/Folder";
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
    expect(folder.id).toBe(createId("testFolder"));
    expect(folder.folders).toEqual({});
  });

  test("メソッドテスト", () => {
    folder.updateName("updateName");
    expect(folder.name).toBe("updateName");
    expect(folder.id).toBe(createId("updateName"));
    folder.createFile("file", "testFile");
    expect(folder.folders["file"]).toEqual(new BlobFile("file", "testFile", "updateName"));
    expect(folder.isCheckSameFile("file")).toBeTruthy;
    expect(folder.isCheckSameFile("undefined file")).toBeFalsy;
  });
});
