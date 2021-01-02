import { Pipe, PipeTransform } from '@angular/core';
import { DictionaryService } from '../service/dictionary/dictionary.service';

@Pipe({
    name: 'translate',
    pure: true
})

export class TranslatePipe implements PipeTransform {
    constructor(
        private dictionaryService: DictionaryService) {
    }

    transform(value: string): string {
        return this.dictionaryService.getValue(value);
    }
}