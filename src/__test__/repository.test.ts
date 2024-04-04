import { describe, test, expect, vi } from "vitest";
import { Repository } from "../class/repository";
import { Folder } from "../class/folder";
import { Index } from "../class";
import { BlobFile } from "../class/blobFile";
import { Commit } from "../class/commit";
import { Tree } from "../class/tree";

describe("Repositoryクラスのテスト", () => {
  test("初期化テスト", () => {
    const repository = new Repository();
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
    const repository = new Repository();
    const file = new BlobFile("stagedTestFile", "ステージングテスト用ファイル");
    // rootFolderにファイルを登録
    repository.addFolder(file);
    // rootFolderにファイルがあるかチェック
    expect(repository.rootFolder.contents).toEqual({ [file.name]: file });
    // fileListにファイルがあるかチェック
    expect(repository.fileList).toEqual({ [file.id]: file });
    repository.stage([file]);
    // ファイルがステージングされたかチェック
    expect(repository.index.stagedFiles).toEqual({ [file.id]: file });
    // ステージングを解除
    repository.unstage(file);
    expect(repository.index.stagedFiles).toEqual({});
    repository.stage([file]);
    expect(repository.index.stagedFiles).toEqual({ [file.id]: file });
    // リセット機能のチェック
    repository.resetStage();
    expect(repository.index.stagedFiles).toEqual({});
  });

  test("masterブランチ作成と切り替えテスト", () => {
    const repository = new Repository();
    const file = new BlobFile("initCommitFile", "初回コミットテスト用ファイル");
    // ステージングとrootFolderにファイルを入れる。
    repository.stage([file]);
    repository.addFolder(file);
    // ブランチリストに何もないことをチェック
    expect(repository.branchList).toEqual({});
    // masterブランチを作るために初回コミット
    const initCommitID = repository.commit("初回コミット");
    expect(repository.head).toBe(initCommitID);
    // masterブランチができたかチェック
    expect(repository.branchList).toEqual({ master: initCommitID });
    // currentBranchをチェック
    expect(repository.currentBranch).toEqual("master");
    // ここでテストブランチを作成する
    const branchHead = repository.createBranch("testBranch", initCommitID);
    expect(repository.branchList).toMatchObject({ testBranch: branchHead });
    // testBranchに切り替えるテスト
    repository.checkOut("testBranch");
    const testBranchFile = new BlobFile("testBranchFile", "このファイルはtestBranchのファイルで、masterには存在しない。");
    // testBranchFileをrootFolderに入れる
    repository.addFolder(testBranchFile);
    // ブランチを作った際にmasterのファイルを受け継いだか、チェック
    expect(repository.rootFolder.contents).toMatchObject({ [file.name]: file });
    // rootFolderのファイルをステージング
    const files: BlobFile[] = Object.values(repository.rootFolder.contents).filter((entry) => entry instanceof BlobFile) as BlobFile[];
    repository.stage(files);
    // コミット
    const branchCommitID = repository.commit("testBranchでコミット");
    expect(repository.currentBranch).toEqual("testBranch");
    expect(repository.head).toBe(branchCommitID);
    // testBranchのrootFolderにファイルがあるか、チェック
    expect(repository.rootFolder.contents).toMatchObject({ [file.name]: file });
    expect(repository.rootFolder.contents).toMatchObject({ [testBranchFile.name]: testBranchFile });
    // masterのrootFolderにファイルがあるか、チェック
    repository.checkOut("master");
    expect(repository.currentBranch).toEqual("master");
    expect(repository.rootFolder.contents).toMatchObject({ [file.name]: file });
  });

  test("コミットのテスト", () => {
    const repository = new Repository();
    const file = new BlobFile("commitTestFile", "コミットテスト用ファイル");
    // ファイルをステージングとrootFolderにセット
    repository.stage([file]);
    repository.addFolder(file);
    //コミット
    const commitID = repository.commit("初回コミットテスト");
    const commitContent = repository.commitList[commitID];
    // コミットの内容をチェック
    expect(commitContent).toBeInstanceOf(Commit);
    expect(repository.index).toBeInstanceOf(Index);
    expect(commitContent.message).toBeTruthy;
    expect(commitContent.tree).toBeInstanceOf(Tree);
    expect(Object.values(repository.treeList)).toContainEqual(commitContent.tree);
    expect(repository.head).toEqual(commitID);
  });

  test("複数回コミットテスト", () => {
    const repository = new Repository();
    const firstFile = new BlobFile("firstFile", "初回コミットファイル");
    repository.stage([firstFile]);
    repository.addFolder(firstFile);
    // 最初のコミット
    const initCommitID = repository.commit("初回コミット");
    const initCommit = repository.commitList[initCommitID];
    // コミットの内容チェック
    expect(initCommit.message).toBeTruthy;
    expect(Object.values(repository.treeList)).toContainEqual(initCommit.tree);
    expect(repository.head).toEqual(initCommitID);
    // 2回目のコミット firstFileはステージングしない。
    const secondFile = new BlobFile("secondFile", "2回目のコミットファイル");
    repository.stage([secondFile]);
    repository.addFolder(secondFile);
    expect(repository.rootFolder.contents).toMatchObject({ [firstFile.name]: firstFile });
    const secondCommitID = repository.commit("2回目のコミット");
    const secondCommit = repository.commitList[secondCommitID];
    // コミットの内容チェック
    expect(secondCommit.parentCommitId).toBe(initCommitID);
    expect(repository.commitList[secondCommit.parentCommitId!]).toBeInstanceOf(Commit);
    expect(repository.rootFolder.contents).toMatchObject({ [firstFile.name]: firstFile });
  });

  test("マージテスト コンフリクトなし", () => {
    const repository = new Repository();
    const firstFile = new BlobFile("firstFile", "初回コミットファイル");
    repository.stage([firstFile]);
    repository.addFolder(firstFile);
    // 最初のコミット 1回目
    const firstCommitID = repository.commit("初回コミット");
    repository.commitList[firstCommitID];
    expect(repository.currentBranch).toEqual("master");
    // testBranchを作成、チェックアウトする 2回目
    repository.createBranch("testBranch", firstCommitID);
    repository.checkOut("testBranch");
    expect(repository.currentBranch).toEqual("testBranch");
    // マージがわかるように、testBranchで一度コミットする。3回目
    const secondFile = new BlobFile("secondFile", "2回目のコミットファイル");
    repository.stage([secondFile]);
    repository.addFolder(secondFile);
    expect(repository.rootFolder.contents).toMatchObject({ [firstFile.name]: firstFile });
    repository.commit("testBranchでのコミット。トータルで2回目になる");
    expect(repository.currentBranch).toEqual("testBranch");
    // マージする。 4回目
    repository.merge("master");
    expect(repository.currentBranch).toEqual("master");
    expect(Object.keys(repository.commitList)).toHaveLength(4);
    expect(repository.rootFolder.contents).toEqual(
      expect.objectContaining({
        firstFile: firstFile,
        secondFile: secondFile,
      })
    );
    // 念のためにチェックアウトした時のrootFolderの中身をチェック
    repository.checkOut("testBranch");
    expect(repository.rootFolder.contents).toEqual(
      expect.objectContaining({
        secondFile: secondFile,
      })
    );
    repository.checkOut("master");
    expect(repository.rootFolder.contents).toEqual(
      expect.objectContaining({
        firstFile: firstFile,
        secondFile: secondFile,
      })
    );
  });

  //   test("マージテスト コンフリクトあり", () => {
  //     const repository = new Repository();
  //     const firstFile = new BlobFile("conflictFile", "コンフリクトファイル");
  //     repository.stage([firstFile]);
  //     repository.addFolder(firstFile);
  //     // 最初のコミット 1回目
  //     const firstCommitID = repository.commit("初回コミット");
  //     repository.commitList[firstCommitID];
  //     expect(repository.currentBranch).toEqual("master");
  //     // testBranchを作成、チェックアウトする 2回目
  //     repository.createBranch("testBranch", firstCommitID);
  //     repository.checkOut("testBranch");
  //     expect(repository.currentBranch).toEqual("testBranch");
  //     // コンフリクトを起こすためにtestBranchで一度コミットする。3回目
  //     const secondFile = new BlobFile("secondFile", "2回目のコミットファイル");
  //     repository.updateRootFolder("firstFile", "コンフリクトテストtestBranchで編集");
  //     repository.addFolder(secondFile);
  //     repository.stage([secondFile, firstFile]);
  //     expect(repository.rootFolder.contents).toMatchObject({ [firstFile.name]: firstFile });
  //     repository.commit("testBranchでのコミット。トータルで3回目になる");
  //     expect(repository.currentBranch).toEqual("testBranch");

  //     // 4回目のコミットをするためにmasterブランチに切り替えて、firstFileを編集。
  //     repository.checkOut("master");
  //     expect(repository.currentBranch).toEqual("master");
  //     repository.updateRootFolder("firstFile", "コンフリクトテストmasterブランチで編集");
  //     repository.stage([firstFile]);
  //     repository.commit("5回目のコミットmasterブランチにて、コンフリクトを起こすためにfirstFileを編集");

  //     // マージするためにtestBranchに移動して、マージする。コンフリクトが起こる。
  //     repository.checkOut("testBranch");
  //     repository.merge("master");
  //     // mergeしたので、masterに切り替わる
  //     expect(repository.currentBranch).toBe("master");
  //     expect(repository.rootFolder.contents).toEqual(
  //       expect.objectContaining({
  //         firstFile: firstFile,
  //         secondFile: secondFile,
  //       })
  //     );
  //     const conflictFile: BlobFile = repository.rootFolder.contents["firstFile"] as BlobFile;
  //     expect(conflictFile.text).toBe("コンフリクトテストmasterブランチで編集");
  //   });
});

/*/
現状：conflictBranchを作成できるが、treeにファイル情報が入らない。
console.log()で見たところ、createranch()のfilesにはファイルがあり、rootFolderとindexにも存在している。
しかし、なぜかtreeにだけ格納されない。generateTree()が怪しい

/*/
