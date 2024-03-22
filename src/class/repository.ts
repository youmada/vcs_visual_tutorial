/*/
Repository
commitList: ここにはコミットが入る。
branchList: ここにはブランチが入る。
fileList: ここには作成した擬似ファイルが入る。
/*/

class Repository {
  commitList: string[];
  branchList: [];
  fileList: [];
  constructor() {
    this.commitList = [];
    this.branchList = [];
    this.fileList = [];
  }

  commitPush(commitId: string) {
    this.commitList.push(commitId);
  }
}
