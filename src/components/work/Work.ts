import type { DocumentData } from '@firebase/firestore-types'
import { uploadFile ,downloadFile, deleteFile } from './fileCtrl'
import { projectFirestore } from '@/firebase/config'

interface workData {
    eventID: string,
    caption: string,
    viewCnt: number
}

const defaultWorkData = ():workData => ({
    eventID: '',caption:'',viewCnt: 0
});

export class WorkData implements workData{
    eventID: string;
    caption: string;
    viewCnt: number;
    
    constructor(init:Partial<workData> = defaultWorkData()){
        this.eventID = init.eventID ?? '';
        this.caption = init.caption ?? '';
        this.viewCnt = init.viewCnt ?? 0;
    }

    getDataObj():workData{
        return{
            eventID: this.eventID ?? '',
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
}

interface work {
    id: string;
    data: WorkData;
    url1?: string;
    img_large?: string;
    show: boolean;
}

export class Work implements work {
    id: string;
    data: WorkData;
    img?: string | undefined;
    img_large?: string | undefined;
    show: boolean;

    constructor(data:DocumentData){
        this.id = data.id ?? '';
        this.data = new WorkData (data.data());
        this.show = false;
    }

    getDataObj():work {
        return {
            id: this.id?? '',
            data: this.data ?? new WorkData(),
            show:false
        }
    }
    
    async loadImg(){
        if(this.img) return;
        // console.log(`Dowloading:${this.id}`)
        await downloadFile(this.id , 'works').then((imgUrl) => {
            this.img = imgUrl??'';
        });
    }
    
    async loadLargeImg(){
        if(this.img_large) return;
        // console.log(`Dowloading:${this.id}`)
        await downloadFile((this.id+'_large'??'') ,'works').then((imgUrl) => {
            this.img_large = imgUrl??'';
        });
    }

    async delImg(){
        deleteFile((this.id ?? '') , 'works');
        deleteFile((this.id + '_large' ?? '') ,'works');
        projectFirestore.collection("works").doc(this.id).delete();
    }

    async hideImg(){
        this.show = false;
    }

    async showImg(){
        this.show = true;
    }
}