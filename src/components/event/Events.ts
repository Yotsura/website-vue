import type { DocumentData } from '@firebase/firestore-types'
import { Work } from '@/components/work/Work';
import { projectFirestore } from '@/firebase/config'
import { ref } from 'vue'

interface eventInfo {
  id: string,
  name: string,
  date: Number,
}

const defaultEventData = ():eventInfo => ({
  id: '' , name: '' , date: new Date().getTime() 
});

export class EventData implements eventInfo{
  id: string;
  name: string;
  date: Number;
  
  constructor(init:Partial<eventInfo> = defaultEventData()){
    this.id = init.id ?? '';
    this.name = init.name ?? '';
    this.date = init.date ?? new Date().getTime();
  }

  newEvent(doc:DocumentData){
    this.id = doc.data()?.id ?? '';
    this.name = doc.data()?.name ?? '';
    this.date = doc.data()?.date ?? new Date().getTime();
    return this;
  }

  getDataObj():eventInfo{
    return{
      id: this.id ?? '',
      name: this.name ?? '',
      date: this.date ?? new Date,
    }
  }

  doc () {
    let docid = `${this.id}-${this.date}`;
    return projectFirestore.collection("events").doc(docid);
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