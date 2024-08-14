import type { DocumentData } from '@firebase/firestore-types'
import { projectFirestore } from '@/firebase/config'

export interface postData  {
  id: string,
  date: Date,
  dateStr?: string,
  name: string,
  message: string,
  qr: string,
  locked?: boolean
}

const defaultPostData = ():postData => ({
  id:'', date:new Date() ,name:'',message:'' ,qr:'', locked: false
});

export class PostData implements postData{
  id: string;
  date: Date;
  dateStr: string;
  name: string;
  message: string;
  qr: string;
  locked: boolean;
  
  constructor(init:Partial<postData> = defaultPostData()){
    this.id = init.id ?? '';
    this.name = init.name ?? '';
    this.message = init.message ?? '';
    this.date = init.date ?? new Date();
    this.dateStr = init.dateStr ?? '';
    this.qr = init.qr ?? '';
    this.locked = init.locked ?? false;
  }

  newPost(doc:DocumentData){
    this.id = doc?.id ?? '';
    this.name = doc.data()?.name.trim() ?? '';
    this.message = doc.data().message.trim() ?? '';
    this.date = doc.data()?.date ?? new Date();
    this.dateStr = doc.data()?.dateStr ?? '';
    this.qr = doc.data()?.qr ?? '';
    this.locked = doc.data()?.locked ?? false;
    return this;
  }

  getDataObj():postData{
    return{
      id: this.id ?? '',
      name: this.name.trim() ?? '',
      message: this.message.trim() ?? '',
      date: this.date ?? new Date(),
      dateStr: this.dateStr ?? '',
      qr: this.qr ?? '',
      locked: this.locked ?? false
    }
  }

  doc () {
    const id = `${this.date.getTime()}`;
    return projectFirestore.collection("posts").doc(id);
  }

  async upload () {
    this.date = new Date();
    this.dateStr = new Date().toLocaleString("ja");
    await this.doc().set(this.getDataObj());
  }

  deleteData() {
    this.doc().delete().then(() => console.log("deleted"));
  }
  
  updateLock ( docID: string ,lockstat: boolean ){
    const load = async () => {
      try {
        const obj = this.getDataObj();
        obj.locked = lockstat;
        projectFirestore.collection("posts").doc(docID).update(obj);
      } catch ( err: unknown ) {
        if ( err instanceof Error ) {
          alert('送信失敗');
        }
      }
    }
    load();
  }
}