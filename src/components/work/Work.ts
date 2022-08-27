import type { DocumentData } from '@firebase/firestore-types'
import { downloadFile, deleteFile } from './fileCtrl'

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
        this.eventID = '';
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
        console.log(`Dowloading:${this.id}`)
        await downloadFile(this.id , 'works').then((imgUrl) => {
            this.img = imgUrl??'';
        });
    }
    
    async loadLargeImg(){
        if(this.img_large) return;
        console.log(`Dowloading:${this.id}`)
        await downloadFile((this.id+'_large'??'') ,'works').then((imgUrl) => {
            this.img_large = imgUrl??'';
        });
    }

    async delImg(){
        deleteFile((this.id ?? '') , 'works');
        deleteFile((this.id + '_large' ?? '') ,'works');
    }

    async hideImg(){
        this.show = false;
    }

    async showImg(){
        this.show = true;
    }
}