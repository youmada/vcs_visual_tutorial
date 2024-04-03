import { describe, test, expect, vi } from "vitest";
import { Repository } from "../class/repository";
import { Folder } from "../class/folder";
import { Index } from "../class";
import { BlobFile } from "../class/blobFile";
import { Commit } from "../class/commit";
import { Tree } from "../class/tree";

describe("Repositoryクラスのテスト", () => {
  const repository = new Repository();

  test("初期化テスト", () => {
    const folder = new Folder("root");
    const index = new Index();
    expect(repository.rootFolder).toEqual(folder);
    expect(repository.index).toEqual(index);
    expect(repository.head).toBe(null);
    expect(repository.commitList).toEqual({});
    expect(repository.fileList).toEqual({});
    expect(repository.treeList).toEqual({});
  });

  test("ステージングテスト", () => {
    const index = new Index();
    const file = new BlobFile("file1", "test text1");
    index.addStage([file]);
    repository.stage([file]);
    expect(repository.index.stagedFiles).toEqual(index.stagedFiles);
    repository.unstage(file);
    expect(repository.index.stagedFiles).toEqual({});
    repository.stage([file]);
    expect(repository.index.stagedFiles).toEqual(index.stagedFiles);
    repository.resetStage();
    expect(repository.index.stagedFiles).toEqual({});
  });

  test("masterブランチ作成と切り替えテスト", () => {
    const file = new BlobFile("file", "test");
    file.createId();
    repository.stage([file]);
    repository.addFolder(file);
    expect(repository.branchList).toEqual({});
    const commitID = repository.commit("test commit");
    expect(repository.branchList).toEqual({ master: commitID });
    expect(repository.currentBranch).toEqual("master");
    const branchHead = repository.createBranch("testBranch", commitID);
    expect(repository.branchList).toMatchObject({ testBranch: branchHead });
    repository.checkOut("testBranch");
    const newFile = new BlobFile("checkoutTestFile", "checkout");
    newFile.createId();
    repository.addFolder(newFile);
    repository.stage([newFile]);
    repository.commit("チェックアウトのテスト");
    expect(repository.currentBranch).toEqual("testBranch");
    repository.checkOut("master");
    expect(repository.currentBranch).toEqual("master");
    repository.checkOut("testBranch");
  });

  test("コミットのテスト", () => {
    const file = new BlobFile("file1", "test text1");
    file.createId();
    repository.stage([file]);
    // 通常ではファイルを作成してからステージングするので、rootFolderには何かしらのファイルが存在している。今回は自分で作成する必要がある。
    repository.addFolder(file);
    const commitID = repository.commit("test commit 1");
    const commit = repository.commitList[commitID];
    expect(commit).toBeInstanceOf(Commit);
    expect(repository.index).toBeInstanceOf(Index);
    expect(commit.message).toBe("test commit 1");
    expect(commit.tree).toBeInstanceOf(Tree);
    expect(Object.values(repository.treeList)).toContainEqual(commit.tree);
    expect(repository.head).toEqual(commitID);
  });

  test("複数回コミットテスト", () => {
    const file2 = new BlobFile("file2", "test text2");
    file2.createId();
    repository.stage([file2]);
    repository.addFolder(file2);
    const commitID = repository.commit("test commit 2");
    const commit = repository.commitList[commitID];
    expect(commit.message).toBe("test commit 2");
    expect(Object.values(repository.treeList)).toContainEqual(commit.tree);
    expect(repository.head).toEqual(commitID);
    expect(commit.parentCommitId).toBeTruthy;
    expect(repository.commitList[commit.parentCommitId!]).toBeInstanceOf(Commit);
  });

  //   test("マージテスト コンフリクトなし", () => {
  //     repository.checkOut("master");
  //     expect(repository.currentBranch).toEqual("master");
  //     repository.checkOut("testBranch");
  //     expect(repository.currentBranch).toEqual("testBranch");
  //     repository.merge("master");
  //     expect(repository.currentBranch).toEqual("master");
  //     expect(repository.index).toBeInstanceOf(Index);
  //     expect(Object.keys(repository.commitList)).toHaveLength(5);
  //   });

  //   test("マージテスト コンフリクトあり", () => {
  //     //マスターブランチから新しいブランチを作成
  //     repository.checkOut("master");
  //     repository.createBranch("conflictBranch", repository.head!);
  //     expect(repository.currentBranch).toEqual("conflictBranch");

  //     // ファイルの変更をコミット
  //     repository.checkOut("conflictBranch");
  //     const fileID = Object.values(repository.rootFolder.contents).find((file) => file.name == "file2")?.id;
  //     const file = repository.rootFolder.contents[fileID!];
  //     if (file instanceof BlobFile) {
  //       repository.updateRootFolder(file.id, "conflict text2");
  //       repository.stage([file]);
  //     }
  //     repository.commit("Add file on conflictBranch");

  //     // マスターブランチでファイルを変更
  //     repository.checkOut("master");
  //     const fileID2 = Object.values(repository.rootFolder.contents).find((file) => file.name == "file2")?.id;
  //     const anotherFile = repository.rootFolder.contents[fileID2!];
  //     if (anotherFile instanceof BlobFile) {
  //       repository.updateRootFolder(anotherFile.id, "conflict!!!!");
  //       repository.stage([anotherFile]);
  //     }
  //     repository.commit("Modify file on master");

  //     // マージを実行（コンフリクトを引き起こす）
  //     const spy = vi.spyOn(repository, "resolveConflict");
  //     spy.mockImplementation((files: BlobFile[]) => {
  //       let choice = "target";
  //       console.log("pass");
  //       for (const file of files) {
  //         if (choice === "target") {
  //           repository.stage([file]);
  //         } else if (choice === "current") {
  //           repository.stage([file]);
  //         } else {
  //           console.log("Invalid choice. File remains un-staged.");
  //         }
  //       }
  //     });
  //     repository.checkOut("conflictBranch");
  //     const id = repository.merge("master");
  //     expect(repository.currentBranch).toEqual("master");
  //     expect(repository.index).toBeInstanceOf(Index);
  //     expect(Object.keys(repository.commitList)).toHaveLength(9);
  //     console.log(repository.commitList[id]);
  //   });
});
