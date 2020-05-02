import {RcsbBoard} from '../../RcsbBoard/RcsbBoard';
import {RcsbFvDefaultConfigValues, RcsbFvDisplayTypes} from '../RcsbFvConfig/RcsbFvDefaultConfigValues';
import {RcsbFvDisplay} from "./RcsbFvDisplay";
import {RcsbFvConfig} from "../RcsbFvConfig/RcsbFvConfig";
import {RcsbFvRowConfigInterface} from "../RcsbFvInterface";
import {
    RcsbFvTrackData,
    RcsbFvDataManager,
    RcsbFvTrackDataMap
} from "../RcsbFvDataManager/RcsbFvDataManager";
import {RcsbDisplayInterface} from "../../RcsbBoard/RcsbDisplay/RcsbDisplayInterface";
import {
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface, ResetInterface, ScaleTransformInterface, SelectionInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";

export class RcsbFvTrack {

    private rcsbBoard: RcsbBoard = null;
    private rcsbTrackArray: Array<RcsbDisplayInterface> = new Array<RcsbDisplayInterface>();
    private rcsbFvDisplay: RcsbFvDisplay = null;
    private rcsbFvConfig: RcsbFvConfig = null;
    private elementId: string = null;
    private trackData:  RcsbFvTrackData | Array<RcsbFvTrackData> = null;
    private loadedData: boolean = false;
    private readonly updateRowHeight: ()=>void;
    private subscription: Subscription;
    private readonly contextManager: RcsbFvContextManager;

    public constructor(args:RcsbFvRowConfigInterface, contextManager: RcsbFvContextManager, updateRowHeight:()=>void) {
        this.contextManager = contextManager;
        this.updateRowHeight = updateRowHeight;
        if (typeof args.elementId === "string" && document.getElementById(args.elementId) !== null) {
            this.rcsbBoard = new RcsbBoard(args.elementId, this.contextManager);
        }
        this.buildTrack(args);
        this.subscription = this.subscribe();
    }

    private buildTrack(args:RcsbFvRowConfigInterface) : void{
        this.setConfig(args);
        if(typeof this.rcsbFvConfig.elementId === "string"){
            this.init(this.rcsbFvConfig.elementId);
        }
        if(typeof this.rcsbFvConfig.trackData !== "undefined" && this.rcsbFvConfig.displayType !== RcsbFvDisplayTypes.COMPOSITE ){
            this.load(this.rcsbFvConfig.trackData);
        }else if(this.rcsbFvConfig.displayType === RcsbFvDisplayTypes.COMPOSITE){
            const data: Array<RcsbFvTrackData> = this.collectCompositeData();
            if(data !== undefined) {
                this.load(data);
            }
        }else{
            this.buildRcsbTrack();
        }
        this.start();
    }

    public init(elementId: string) : void{
        if(document.getElementById(elementId)!== null) {
            this.elementId = elementId;
            if(this.rcsbBoard === null){
                this.rcsbBoard = new RcsbBoard(this.elementId, this.contextManager);
            }
            if (this.rcsbFvConfig.configCheck()) {
                this.initRcsbBoard();
            }else{
                throw "Board length is not defined";
            }
        }else{
            throw "HTML element "+elementId+" not found";
        }
    }

    public setConfig(args: RcsbFvRowConfigInterface) : void{
        if(this.rcsbFvConfig === null) {
            this.rcsbFvConfig = new RcsbFvConfig(args);
        }else{
            this.rcsbFvConfig.updateConfig(args);
        }
    }

    private initRcsbBoard(): void{
        if(typeof this.rcsbFvConfig.elementClickCallBack === "function")
            this.rcsbBoard.setHighLightCallBack(this.rcsbFvConfig.elementClickCallBack);
        if(typeof this.rcsbFvConfig.trackWidth === "number")
            this.rcsbBoard.setBoardWidth(this.rcsbFvConfig.trackWidth);

        this.rcsbBoard.setRange(1-RcsbFvDefaultConfigValues.increasedView, this.rcsbFvConfig.length+RcsbFvDefaultConfigValues.increasedView);
        this.rcsbFvDisplay = new RcsbFvDisplay(this.rcsbFvConfig);
    }

    private buildRcsbTrack(): RcsbDisplayInterface{
        const rcsbTrack: RcsbDisplayInterface = this.rcsbFvDisplay.initDisplay();
        rcsbTrack.height( this.rcsbFvConfig.trackHeight );
        rcsbTrack.trackColor( this.rcsbFvConfig.trackColor );
        this.rcsbTrackArray.push(rcsbTrack);
        return rcsbTrack;
    }

    private collectCompositeData(): Array<RcsbFvTrackData>{
        const data: Array<RcsbFvTrackData> = new Array<RcsbFvTrackData>();
        for(let displayItem of this.rcsbFvConfig.displayConfig){
            if(typeof displayItem.displayData !== "undefined") {
                data.push(displayItem.displayData);
            }
        }
        if(data.length == this.rcsbFvConfig.displayConfig.length) {
            return data;
        }
        return undefined;
    }

    public load(trackData:  RcsbFvTrackData | Array<RcsbFvTrackData>) : void{
        this.trackData = trackData;
        this.loadedData = true;
        if( this.rcsbFvConfig.displayType === RcsbFvDisplayTypes.COMPOSITE && trackData instanceof Array){
            const rcsbCompositeTrack: RcsbDisplayInterface = this.buildRcsbTrack();
            const displayIds: Array<string> = this.rcsbFvDisplay.getDisplayIds();
            const trackDataMap: RcsbFvTrackDataMap = new RcsbFvTrackDataMap();

            const trackNonOverlappingMap: Map<string, Array<RcsbFvTrackData>> = new Map<string, Array<RcsbFvTrackData>>();
            let max:number = 0;

            (trackData as Array<RcsbFvTrackData>).forEach((f,i)=>{
                const id: string = displayIds[i];
                trackDataMap.set(id,f);
                /*const nonOverlapping: Array<RcsbFvTrackData> = RcsbFvDataManager.getNonOverlappingData(f);
                trackNonOverlappingMap.set(id,nonOverlapping);
                if(nonOverlapping.length > max)
                    max = nonOverlapping.length;*/
            });

            /*const trackDataMap: RcsbFvTrackDataMap = new RcsbFvTrackDataMap();
            trackNonOverlappingMap.forEach((v,id)=>{
                trackDataMap.set(id,v[0]);
            });
            rcsbCompositeTrack.load(trackDataMap);
            for(let i=1;i<max;i++){
                const trackDataMap: RcsbFvTrackDataMap = new RcsbFvTrackDataMap();
                trackNonOverlappingMap.forEach((v,id)=>{
                    if(i<v.length)
                        trackDataMap.set(id,v[i]);
                    else
                        trackDataMap.set(id,[]);
                });
                console.log(trackDataMap);
                this.buildRcsbTrack().load(trackDataMap);
            }*/
            rcsbCompositeTrack.load(trackDataMap);
        }else if (trackData instanceof RcsbFvTrackData){
            let nonOverlapping: Array<RcsbFvTrackData>;
            if(!this.rcsbFvConfig.overlap) {
                nonOverlapping = RcsbFvDataManager.getNonOverlappingData(trackData);
            }else{
                nonOverlapping = [trackData];
            }
            nonOverlapping.forEach(trackData=>{
                this.buildRcsbTrack().load(trackData);
            });
        }else{
            this.loadedData = false;
            throw "Data loader error. Data type not supported.";
        }
    }

    public start() : void{
        this.rcsbTrackArray.forEach(track=>{
            this.rcsbBoard.addTrack(track);
        });
        this.rcsbBoard.startBoard();
    }

    private restartTracks() : void{
        this.rcsbTrackArray.forEach(track=>{
            this.rcsbBoard.addTrack(track);
        });
        this.rcsbBoard.startTracks();
    }

    subscribe(): Subscription{
        return this.contextManager.asObservable().subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType===EventType.SCALE) {
                this.setScale(obj.eventData as ScaleTransformInterface);
            }else if(obj.eventType===EventType.SELECTION){
                this.setSelection(obj.eventData as SelectionInterface);
            }else if(obj.eventType===EventType.RESET){
                this.reset(obj.eventData as ResetInterface);
            }
        });
    }

    unsubscribe(): void{
        this.subscription.unsubscribe();
    }

    public setScale(obj: ScaleTransformInterface) : void {
        this.rcsbBoard.setScale(obj);
    }

    public setSelection(obj: SelectionInterface) : void {
        this.rcsbBoard.setSelection(obj);
    }

    private reset(obj: ResetInterface){
        if(this.rcsbFvConfig.trackId === obj.trackId){
            this._reset();
        }
    }

    private _reset(): void{
        this.rcsbTrackArray = new Array<RcsbDisplayInterface>();
        this.rcsbBoard.reset();
    }

    public getTrackHeight(): number{
        if(this.rcsbTrackArray.length > 0) {
            return this.rcsbTrackArray.length * this.rcsbFvConfig.trackHeight;
        }
        return this.rcsbFvConfig.trackHeight;
    }
}