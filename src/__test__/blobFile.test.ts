const crypto = require("crypto");
import { BlobFile } from "../class/blobFile";
import { describe, test, expect } from "vitest";
describe("dammyFileのテスト", () => {
  const files = new BlobFile("test", "goood");
  test("init", () => {
    expect(files.name).toBe("test");
    expect(files.text).toBe("goood");
    expect(files.id).toBe("");
    files.createId();
    expect(files.id).toBe(mockId(files.name, files.text));
  });
  test("updateTextメソッドのテスト", () => {
    files.updateText("this is test");
    expect(files.text).toBe("this is test");
    files.createId();
    expect(files.id).toBe(mockId(files.name, "this is test"));
  });
});

function mockId(name: string, text: string): string {
  const hash = crypto.createHash("sha1");
  hash.update(name + text);
  return hash.digest("hex");
}
