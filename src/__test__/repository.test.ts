import { Repository } from "../class/repository.ts";
import { Folder } from "../class/folder.ts";
import { Index } from "../class";
import { BlobFile } from "../class/blobFile.ts";
import { Commit } from "../class/commit.ts";
import { Contents } from "../class/contents.ts";

describe("Repositoryクラスのテスト", () => {
  let repository: Repository;
  let rootFolder: Folder;
  let file: BlobFile;

  beforeEach(async () => {
    repository = Repository.init();
    rootFolder = await Contents.init();
    file = await BlobFile.init("stagedTestFile", "ステージングテスト用ファイル", "/");
    rootFolder.insertContent(file);
  });

  test("初期化テスト", () => {
    expect(repository.index).toBeInstanceOf(Index);
    expect(repository.head).toBe(null);
    expect(repository.commitList).toEqual({});
    expect(repository.fileList).toEqual({});
    expect(repository.treeList).toEqual({});
  });

  test("ステージングテスト", () => {
    const file = Contents.folder.contents["stagedTestFile"];
    if (file instanceof BlobFile) {
      expect(repository.stage([file]));
      expect(repository.index.stagedFiles).toMatchObject({ [file.getId()]: file });
      repository.unstage(file);
      expect(repository.index.stagedFiles).toEqual({});
      repository.stage([file]);
      repository.resetStage();
      expect(repository.index.stagedFiles).toEqual({});
    }
  });

  test("masterブランチ作成と切り替えテスト", async () => {
    const repository = new Repository();
    const commited = await BlobFile.init("initCommitFile", "初回コミットテスト用ファイル", "/");
    rootFolder.insertContent(commited);
    repository.stage([file]);
    expect(repository.branchList).toEqual({});
    const initCommitID = await repository.commit("初回コミット");
    expect(repository.head).toBe(initCommitID);
    expect(repository.branchList).toEqual({ master: initCommitID });
    expect(repository.currentBranch).toEqual("master");
    const branchHead = await repository.createBranch("testBranch", initCommitID);
    expect(repository.branchList).toMatchObject({ testBranch: branchHead });
    repository.checkOut(branchHead as string);
    const testBranchFile = await BlobFile.init("testBranchFile", "このファイルはtestBranchのファイルで、masterには存在しない。", "/");
    rootFolder.insertContent(testBranchFile);
    repository.stage(Object.values(rootFolder.contents) as BlobFile[]);
    const branchCommitID = await repository.commit("testBranchでコミット");
    expect(repository.currentBranch).toEqual("testBranch");
    expect(repository.head).toBe(branchCommitID);
    repository.checkOut(repository.branchList["master"] as string);
    expect(repository.currentBranch).toEqual("master");
  });

  test("複数回コミットテスト", async () => {
    const firstFile = await BlobFile.init("firstFile", "初回コミットファイル", "/");
    rootFolder.insertContent(firstFile);
    repository.stage([firstFile]);
    const initCommitID = await repository.commit("初回コミット");
    const initCommit = repository.commitList[initCommitID];
    expect(initCommit.message).toBeTruthy();
    expect(Object.values(repository.treeList)).toContainEqual(initCommit.tree);
    expect(repository.head).toEqual(initCommitID);
    const secondFile = await BlobFile.init("secondFile", "2回目のコミットファイル", "/");
    rootFolder.insertContent(secondFile);
    repository.stage([secondFile]);
    const secondCommitID = await repository.commit("2回目のコミット");
    const secondCommit = repository.commitList[secondCommitID];
    expect(secondCommit.getParentId()).toBe(initCommitID);
    expect(repository.commitList[secondCommit.getParentId()!]).toBeInstanceOf(Commit);
  });

  test("マージテスト コンフリクトなし", async () => {
    const firstFile = await BlobFile.init("firstFile", "初回コミットファイル", "/");
    rootFolder.insertContent(firstFile);
    repository.stage([firstFile]);
    const firstCommitID = await repository.commit("初回コミット");
    repository.commitList[firstCommitID];
    expect(repository.currentBranch).toEqual("master");
    const head = await repository.createBranch("testBranch", firstCommitID);
    repository.checkOut(head as string);
    expect(repository.currentBranch).toEqual("testBranch");
    const secondFile = await BlobFile.init("secondFile", "2回目のコミットファイル", "/");
    repository.stage([secondFile]);
    await repository.commit("testBranchでのコミット。トータルで2回目になる");
    expect(repository.currentBranch).toEqual("testBranch");
    await repository.merge("master");
    expect(repository.currentBranch).toEqual("master");
    expect(Object.keys(repository.commitList)).toHaveLength(4);
    repository.checkOut(repository.branchList["testBranch"] as string);

    repository.checkOut(repository.branchList["master"] as string);
  });

  test("ステージングに入れていないファイルが3回目のコミットでスナップショットとして反映されることを確認する", async () => {
    // 1回目のコミット
    repository.stage([file]);
    await repository.commit("1回目のコミット");

    // 2回目のコミット
    const file2 = await BlobFile.init("stagedTestFile2", "ステージングテスト用ファイル2", "/");
    rootFolder.insertContent(file2);
    repository.stage([file2]);
    await repository.commit("2回目のコミット");

    // 3回目のコミット
    const file3 = await BlobFile.init("stagedTestFile3", "ステージングテスト用ファイル3", "/");
    rootFolder.insertContent(file3);
    repository.stage([file3]);
    await repository.commit("3回目のコミット");

    // 3回目のコミットのツリーには、ステージングされていないファイル2も含まれていることを確認する
    const thirdCommit = repository.commitList[repository.head!];
    const thirdTree = Object.values(thirdCommit.tree.entry);
    expect(thirdTree.find((entry) => entry.getId() == file2.getId())).toBeDefined();
    expect(thirdTree.find((entry) => entry.getId() == file.getId())).toBeDefined();
  });
});
