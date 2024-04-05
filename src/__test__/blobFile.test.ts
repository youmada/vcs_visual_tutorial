import { BlobFile } from "../class/blobFile";
global.crypto = require("crypto");
import { describe, test, expect } from "vitest";
describe("BlobFileのテスト", async () => {
  const files: BlobFile = await BlobFile.init("testFile", "goood", "testFolder");
  test("初期化テスト", () => {
    expect(files.name).toBe("testFile");
    expect(files.text).toBe("goood");
    expect(files.path).toBe("testFolder");
    expect(files.getId()).toBeTypeOf("string");
  });
  test("メソッドのテスト", () => {
    files.updateText("this is test");
    expect(files.text).toBe("this is test");
    files.updatePath("updatePath");
  });
});
