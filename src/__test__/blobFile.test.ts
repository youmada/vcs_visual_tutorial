
import { BlobFile } from "../class/blobFile";
import { describe, test, expect } from "vitest";
describe("BlobFileのテスト", () => {
  const files = new BlobFile("testFile", "goood", "testFolder");
  test("初期化テスト", () => {
    expect(files.name).toBe("testFile");
    expect(files.text).toBe("goood");
    expect(files.path).toBe("testFolder");
    expect(files.id).toBe(files.id);
  });
  test("メソッドのテスト", () => {
    files.updateText("this is test");
    expect(files.text).toBe("this is test");
    files.updatePath("updatePath");
  });
});
