/**
 * import { Component } from '@angular/core';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';

@Component({
    selector: 'app-numpad',
    templateUrl: './numpad.comp.html'
})
export class NumPadComp {
    constructor(
        private compBroadCastService: CompBroadCastService) {
    }

    pressButton(value: number) {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, JSON.stringify({ 'NumPad': value }));
    }
}
 */