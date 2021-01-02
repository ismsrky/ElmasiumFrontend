import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-star',
    templateUrl: './star.comp.html'
})
export class AppStarComp {
    @Input('max') max: number = 5;
    @Input('value') value: number = 0;
    @Input('showValue') showValue: boolean = true;

    maxList: number[];

    fillArray(index: number): Array<number> {
        return Array(index).fill(0);
    }
    getIconName(i: number): string {
        let result: string = '';

        if (this.value <= 0) {
            result = 'star-o';
        } else if (this.value > i && this.value < (i + 1)) {
            result = 'star-half-o';
        } else if (this.value > i) {
            result = 'star';
        } else {
            result = 'star-o';
        }
        
        //value >= i && value < (i+ 1) ? 'star-half' : (value >= i) ? 'star' : 'star-o'

        return result;
    }
}