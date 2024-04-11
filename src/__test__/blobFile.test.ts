import { BlobFile } from "../class/blobFile";
global.crypto = require("crypto");

describe("BlobFile", () => {
  let blobFile: BlobFile;

  beforeEach(async () => {
    blobFile = await BlobFile.init("test.txt", "This is a test file.", "path");
  });

  it("初期化テスト", () => {
    expect(blobFile.name).toBe("test.txt");
    expect(blobFile.text).toBe("This is a test file.");
    expect(blobFile.path).toBe("path");
    expect(blobFile.id).toMatch(/^[0-9a-f]{40}$/i);
  });
  it("updateTextメソッドのテスト", async () => {
    await blobFile.updateText("Updated text");
    expect(blobFile.text).toBe("Updated text");
  });

  it("updatePathメソッドのテスト", () => {
    blobFile.updatePath("newPath");
    expect(blobFile.path).toBe("newPath");
  });

  it("createIdメソッドのテスト", async () => {
    const id = await blobFile.createId();
    expect(id).toMatch(/^[0-9a-f]{40}$/i);
  });

  it("updateIdメソッドのテスト", async () => {
    const oldId = blobFile.id;
   await blobFile.updateText("Updated text");
    await blobFile.updateId();
    expect(blobFile.id).not.toBe(oldId);
  });

  it("getIdメソッドのテスト", () => {
    const id = blobFile.getId();
    expect(id).toBe(blobFile.id);
  });
});
