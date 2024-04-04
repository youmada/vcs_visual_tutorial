/*/
Repository

/*/

import { Index } from ".";
import { BlobFile } from "./blobFile";
import { Commit } from "./commit";
import { Folder } from "./folder";
import { Tree } from "./tree";

export class Repository {
  rootFolder: Folder;
  index: Index;
  head: string | null;
  commitList: { [name: string]: Commit };
  fileList: { [name: string]: BlobFile };
  treeList: { [name: string]: Tree };
  branchList: { [name: string]: string };
  currentBranch: string;

  constructor() {
    this.rootFolder = new Folder("root");
    this.index = new Index();
    this.head = null;
    this.commitList = {};
    this.fileList = {};
    this.treeList = {};
    this.branchList = {};
    this.currentBranch = "";
  }

  stage(files: BlobFile[]) {
    this.index.addStage(files);
  }

  unstage(file: BlobFile) {
    this.index.removeStage(file);
  }

  resetStage() {
    this.index.clearStage();
  }

  addFolder(content: Folder | BlobFile) {
    content.createId();
    this.rootFolder.contents[content.name] = content;
    if (content instanceof BlobFile) {
      this.addFileList(content);
    }
  }

  addFileList(file: BlobFile) {
    this.fileList[file.id] = file;
  }

  updateRootFolder(fileName: string, content: string): void {
    const file = this.rootFolder.contents[fileName];
    if (file instanceof BlobFile) {
      file.updateText(content);
      this.addFolder(file);
      delete this.rootFolder.contents[fileName];
    } else {
      console.log(`${fileName} does not exist or is not a BlobFile.`);
    }
  }

  // idは親コミットのID
  createBranch(name: string, id: string) {
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
      // console.log(this.rootFolder.contents);
      // console.log(this.index);
      const head = this.commit(`${name} branch created`);
      this.branchList[name] = head;
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
      this.rootFolder.contents = {};
      this.buildRootFolder(tree, this.rootFolder);
      return this.currentBranch;
    } else return null;
  }

  buildRootFolder(tree: Tree, parentFolder: Folder) {
    for (const entry of Object.values(tree.entry)) {
      if (entry instanceof BlobFile) {
        parentFolder.contents[entry.name] = entry;
      } else if (entry instanceof Tree) {
        const folder = new Folder(entry.name);
        parentFolder.contents[entry.name] = folder;
        this.buildRootFolder(entry, folder);
      }
    }
    return parentFolder;
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

    // console.log(currentFiles);
    // console.log(targetFiles);

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
    // console.log(`commonFiles: ${Object.keys(commonFiles)}`);

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

    // console.log(`changeFiles: `);
    // console.log(changeFiles);
    // console.log(`conflictFiles: ${conflictFiles}`);

    return [changeFiles, conflictFiles];
  }

  findBaseCommit(targetCommitID: string, currentCommitID: string): string | null {
    const targetCommitParents = new Set();
    const currentCommitParents = new Set();

    let currentCommit = this.commitList[currentCommitID!];
    while (currentCommit) {
      currentCommitParents.add(currentCommit.id);
      currentCommit = this.commitList[currentCommit.parentCommitId!];
    }

    let targetCommit = this.commitList[targetCommitID!];
    while (targetCommit) {
      if (currentCommitParents.has(targetCommit.id)) {
        return targetCommit.id;
      }
      targetCommitParents.add(targetCommit.id);
      targetCommit = this.commitList[targetCommit.parentCommitId!];
    }

    return null;
  }

  commit(message: string) {
    const newTree = this.generateRepositoryTree();
    this.treeList[newTree.id] = newTree;
    const newCommit = new Commit(message, newTree, this.head);
    this.commitList[newCommit.id] = newCommit;
    if (this.checkBranch("master")) {
      this.branchList[this.currentBranch] = newCommit.id;
    } else {
      this.branchList["master"] = newCommit.id;
      this.currentBranch = "master";
    }
    this.head = newCommit.id;
    this.index.clearStage();
    return newCommit.id;
  }

  generateTree(folder: Folder): Tree {
    const tree = new Tree(folder.name);
    const entries = Object.entries(folder.contents);
    // console.log("_____________________________");
    // console.log(this.index.stagedFiles);
    // console.log("_____________________________");
    for (const [id, entry] of entries) {
      if (entry instanceof BlobFile) {
        if (this.index.stagedFiles[entry.id]) {
          // console.log(entry);
          tree.addEntry(entry);
        } else {
          if (this.head !== null) {
            //親コミットIDを探す。
            const parentID = this.commitList[this.head].parentCommitId;
            if (parentID == null) {
              const tree = this.commitList[this.head].tree;
              const file = this.searchTree(entry.id, tree);
              if (file !== null) {
                tree.addEntry(file);
              }
            } else {
              const parentTree = this.commitList[parentID].tree;
              // this.headがnullでない以上、parentIDは必ず存在する。
              const file = this.searchTree(entry.id, parentTree);
              if (file !== null) {
                tree.addEntry(file);
              }
            }
          }
        }
      } else if (entry instanceof Folder) {
        const subTree = this.generateTree(entry);
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

  generateRepositoryTree(): Tree {
    return this.generateTree(this.rootFolder);
  }
}
