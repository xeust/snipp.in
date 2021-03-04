import Dexie from "dexie";
import { Deta } from 'deta';


function getCookieValue(a) {
  var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
  return b ? b.pop() : '';
}

const pk = getCookieValue("pk");

const files = Deta(pk).Base("files");
const openFiles = Deta(pk).Base("openFiles");
const activeFiles = Deta(pk).Base("activeFiles");

const db = {
  files: files,
  openFiles: openFiles,
  activeFiles: activeFiles
}


const db2 = new Dexie("hspace");
db2.version(2).stores({
  files: "id, parent, name, type, contents, created_at",
  openFiles: "id, editor",
  activeFiles: "editor, id",
});

export default db;
