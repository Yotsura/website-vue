import type { DocumentData } from '@firebase/firestore-types'
import { projectFirestore } from '@/firebase/config'

export interface postData  {
  id: string,
  date: Date,
  dateStr?: string,
  name: string,
  message: string,
  qr: string,
};

const defaultPostData = ():postData => ({
  id:'', date:new Date() ,name:'',message:'' ,qr:''
});

export class PostData implements postData{
  id: string;
  date: Date;
  dateStr: string;
  name: string;
  message: string;
  qr: string;
  
  constructor(init:Partial<postData> = defaultPostData()){
    this.id = init.id ?? '';
    this.name = init.name ?? '';
    this.message = init.message ?? '';
    this.date = init.date ?? new Date();
    this.dateStr = init.dateStr ?? '';
    this.qr = init.qr ?? '';
  }

  newPost(doc:DocumentData){
    this.id = doc?.id ?? '';
    this.name = doc.data()?.name ?? '';
    this.message = doc.data().message ?? '';
    this.date = doc.data()?.date ?? new Date();
    this.dateStr = doc.data()?.dateStr ?? '';
    this.qr = doc.data()?.qr ?? '';
    return this;
  }

  getDataObj():postData{
    return{
      id: this.id ?? '',
      name: this.name ?? '',
      message: this.message ?? '',
      date: this.date ?? new Date(),
      dateStr: this.dateStr ?? '',
      qr: this.qr ?? ''
    }
  }

  doc () {
    let id = `${this.date.getTime()}`;
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
}