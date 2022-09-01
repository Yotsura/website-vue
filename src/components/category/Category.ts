import type { DocumentData } from '@firebase/firestore-types'
import { projectFirestore } from '@/firebase/config'

interface categoryInfo {
  id: string,
  name: string,
  date: number,
}

const defaultCategoryData = ():categoryInfo => ({
  id: '' , name: '' , date: new Date().getTime() 
});

export class CategoryData implements categoryInfo{
  id: string;
  name: string;
  date: number;
  
  constructor(init:Partial<categoryInfo> = defaultCategoryData()){
    this.id = init.id ?? '';
    this.name = init.name ?? '';
    this.date = init.date ?? new Date().getTime();
  }

  newCategory(doc:DocumentData){
    this.id = doc.data()?.id ?? '';
    this.name = doc.data()?.name ?? '';
    this.date = doc.data()?.date ?? new Date().getTime();
    return this;
  }

  newAllCategoryTag(){
    this.id = '';
    this.name = 'ALL';
    this.date = new Date().getTime();
    return this;
  }

  getDataObj():categoryInfo{
    return{
      id: this.id ?? '',
      name: this.name ?? '',
      date: this.date ?? new Date,
    }
  }

  doc () {
    const docid = `${this.id}-${this.date}`;
    return projectFirestore.collection("categories").doc(docid);
  }

  async setData() {
    await this.doc().set(this.getDataObj());
  }

  updData() {
    this.doc().update(this.getDataObj());
  }

  deleteData() {
    this.doc().delete().then(() => console.log("deleted"));
  }
}