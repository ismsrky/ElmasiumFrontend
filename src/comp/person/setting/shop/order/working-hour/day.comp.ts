import { Component, OnInit, ViewChild, OnDestroy, Input, EventEmitter } from '@angular/core';
import { TimepickerComponent } from 'ngx-bootstrap';

// Enum
import { DaysofWeek } from '../../../../../../enum/general/days-of-week.enum';
import { Stc } from '../../../../../../stc';
import { UtilService } from '../../../../../../service/sys/util.service';

@Component({
    selector: 'person-setting-shop-order-working-hours-day',
    templateUrl: './day.comp.html'
})

export class PersonSettingShopOrderWorkingHoursDayComp implements OnInit, OnDestroy {
    workingType: number;

    openingDate: Date = new Date();
    closingDate: Date = new Date();

    isDirty: boolean = false;
    isValid: boolean = true;
    isShowApplyAll: boolean = false;

    @Input('DayofWeek') dayOfWeek: DaysofWeek;
    @ViewChild('tpOpeningDate', { static: false }) tpOpeningDate: TimepickerComponent;
    @ViewChild('tpClosingDate', { static: false }) tpClosingDate: TimepickerComponent;

    dayName: string = '';

    minTime: Date = new Date();
    maxTime: Date = new Date();

    applyAllEvent?: EventEmitter<any>;

    constructor(private utils: UtilService) {
        this.workingType = -1;

        this.isDirty = false;

        this.minTime.setHours(0);
        this.minTime.setMinutes(0);

        this.maxTime.setHours(23);
        this.maxTime.setMinutes(59);
    }

    ngOnInit(): void {
        this.dayName = DaysofWeek[this.dayOfWeek];
        this.isShowApplyAll = this.dayOfWeek == DaysofWeek.xMonday;
    }
    ngOnDestroy(): void {
    }

    setTime(value: string): void {
        if (value.length == 8) {
            this.openingDate = new Date();
            this.closingDate = new Date();

            this.workingType = 1;

            this.openingDate.setHours(Number(value.substring(0, 2)));
            this.openingDate.setMinutes(Number(value.substring(2, 4)));

            this.closingDate.setHours(Number(value.substring(4, 6)));
            this.closingDate.setMinutes(Number(value.substring(6, 8)));
        } else {
            this.openingDate = null;
            this.closingDate = null;

            this.workingType = Number(value);
        }
        this.isDirty = false;
    }

    getTime(): string {
        if (this.workingType == 1) {
            return ("0" + this.openingDate.getHours()).slice(-2)
                + ("0" + this.openingDate.getMinutes()).slice(-2)
                + ("0" + this.closingDate.getHours()).slice(-2)
                + ("0" + this.closingDate.getMinutes()).slice(-2);
        } else {
            return this.workingType.toString();
        }
    }

    workingTypeChange(valuesdf: number): void {
        this.isDirty = true;

        if (this.workingType == 1) {
            this.setTime('08302200');
        }

        this.submit();
    }

    submit(): boolean {
        if (this.workingType == 1 && (this.utils.isNull(this.openingDate) || this.utils.isNull(this.closingDate))) {
            this.isValid = false;
        } else {
            this.isValid = true;
        }

        return this.isValid;
    }

    changedDate(): void {
        this.submit();

        this.isDirty = true;
    }

    applyAllClicked(): void {
        if (this.utils.isNull(this.applyAllEvent) || this.applyAllEvent.closed) return;

        this.applyAllEvent.emit();
    }
}