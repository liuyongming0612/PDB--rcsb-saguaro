import {Selection, BaseType} from "d3-selection";
import {ScaleLinear} from "d3-scale";
import {RcsbD3Constants} from "../RcsbD3Constants";

export interface PlotBlockInterface {
    elements: Selection<SVGGElement,any,null,undefined>;
    dx: number;
    dy: number;
    y_o: number;
    xScale: ScaleLinear<number,number>;
    color?: string;
}

export interface MoveBlockInterface {
    elements: Selection<SVGGElement,any,BaseType,undefined>;
    dx: number;
    xScale: ScaleLinear<number,number>;
}

export class RcsbD3BlockManager {

    plotBlockDisplay(config: PlotBlockInterface): void{
        const elements: Selection<SVGGElement,any,null,undefined> = config.elements;
        const dy: number = config.dy;
        const dx: number = config.dx;
        const y_o: number = config.y_o;
        const xScale: ScaleLinear<number,number> = config.xScale;
        const color: string = config.color;
        elements.append(RcsbD3Constants.RECT)
            .attr(RcsbD3Constants.X, (d, i) => {
                return xScale(d.start-dx);
            })
            .attr(RcsbD3Constants.Y, y_o)
            .attr(RcsbD3Constants.WIDTH, function (d, i) {
                return (xScale(d.end+dx) - xScale(d.start-dx));
            })
            .attr(RcsbD3Constants.HEIGHT, dy)
            .attr(RcsbD3Constants.FILL, color)
            .transition()
            .duration(500)
            .attr(RcsbD3Constants.FILL, function (d) {
                if (d.color === undefined) {
                    return color;
                } else {
                    return d.color;
                }
            })
            .attr(RcsbD3Constants.FILL_OPACITY,0.5)
            .attr(RcsbD3Constants.STROKE, function (d) {
                if (d.color === undefined) {
                    return color;
                } else {
                    return d.color;
                }
            })
            .attr(RcsbD3Constants.STROKE_OPACITY,1)
            .attr(RcsbD3Constants.STROKE_WIDTH,2);
    }

    moveBlockDisplay(config: MoveBlockInterface){
        var xScale = config.xScale;
        const dx = config.dx;
        const blocks: Selection<SVGGElement,any,BaseType,undefined> = config.elements;
        blocks.select(RcsbD3Constants.RECT)
            .attr(RcsbD3Constants.X, function (d) {
                return xScale(d.start-dx);
            })
            .attr(RcsbD3Constants.WIDTH, function (d) {
                return (xScale(d.end+dx) - xScale(d.start-dx));
            });
    }

}
