import Dexie from "dexie";
import { Deta } from 'deta';

const files = Deta(process.env.VUE_APP_DETA_KEY).Base("files");
const openFiles = Deta(process.env.VUE_APP_DETA_KEY).Base("openFiles");
const activeFiles = Deta(process.env.VUE_APP_DETA_KEY).Base("activeFiles");

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
