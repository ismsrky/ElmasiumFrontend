import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { DictionaryDto } from '../../dto/dictionary/dictionary.dto';
import { RealPersonBo } from '../../bo/person/real/real-person.bo';
import { RealPersonRememberBo } from '../../bo/person/real/real-person-remember';
import { AddressCityDto } from '../../dto/address/city.dto';
import { CompBroadCastService } from './comp-broadcast-service';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { PersonProfileBo } from '../../bo/person/profile.bo';
import { Stc } from '../../stc';
import { GotItBo } from '../../bo/sys/got-it-bo';
import { GotItTypes } from '../../enum/sys/got-it-types.enum';
import { UtilService } from './util.service';

@Injectable()
export class LocalStorageService {
    constructor(private utils: UtilService) {
    }
    
    get realPerson(): RealPersonBo {
        const str = localStorage.getItem('RealPerson');
        if (!str) {
            return new RealPersonBo(); // we should not return null.
        }
        const json = JSON.parse(str);

        // create an instance of the User class
        const person = Object.create(RealPersonBo.prototype);

        // copy all the fields from the json object
        return Object.assign(person, json);
    }
    setRealPerson(value: RealPersonBo) {
        if (this.utils.isNull(value)) {
            localStorage.removeItem('RealPerson');
        } else {
            localStorage.setItem('RealPerson', JSON.stringify(value));
        }
    }
    clearRealPerson(): void {
        this.setRealPerson(null);
    }

    get realPersonRemember(): RealPersonRememberBo {
        const str = localStorage.getItem('RealPersonRemember');
        if (this.utils.isNull(str)) return null;

        const json = JSON.parse(str);

        // create an instance of the User class
        const person = Object.create(RealPersonRememberBo.prototype);

        // copy all the fields from the json object
        return Object.assign(person, json);
    }

    setPersonProfile(value: PersonProfileBo) {
        if (this.utils.isNull(value)) {
            localStorage.removeItem('PersonProfile');
        } else {
            localStorage.setItem('PersonProfile', JSON.stringify(value));
        }
    }
    clearPersonProfile(): void {
        this.setPersonProfile(null);
    }
    get personProfile(): PersonProfileBo {
        const str = localStorage.getItem('PersonProfile');
        if (!str) {
            return new PersonProfileBo(); // we should not return null.
        }
        const json = JSON.parse(str);

        // create an instance of the User class
        const person = Object.create(PersonProfileBo.prototype);

        // copy all the fields from the json object
        return Object.assign(person, json);
    }

    set realPersonRemember(value: RealPersonRememberBo) {
        if (this.utils.isNull(value)) {
            localStorage.removeItem('RealPersonRemember');
        } else {
            localStorage.setItem('RealPersonRemember', JSON.stringify(value));
        }
    }

    get LangId(): number {
        let langId = localStorage.getItem('langId');
        if (this.utils.isNull(langId)) {
            return 0;
        }

        return Number(langId);
    }
    set LangId(value: number) {
        localStorage.setItem('langId', value.toString());
    }

    getDicChangeSetId(langId: number): string {
        const dics_str = localStorage.getItem('Dics_' + langId);
        if (this.utils.isNull(dics_str)) return null;

        const dics: DictionaryDto[] = JSON.parse(dics_str);
        if (this.utils.isNull(dics) || dics.length == 0) return null;

        const item: DictionaryDto = dics.find(x => x.Key == 'ChangeSetId');
        if (this.utils.isNull(item)) return null;

        return item.Value;
    }
    setDics(langId: number, dics: DictionaryDto[]): void {
        localStorage.setItem('Dics_' + langId, JSON.stringify(dics));
    }
    getDics(): DictionaryDto[] {
        const dic_data = localStorage.getItem('Dics_' + this.LangId);
        if (this.utils.isNull(dic_data)) return null;
        return JSON.parse(dic_data);
    }

    private setGotItList(gotItList: GotItBo[]): void {
        localStorage.setItem('GotItList', JSON.stringify(gotItList));
    }
    private getGotItList(): GotItBo[] {
        const gotItList = localStorage.getItem('GotItList');
        if (this.utils.isNull(gotItList)) return null;
        return JSON.parse(gotItList);
    }

    gotIt(gotItTypeId: GotItTypes): boolean {
        let result: boolean = false;

        const gotItList = this.getGotItList();
        if (this.utils.isNotNull(gotItList) && gotItList.length > 0) {
            let gotItBo = gotItList.find(f => f.PersonId == this.realPerson.Id && f.GotItTypeId == gotItTypeId);

            if (this.utils.isNotNull(gotItBo)) {
                result = gotItBo.GotIt;
            }
        }

        return result;
    }
    setGotIt(gotItTypeId: GotItTypes, gotIt: boolean): void {
        let gotItList = this.getGotItList();
        if (this.utils.isNull(gotItList)) {
            gotItList = [];
        }

        let gotItBo: GotItBo;

        gotItBo = gotItList.find(f => f.PersonId == this.realPerson.Id && f.GotItTypeId == gotItTypeId);

        if (this.utils.isNull(gotItBo)) {
            gotItBo = new GotItBo();
            gotItBo.PersonId = this.realPerson.Id;
            gotItBo.GotIt = gotIt;
            gotItBo.GotItTypeId = gotItTypeId;

            gotItList.push(gotItBo);
        } else {
            gotItBo.GotIt = gotIt;
        }

        this.setGotItList(gotItList);
    }
}
