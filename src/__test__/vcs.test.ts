import { Vcs } from "../class/vcs";
import { BlobFile } from "../class/blobFile";
import { Folder } from "../class/folder";
import { Contents } from "../class/contents";
global.crypto = require("crypto");

describe("Vcsクラスのテスト", () => {
  let file: BlobFile;
  let folder: Folder;

  beforeEach(async () => {
    await Contents.init();
    await Contents.addFile("file", "content", Contents.currentParent);
    file = Contents.folder.contents["file"] as BlobFile;
    folder = Contents.folder;
    Vcs.repository.index.stagedFiles = {};
    Vcs.changeFiles = [];
  });

  it("同じファイルが存在する場合の挙動", () => {
    Vcs.repository.stage([file]);
    const result = Vcs.checkSameFile(file);
    expect(result).toBe(file);
  });

  it("同じファイルが存在しない場合の挙動", () => {
    const result = Vcs.checkSameFile(file);
    expect(result).toBeNull();
  });

  it("ファイルが変更された場合、changeFilesプロパティにファイルが追加される", () => {
    // 手動でchangeFilesにファイルを追加
    Vcs.changeFiles[0] = file;
    // 手動でファイルをContentsクラスに追加
    Contents.folder.contents["file"] = file;
    const prevId = file.getId();
    file.updateText("update content");
    file.updateId();
    Vcs.checkChangeFile(file, prevId);

    expect(Vcs.changeFiles).toContain(file);
  });

  it("ファイルが変更されていない場合、changeFilesプロパティにファイルが追加されない", () => {
    // 手動でファイルをContentsクラスに追加
    Contents.folder.contents["file"] = file;
    const prevId = file.getId();

    Vcs.checkChangeFile(file, prevId);

    expect(Vcs.changeFiles).not.toContain(file);
  });

  it("指定された名前とIDを持つファイルが見つかった場合、ファイルが返されること", () => {
    const id = file.getId();

    folder.contents[file.name] = file;

    const result = Vcs.searchChangeFile(file, id, folder);

    expect(result).toBe(file);
  });

  it("指定された名前とIDを持つファイルが見つからない場合、nullが返されること", () => {
    const id = "dammyId";

    folder.contents[file.name] = file;

    const result = Vcs.searchChangeFile(file, id, folder);

    expect(result).toBeNull();
  });
});
