import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LocalStorageService } from './local-storage.service';
import { Stc } from '../../stc';
import { Subscription } from 'rxjs';
import { DateRanges } from '../../enum/sys/date-ranges.enum';
import { Currencies } from '../../enum/person/currencies.enum';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { RelationTypes } from '../../enum/person/relation-types.enum';

@Injectable()
export class UtilService {
    constructor() {
    }

    calcAverageStar(starSum: number, starCount: number): number {
        if (this.isNull(starSum)) starSum = 0;
        if (this.isNull(starCount)) starCount = 0;

        let result: number = 0;

        if (starCount > 0) {
            result = this.round(starSum / starCount, 1);
        } else {
            result = 0;
        }

        return result;
    }

    round(value, places): number {
        let multiplier: number = Math.pow(10, places);

        return (Math.round(value * multiplier) / multiplier);
    }

    isNull(value: any): boolean {
        if (value == undefined || value == null) return true;

        if (this.isString(value) && value == '') return true;


        if (this.isString(value) && value.trim() == '') return true;

        return false;
    }
    isNotNull(value: any): boolean {
        return !this.isNull(value);
    }
    isString(value: any): boolean {
        return typeof value === 'string';
    }
    isDate(value: any): boolean {
        return value instanceof Date;
    }

    unsubs(subs: Subscription): void {
        if (this.isNotNull(subs) && !subs.closed) {
            subs.unsubscribe();

            subs = null;
        }
    }
    unsubsEvent(event: EventEmitter<any>): void {
        if (this.isNotNull(event) && !event.closed) {
            event.unsubscribe();

            event = null;
        }
    }

    isPositiveInteger(s): boolean {
        return /^\+?[0-9][\d]*$/.test(s);
    }

    getDateNumber(value: Date): number {
        if (this.isNull(value)) return null;

        return value.getTime() - (value.getTimezoneOffset() * 60 * 1000);
    }

    addDays(dateNumber: number, days: number): number {
        let result = new Date(dateNumber);
        result.setDate(result.getDate() + days);
        return this.getDateNumber(result);
    }

    getCurrencyMaskOptions(currencyId: Currencies): CurrencyMaskConfig {
        const currencyDto = Stc.currenciesDto.find(c => c.Id == currencyId);

        const prefix: string = this.isNull(currencyDto.IconStr) ? currencyDto.Code : currencyDto.IconStr;
        return {
            align: "right",
            allowNegative: false,
            allowZero: true,
            decimal: ",",
            precision: 2,
            prefix: prefix + " ",
            suffix: "",
            thousands: ".",
            nullable: false
        };
    }
    getPercentageMaskOptions(): CurrencyMaskConfig {
        return {
            align: "right",
            allowNegative: false,
            allowZero: true,
            decimal: ".",
            precision: 2,
            prefix: "% ",
            suffix: "",
            thousands: ",",
            nullable: false
        };
    }
    getQuantityMaskOptions(): CurrencyMaskConfig {
        return {
            align: "right",
            allowNegative: false,
            allowZero: false,
            decimal: ",",
            precision: 0,
            prefix: "",
            suffix: "",
            thousands: ".",
            nullable: false
        };
    }

    getPositiveIntMaskOptions(): CurrencyMaskConfig {
        return {
            align: "right",
            allowNegative: false,
            allowZero: false,
            decimal: ",",
            precision: 0,
            prefix: "",
            suffix: "",
            thousands: "",
            nullable: false
        };
    }

    getMyPersonRelationList(): RelationTypes[] {
        const result: RelationTypes[] = [];

        result.push(RelationTypes.xMyself);
        result.push(RelationTypes.xShopOwner);
        result.push(RelationTypes.xStaff);

        return result;
    }

    getNow(): number {
        // return this.getDateNumber(new Date(Date.now()));
        return Date.now();
    }

    getStartDate(dateRange: DateRanges): number {
        let startDate: number = this.getNow();
        switch (dateRange) {
            case DateRanges.xCustomDate:
                break;
            case DateRanges.xToday:
                startDate = this.getNow();
                break;
            case DateRanges.xLast1Month:
                startDate = this.addDays(startDate, -30);
                break;
            case DateRanges.xLast3Month:
                startDate = this.addDays(startDate, -90);
                break;
            case DateRanges.xLast6Month:
                startDate = this.addDays(startDate, -180);
                break;
            case DateRanges.xLast1Year:
                startDate = this.addDays(startDate, -365);
                break;
            case DateRanges.xLast2Year:
                startDate = this.addDays(startDate, -730);
                break;
            case DateRanges.xLast3Year:
                startDate = this.addDays(startDate, -1095);
                break;
            default:
                break;
        }

        return startDate;
    }
}