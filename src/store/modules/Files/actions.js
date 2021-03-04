import { types } from "./mutations";
import VFile, { fileTypes } from "@/models/vFile.model";
import db from "@/utils/db";
import Dexie from "dexie";
import omit from "lodash/omit";
import store from '../../index';

export default {
  /**
   * Loads all the files available in the localstorage into the store
   */
  loadFiles: async ({ commit, dispatch }) => {
    const loader = async () => {
      store.commit('setSyncing', true);
      const { value: openFiles } = await db.openFiles.fetch([]).next();
      const { value: activeFiles } = await db.activeFiles.fetch([]).next();
      const { value: files } = await db.files.fetch([]).next();
      store.commit('setSyncing', false);

      await dispatch(
        "Editor/reOpenFiles",
        { openFiles: openFiles, activeFiles: activeFiles },
        { root: true }
      );

      const filesObject = files.reduce((result, item) => {
        Object.assign(result, {
          [item.id]: new VFile({ ...item, editable: false }),
        });
        return result;
      }, {});
      console.log({ filesObject });
      commit(types.SET_FILES, filesObject);
    };

    loader()
      .then(() => {
        console.log("transaction committed");
      })
      .catch((error) => {
        console.error("Generic error: " + error);
      });
  },

  /**
   * Creates a new file
   */
  createFile: async ({ state, commit, dispatch }, fileDetails) => {
    const details = fileDetails ? fileDetails : {};
    console.log(fileDetails);
    const file = new VFile({ ...details, type: fileTypes.FILE });
    commit(types.SET_FILES, {
      ...state.files,
      [file.id]: file,
    });
    store.commit('setSyncing', true);
    await db.files.put(file, file.id).catch((error) => {
      console.error(error);
    });
    store.commit('setSyncing', false);
    return file;
    // dispatch("Editor/openFile", file.id, { root: true });
  },

  moveFile: async ({ state, commit, dispatch }, { id, directoryId }) => {
    if (!id) return;

    commit(types.SET_FILES, {
      ...state.files,
      [id]: {
        ...state.files[id],
        parent: directoryId,
        editable: false,
      },
    });

    const mover = async () => {
      store.commit('setSyncing', true);
      await db.files
        .update({ parent: directoryId }, id);
      console.log(`file ${id} moved to ${directoryId}!`);
      store.commit('setSyncing', false);
    };

    mover()
      .catch((error) => {
        console.error(error + " items failed to modify");
      })
      .catch((error) => {
        console.error("Generic error: " + error);
      });
  },

  createDirectory: async ({ state, commit }, directoryDetails) => {
    const details = directoryDetails ? directoryDetails : {};
    const directory = new VFile({ ...details, type: fileTypes.DIRECTORY });
    commit(types.SET_FILES, {
      ...state.files,
      [directory.id]: directory,
    });
    store.commit('setSyncing', true);
    await db.files.put(directory, directory.id).catch((error) => {
      console.error(error);
    });
    store.commit('setSyncing', false);
  },

  updateFileContents: async ({ state, commit, dispatch }, { id, contents }) => {
    if (!id) return;

    commit(types.SET_FILES, {
      ...state.files,
      [id]: {
        ...state.files[id],
        contents,
      },
    });
    const updater = async () => {
      // Mark bigfoots:
      store.commit('setSyncing', true);
      await db.files
        .update({ contents }, id);
      console.log(`file ${id} updated!`);
      store.commit('setSyncing', false);
    }

    updater()
      .catch((error) => {
        // ModifyError did occur
        console.error(error + " items failed to modify");
      })
      .catch((error) => {
        console.error("Generic error: " + error);
      });
  },

  renameFile: async ({ state, commit }, { id, name }) => {
    if (!id) return;

    commit(types.SET_FILES, {
      ...state.files,
      [id]: {
        ...state.files[id],
        name,
        editable: false,
      },
    });

    const renamer = async () => {
      // Mark bigfoots:
      store.commit('setSyncing', true);
      await db.files
        .update({ name }, id);
      console.log(`file ${id} renamed!`);
      store.commit('setSyncing', false);
    };

    renamer()
      .catch((error) => {
        // ModifyError did occur
        console.error(error + " items failed to modify");
      })
      .catch((error) => {
        console.error("Generic error: " + error);
      });
  },

  openRenameMode: async ({ state, commit }, { id }) => {
    if (!id) return;

    commit(types.SET_FILES, {
      ...state.files,
      [id]: {
        ...state.files[id],
        editable: true,
      },
    });
  },

  deleteFile: async ({ state, commit, dispatch }, { id }) => {
    if (!id) return;

    await dispatch("Editor/closeFileFromAllEditor", { id }, { root: true });
    console.log("back to delete file");
    commit(types.SET_FILES, omit(state.files, id));
    const deleter = async () => {
      // Mark bigfoots:
      store.commit('setSyncing', true);
      await db.files
        .delete(id);
      console.log(`file ${id} deleted!`);
      store.commit('setSyncing', false);
    };

    deleter()
      .catch((error) => {
        // ModifyError did occur
        console.error(error + " items failed to modify");
      })
      .catch((error) => {
        console.error("Generic error: " + error);
      });
  },

  deleteDirectory: async ({ state, commit, dispatch, rootGetters }, { id }) => {
    if (!id) return;

    const children = rootGetters["Editor/getChildren"](id);
    // delete all the children of the directory first
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === fileTypes.DIRECTORY) {
        await dispatch("deleteDirectory", { id: child.id });
      } else {
        await dispatch("deleteFile", { id: child.id });
      }
    }
    // then delete the directory
    commit(types.SET_FILES, omit(state.files, id));

    const dirtyDeleter = async () => {
      // Mark bigfoots:
      store.commit('setSyncing', true);
      await db.files
        .delete(id);
      console.log(`file ${id} deleted!`);
      store.commit('setSyncing', false);
    };

    dirtyDeleter()
      .catch((error) => {
        // ModifyError did occur
        console.error(error + " items failed to modify");
      })
      .catch((error) => {
        console.error("Generic error: " + error);
      });
  },
};
