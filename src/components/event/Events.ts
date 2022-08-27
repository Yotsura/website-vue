import type { DocumentData } from '@firebase/firestore-types'
import { Work } from '@/components/work/Work';
import { projectFirestore } from '@/firebase/config'
import { ref } from 'vue'

interface eventInfo {
  id: string,
  name: string,
  date: Date,
  // works?: Work[]
}

const defaultEventData = ():eventInfo => ({
  id: '' , name: '' , date: new Date 
});

export class EventData implements eventInfo{
  id: string;
  name: string;
  date: Date;
  // works: Work[] | undefined;
  
  constructor(init:Partial<eventInfo> = defaultEventData()){
    this.id = init.id ?? '';
    this.name = init.name ?? '';
    this.date = init.date ?? new Date;
    // if(init.works)
    //   this.works = init.works;
  }

  newEvent(doc:DocumentData){
    // console.log(doc.id);
    // console.log(doc.data());
    this.id = doc.data()?.id ?? '';
    this.name = doc.data()?.name ?? '';
    this.date = doc.data()?.date ?? new Date;
    return this;
  }

  getDataObj():eventInfo{
    return{
      id: this.id ?? '',
      name: this.name ?? '',
      date: this.date ?? new Date,
    }
  }

  async setData() {
    await projectFirestore.collection("events")
    .doc(`${this.id}-${this.date.getTime()}`).set(this.getDataObj());
  }

  updData() {
    projectFirestore.collection("event")
    .doc(this.id).update(this.getDataObj());
  }

  deleteData() {
    projectFirestore.collection("event")
    .doc(this.id).delete().then(() =>{
      console.log('storeレコード削除完了');
    });
  }
}