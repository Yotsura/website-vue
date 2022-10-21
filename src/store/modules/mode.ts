import { defineStore } from 'pinia';

export interface EnabledModes {
  deleteMode: boolean,
  editCategoryMode: boolean,
  editCaptionMode: boolean,
}

export const useEnabledModesStore = defineStore({
  id: 'enabledModes',
  state: () : EnabledModes => ({
    deleteMode: false,
    editCategoryMode: false,
    editCaptionMode: false,
  }),
  getters:{
    deleteModeIsEnabled(): boolean {
      return this.deleteMode;
    },
    editCategoryIsEnabled(): boolean {
      return this.editCategoryMode;
    },
    editCaptionIsEnabled(): boolean {
      return this.editCaptionMode;
    }
  },
  actions: {
    setDeleteModeFlg(isEnabled:boolean) {
      this.deleteMode = isEnabled;
      if(isEnabled)
        this.editCaptionMode = false;
    },
    setEditCategoryFlg(isEnabled:boolean) {
      this.editCategoryMode = isEnabled;
      if(isEnabled)
        this.editCaptionMode = false;
    },
    setEditCaptionFlg(isEnabled:boolean) {
      this.editCaptionMode = isEnabled;
      if(isEnabled)
      {
        this.editCategoryMode = false;
        this.deleteMode = false;
      }
    },
  }
});