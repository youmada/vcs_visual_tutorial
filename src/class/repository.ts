/*/
Repository

/*/

import { Index } from ".";
import { BlobFile } from "./blobFile";
import { Commit } from "./commit";
import { Contents } from "./contents";
import { Folder } from "./folder";
import { Tree } from "./tree";
import { Vcs } from "./vcs";

export class Repository {
  index: Index;
  head: string | null;
  commitList: { [name: string]: Commit };
  fileList: { [name: string]: BlobFile };
  treeList: { [name: string]: Tree };
  branchList: { [name: string]: string };
  currentBranch: string;

  constructor() {
    this.index = new Index();
    this.head = null;
    this.commitList = {};
    this.fileList = {};
    this.treeList = {};
    this.branchList = {};
    this.currentBranch = "";
  }

  static init() {
    const repository = new Repository();
    return repository;
  }

  /**
   * ファイルをステージングエリアに追加する
   * @param files - ステージングエリアに追加するファイル Vcs.changedFilesの配列が入る
   */
  stage(files: BlobFile[]) {
    files.forEach((file) => {
      const stagedFiles = Object.entries(this.index.stagedFiles);
      for (const [key, stagedFile] of stagedFiles) {
        if (stagedFile.name === file.name) {
          delete this.index.stagedFiles[key];
        }
      }
      this.index.addStage(file);
    });
  }

  unstage(file: BlobFile) {
    this.index.removeStage(file);
  }

  resetStage() {
    this.index.clearStage();
  }

  addFileList(file: BlobFile) {
    this.fileList[file.getId()] = file;
  }

  // idは親コミットのID
  async createBranch(name: string, id: string) {
    if (!this.checkBranch(name)) {
      this.currentBranch = name;
      const parentCommit = this.commitList[id];
      const files: BlobFile[] = [];
      Object.values(parentCommit.tree.entry).forEach((content: BlobFile | Tree | Folder) => {
        if (content instanceof BlobFile) {
          files.push(content);
        }
      });
      this.stage(files);
      const head = await this.commit(`${name} branch created`);
      this.branchList[name] = head!;
      return head;
    } else return "same name branch is already";
  }

  checkBranch(name: string): boolean {
    return this.branchList[name] !== undefined;
  }

  searchBranch(name: string) {
    if (this.checkBranch(name)) {
      return this.branchList[name];
    } else {
      return null;
    }
  }

  // 現状ブランチの切り替えしかできない。後々コミットの切り替えにも対応する。
  checkOut(name: string) {
    if (this.checkBranch(name)) {
      this.currentBranch = name;
      this.head = this.branchList[name];
      const tree = this.commitList[this.head].tree;
      return this.currentBranch;
    } else return null;
  }

  merge(branchName: string) {
    // マージ先の最新コミット
    const targetCommit = this.searchBranch(branchName);

    if (targetCommit == null) return "this branch is not";
    // 現在のブランチの最新コミット
    const currentCommit = this.head!;

    // マージ先と元のブランチの共通している親コミットのID
    const baseCommit = this.findBaseCommit(targetCommit, currentCommit);

    if (baseCommit == null) return "no baseCommit";

    const changeFiles = this.checkChangeFiles(targetCommit, currentCommit, baseCommit);
    let commitID;
    this.currentBranch = branchName;
    if (changeFiles[1].length === 0) {
      this.stage(changeFiles[0]);
      commitID = this.commit(`merge ${this.currentBranch} to ${branchName}`);
    } else {
      this.resolveConflict(changeFiles[1], targetCommit, currentCommit);
      commitID = this.commit(`merge ${this.currentBranch} to ${branchName}`);
    }
    // コミットはすでにできている
    this.checkOut(branchName);
    return commitID;
  }

  resolveConflict(files: BlobFile[], targetCommitID: string, currentCommitID: string): void {
    // filesには配列でオブジェクトが入っている
    // ユーザーに選択肢を表示し、選択されたファイルをステージングする
    for (const file of files) {
      const choice = prompt(`Which content do you want to stage for file ${file.name}? (target/current)`);
      if (choice === "target") {
        this.stage([file]);
      } else if (choice === "current") {
        this.stage([file]);
      } else {
        console.log("Invalid choice. File remains un-staged.");
      }
    }
  }

  checkChangeFiles(target: string, current: string, base: string): [BlobFile[], BlobFile[]] {
    const changeFiles: BlobFile[] = [];
    const conflictFiles: BlobFile[] = [];

    const baseCommit = this.commitList[base];
    const targetCommit = this.commitList[target];
    const currentCommit = this.commitList[current];
    // console.log(currentCommit);

    const baseFiles: { [name: string]: BlobFile } = {};
    Object.values(baseCommit.tree.entry).forEach((content: BlobFile | Tree | Folder) => {
      if (content instanceof BlobFile) {
        baseFiles[content.name] = content;
      }
    });
    const currentFiles: { [name: string]: BlobFile } = {};
    Object.values(currentCommit.tree.entry).forEach((content: BlobFile | Tree | Folder) => {
      if (content instanceof BlobFile) {
        currentFiles[content.name] = content;
      }
    });

    const targetFiles: { [name: string]: BlobFile } = {};
    Object.values(targetCommit.tree.entry).forEach((content: BlobFile | Tree | Folder) => {
      if (content instanceof BlobFile) {
        targetFiles[content.name] = content;
      }
    });

    // currentとtargetの独自のファイルを抽出。
    for (const fileName in currentFiles) {
      if (!targetFiles[fileName]) changeFiles.push(currentFiles[fileName]);
    }

    for (const fileName in targetFiles) {
      if (!currentFiles[fileName]) changeFiles.push(targetFiles[fileName]);
    }

    // 共通のファイルを取得
    // おそらく現状、currentとtargetでそれぞれ新しく同じ名前のファイルを作った場合、コンフリクトが起きない。
    const commonFiles: { [name: string]: BlobFile } = {};
    for (const file in baseFiles) {
      if (currentFiles[file] && targetFiles[file]) {
        commonFiles[file] = baseFiles[file];
      }
    }

    // コンフリクトを検出
    for (const fileName in commonFiles) {
      const targetFile = targetFiles[fileName];
      const currentFile = currentFiles[fileName];
      const baseFile = baseFiles[fileName];

      if (targetFile.id !== currentFile.id) {
        if (targetFile.id === baseFile.id && currentFile.id !== baseFile.id) {
          changeFiles.push(currentFile);
        } else if (currentFile.id === baseFile.id && targetFile.id !== baseFile.id) {
          changeFiles.push(targetFile);
        } else {
          conflictFiles.push(commonFiles[fileName]);
        }
      }
    }

    return [changeFiles, conflictFiles];
  }

  findBaseCommit(targetCommitID: string, currentCommitID: string): string | null {
    const targetCommitParents = new Set();
    const currentCommitParents = new Set();

    let currentCommit = this.commitList[currentCommitID!];
    while (currentCommit) {
      currentCommitParents.add(currentCommit.getId());
      currentCommit = this.commitList[currentCommit.getParentId()!];
    }

    let targetCommit = this.commitList[targetCommitID!];
    while (targetCommit) {
      if (currentCommitParents.has(targetCommit.getId())) {
        return targetCommit.getId();
      }
      targetCommitParents.add(targetCommit.getId());
      targetCommit = this.commitList[targetCommit.getParentId()!];
    }

    return null;
  }

  async commit(message: string) {
    const newTree = await this.generateRepositoryTree();
    this.treeList[newTree.getId()] = newTree;
    const newCommit = await Commit.init(message, newTree, this.head);
    this.commitList[newCommit.getId()] = newCommit;
    if (this.checkBranch("master")) {
      this.branchList[this.currentBranch] = newCommit.getId();
    } else {
      this.branchList["master"] = newCommit.getId();
      this.currentBranch = "master";
    }
    this.head = newCommit.getId();
    this.index.clearStage();
    return newCommit.getId();
  }

  async generateTree(folder: Folder): Promise<Tree> {
    const tree = await Tree.init(folder.name);
    const entries = Object.entries(folder.contents);
    for (const [id, entry] of entries) {
      if (entry instanceof BlobFile) {
        if (this.index.stagedFiles[entry.getId()]) {
          // console.log(entry);
          tree.addEntry(entry);
        } else {
          if (this.head !== null) {
            //親コミットIDを探す。
            const parentID = this.commitList[this.head].getParentId();
            if (parentID == null) {
              const tree = this.commitList[this.head].tree;
              const file = this.searchTree(entry.getId(), tree);
              if (file !== null) {
                tree.addEntry(file);
              }
            } else {
              const parentTree = this.commitList[parentID].tree;
              // this.headがnullでない以上、parentIDは必ず存在する。
              const file = this.searchTree(entry.getId(), parentTree);
              if (file !== null) {
                tree.addEntry(file);
              }
            }
          }
        }
      } else if (entry instanceof Folder) {
        const subTree = await this.generateTree(entry);
        if (subTree) {
          tree.addEntry(subTree);
        }
      }
    }
    return tree;
  }

  searchTree(id: string, tree: Tree): BlobFile | null {
    for (const key in tree.entry) {
      const entry = tree.entry[key];
      if (key === id && entry instanceof BlobFile) {
        return entry;
      } else if (entry instanceof Tree) {
        const found = this.searchTree(id, entry);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  async generateRepositoryTree(): Promise<Tree> {
    return this.generateTree(Contents.folder);
  }
}
