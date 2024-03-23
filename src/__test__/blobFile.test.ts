const crypto = require("crypto");
import { BlobFile } from "../class/blobFile";
import { describe, test, expect } from "vitest";
describe("BlobFileのテスト", () => {
  const files = new BlobFile("testFile", "goood", "testFolder");
  test("init", () => {
    expect(files.name).toBe("testFile");
    expect(files.text).toBe("goood");
    expect(files.path).toBe("testFolder");
    expect(files.id).toBe("");
    files.createId();
    expect(files.id).toBe(mockId(files.name, files.text, files.path));
  });
  test("メソッドのテスト", () => {
    files.updateText("this is test");
    expect(files.text).toBe("this is test");
    files.updatePath("updatePath");
    files.createId();
    expect(files.id).toBe(mockId(files.name, "this is test", "updatePath"));
  });
});

function mockId(name: string, text: string, path: string): string {
  const hash = crypto.createHash("sha1");
  hash.update(name + text + path);
  return hash.digest("hex");
}
