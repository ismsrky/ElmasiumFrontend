import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'enums'
})
export class EnumsPipe implements PipeTransform {
    transform(value, args: string[]): any {
        let pairs = [];
        for (var enumMember in value) {
            if (!isNaN(parseInt(enumMember, 10))) {
                if (parseInt(enumMember, 10) >= 0) { // negative values are system values and not for UI.
                    pairs.push({ key: parseInt(enumMember, 10), value: value[enumMember] });
                }
            }
        }
        return pairs;
    }
}