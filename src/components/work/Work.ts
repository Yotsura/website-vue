import type { DocumentData } from 'firebase/firestore'
import { uploadFile ,downloadFile, deleteFile } from './supabaseFileCtrl'
import { projectFirestore } from '@/firebase/config'

interface workData {
    categoryID: string,
    caption: string,
    viewCnt: number
}

const defaultWorkData = ():workData => ({
    categoryID: '',caption:'',viewCnt: 0
});

export class WorkData implements workData{
    categoryID: string;
    caption: string;
    viewCnt: number;
    
    constructor(init:Partial<workData> = defaultWorkData()){
        this.categoryID = init.categoryID ?? '';
        this.caption = init.caption ?? '';
        this.viewCnt = init.viewCnt ?? 0;
    }

    getDataObj():workData{
        return{
            categoryID: this.categoryID ?? '',
            caption: this.caption ?? '',
            viewCnt: this.viewCnt ?? 0
        }
    }

    countUp(){
        this.viewCnt++ ;
    }

    async upload (file :File ,dirName: string ,id: string){
        //firestoreを更新するとsnapが変更を受け取って画像をDLしようとするため、先にstrogeに保存する。
        await uploadFile(file ,dirName ,id).then(() => {
            console.log("work-upload-uploadfile")
            projectFirestore.collection(dirName).doc(id)
            .set(this.getDataObj()).then(() => {
                console.log("work-upload-firestore")
            });
        });
        console.log("work-upload-complete")
    }

    updateCategory ( docID: string ,categoryID: string ){
      const load = async () => {
        try {
          const obj = this.getDataObj();
          obj.categoryID = this.categoryID == categoryID ? '' : categoryID;
          projectFirestore.collection("works").doc(docID).update(obj);
        } catch ( err: unknown ) {
          if ( err instanceof Error ) {
            alert('送信失敗');
          }
        }
      }
      load();
    }

    updateCaption ( docID: string ,caption: string ){
      const load = async () => {
        try {
          const obj = this.getDataObj();
          obj.caption = caption;
          projectFirestore.collection("works").doc(docID).update(obj);
        } catch ( err: unknown ) {
          if ( err instanceof Error ) {
            alert('送信失敗');
          }
        }
      }
      load();
    }
}

interface work {
    id: string;
    data: WorkData;
    img?: string;
    img_large?: string;
    show: boolean;
    delFlg?: boolean;
}

export class Work implements work {
  id: string;
  data: WorkData;
  img?: string | undefined;
  img_large?: string | undefined;
  show: boolean;
  delFlg?: boolean;

  constructor(record:DocumentData | Work){
    // console.log(record);
    if (record instanceof Work){
      this.id = record.id ?? '';
      this.data = record.data ?? new WorkData();
      this.img = record.img ?? '';
      this.img_large = record.img_large ?? '';
      this.show = record.show;
      this.delFlg = record.delFlg;
    } else {
      this.id = record.id ?? '';
      this.data = new WorkData (record.data());
      this.show = false;
    }
  }

  getDataObj():work {
    return {
      id: this.id ?? '',
      data: this.data ?? new WorkData(),
      show:false
    }
  }
  
  async loadImg(){
    if(this.img) return;
    // テスト用の3秒遅延 - 本番では以下の行をコメントアウト
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`Dowloading:${this.id}`)
    await downloadFile(this.id , 'works').then((imgUrl) => {
      this.img = imgUrl??'';
    });
  }
  
  async loadLargeImg(){
    if(this.img_large) return;
    // console.log(`Dowloading:${this.id}`)
    await downloadFile((this.id+'_large') ,'works').then((imgUrl) => {
      this.img_large = imgUrl??'';
    });
  }

  async delImg(){
    deleteFile((this.id ?? '') , 'works');
    deleteFile((this.id + '_large') ,'works');
    projectFirestore.collection("works").doc(this.id).delete();
  }

  async hideImg(){
    this.show = false;
  }

  async showImg(){
    this.show = true;
  }

  async DisposeLargeImg(){
    this.img_large = '';
  }

  updateCategory ( categoryID: string ){
    this.data.updateCategory(this.id, categoryID);
  }

  updateCaption ( caption: string ){
    this.data.updateCaption(this.id, caption);
  }
}