export interface RcsbFvTrackDataElementGapInterface {
    begin:number;
    end:number;
}

export interface RcsbFvTrackDataElementInterface {
    value?: number|string;
    gValue?: number|string;
    begin: number;
    end?: number;
    beginName?: string;
    endName?: string;
    oriBegin?: number;
    oriEnd?: number;
    oriBeginName?: string;
    oriEndName?: string;
    indexName?: string;
    label?: string;
    name?: string;
    color?: string;
    description?: Array<string>;
    featureId?: string;
    type?: string;
    title?: string;
    isEmpty?: boolean;
    nonSpecific?: boolean;
    gaps?:Array<RcsbFvTrackDataElementGapInterface>;
    openBegin?:boolean;
    openEnd?:boolean;
    sourceId?: string;
    provenance?: string;
}

export class RcsbFvTrackData extends Array<RcsbFvTrackDataElementInterface>{
}

export class RcsbFvTrackDataMap extends Map<string,RcsbFvTrackData>{
}

export class RcsbDataManager {

    public static joinTrackDataArray(dataList: Array<RcsbFvTrackData>): RcsbFvTrackData{
        const out: RcsbFvTrackData = new RcsbFvTrackData();
        dataList.forEach(d=>{
            d.forEach(e=>{
                out.push(e);
            })
        });
        return out;
    }

    public static getNonOverlappingData(data: RcsbFvTrackData): Array<RcsbFvTrackData> {
        const out : Array<RcsbFvTrackData> = new Array<RcsbFvTrackData>();
        data.sort((a,b)=>{
            if(typeof a.begin === "number" && typeof b.begin === "number") {
                return (a.begin-b.begin);
            }else{
                throw "Unknown rowConfigData element structure";
            }
        });
        for(const a of data){
            if(typeof a === "string")
                continue;
            let pushed: boolean = false;
            for(const track of out){
                let overlap: boolean = false;
                for(const b of track){
                    if(this.doOverlap(a,b)){
                        overlap = true;
                        break;
                    }
                }
                if(!overlap) {
                    track.push(a);
                    pushed = true;
                    break;
                }
            }
            if(!pushed){
                out.push(new RcsbFvTrackData());
                out[out.length-1].push(a);
            }
        }
        return out;
    }

    private static doOverlap(a: RcsbFvTrackDataElementInterface, b: RcsbFvTrackDataElementInterface): boolean{
        if(typeof a.begin === "number" && typeof b.begin === "number" && typeof a.end === "number" && typeof b.end === "number") {
                if( a.end < b.begin || b.end < a.begin)
                    return false;
        }else if(typeof a.begin === "number" && typeof b.begin === "number") {
            if(a.begin != b.begin)
                return false;
        }
        return true;
    }

    public static processData(dataTrack: RcsbFvTrackData): RcsbFvTrackData {
        if(dataTrack instanceof Array) {
            const rcsbFvDataClass: RcsbFvTrackData = new RcsbFvTrackData();
            for (const dataElement of dataTrack) {
                rcsbFvDataClass.push(dataElement as RcsbFvTrackDataElementInterface);
            }
            return rcsbFvDataClass;
        }else{
            console.error(dataTrack);
            throw "Data format error."
        }
    }
}