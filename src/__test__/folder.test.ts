import { Folder } from "../class/folder.ts";
import { BlobFile } from "../class/blobFile.ts";

describe("Folderクラスのテスト", () => {
  let rootFolder: Folder;
  let folder: Folder;

  beforeEach(async () => {
    rootFolder = await Folder.init("root", null);
    folder = await Folder.init("testFolder", rootFolder);
  });

  test("初期化テスト", () => {
    expect(folder.name).toBe("testFolder");
    expect(folder.parent).toBe(rootFolder);
    expect(folder.getId()).toMatch(/^[0-9a-f]{40}$/i);
    expect(folder.contents).toEqual({});
  });

  test("updateName()のテスト", () => {
    folder.updateName("updateName");
    expect(folder.name).toBe("updateName");
  });

  test("insertContent()のテスト", async () => {
    const file = await BlobFile.init("file", "テスト", "updatePath");
    folder.insertContent(file);
    expect(folder.contents["file"]).toEqual(file);
    expect(folder.isCheckSame("file")).toBeFalsy();
    expect(folder.isCheckSame("undefined file")).toBeTruthy();
  });

  test("deleteContent()のテスト", async () => {
    const file = await BlobFile.init("file", "テスト", rootFolder.name);
    folder.insertContent(file);
    folder.deleteContent("file");
    expect(folder.contents["file"]).toBeUndefined();
  });

  test("createId()のテスト", async () => {
    const id = await folder.createId();
    expect(id).toMatch(/^[0-9a-f]{40}$/i);
  });

  test("getId()のテスト", () => {
    const id = folder.getId();
    expect(id).toMatch(/^[0-9a-f]{40}$/i);
  });
});
