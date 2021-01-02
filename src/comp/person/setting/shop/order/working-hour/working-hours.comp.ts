import { Component, OnInit, ViewChild, OnDestroy, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

// Comp
import { PersonSettingShopOrderWorkingHoursDayComp } from './day.comp';

// Service
import { ShopPersonService } from '../../../../../../service/person/shop.service';
import { DictionaryService } from '../../../../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../../../../service/sys/comp-broadcast-service';
import { UtilService } from '../../../../../../service/sys/util.service';
import { ToastrService } from 'ngx-toastr';

// Dto
import { ShopWorkingHoursDto } from '../../../../../../dto/person/shop/working-hours.dto';
import { ShopWorkingHoursGetCriteriaDto } from '../../../../../../dto/person/shop/working-hours-get-criteria.dto';

// Bo

// Enum
import { DialogIcons } from '../../../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../../../enum/sys/dialog/dialog-buttons.enum';
import { DaysofWeek } from '../../../../../../enum/general/days-of-week.enum';
import { CompBroadCastTypes } from '../../../../../../enum/sys/comp-broadcast-types.enum';
import { LogExceptionService } from '../../../../../../service/log/exception.service';

@Component({
    selector: 'person-setting-shop-order-working-hours',
    templateUrl: './working-hours.comp.html'
})
export class PersonSettingShopOrderWorkingHoursComp implements OnInit, OnDestroy {
    @ViewChild('workingHoursForm', { static: false }) workingHoursForm: NgForm;

    // days of week
    @ViewChild('monday', { static: false }) monday: PersonSettingShopOrderWorkingHoursDayComp;
    @ViewChild('tuesday', { static: false }) tuesday: PersonSettingShopOrderWorkingHoursDayComp;
    @ViewChild('wednesday', { static: false }) wednesday: PersonSettingShopOrderWorkingHoursDayComp;
    @ViewChild('thursday', { static: false }) thursday: PersonSettingShopOrderWorkingHoursDayComp;
    @ViewChild('friday', { static: false }) friday: PersonSettingShopOrderWorkingHoursDayComp;
    @ViewChild('saturday', { static: false }) saturday: PersonSettingShopOrderWorkingHoursDayComp;
    @ViewChild('sunday', { static: false }) sunday: PersonSettingShopOrderWorkingHoursDayComp;

    workingHoursDto: ShopWorkingHoursDto;

    days = DaysofWeek;

    subscriptionApplyToAll: Subscription;

    shopId: number;
    constructor(
        private shopPersonService: ShopPersonService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {

        this.workingHoursDto = new ShopWorkingHoursDto();
    }
    busy: boolean = false;

    ngOnInit(): void {
        setTimeout((): void => {
            this.monday.applyAllEvent = new EventEmitter();
            this.subscriptionApplyToAll = this.monday.applyAllEvent.subscribe(
                x => {
                    this.applyToAll();
                }
            );
        }, 500);
    }
    ngOnDestroy() {
        this.utils.unsubs(this.subscriptionApplyToAll);
    }

    applyToAll(): void {
        this.monday.submit();
        if (!this.monday.isValid) return;

        const sampleWorkingType: number = this.monday.workingType;
        const sampleTime: string = this.monday.getTime();

        this.tuesday.workingType = sampleWorkingType;
        this.tuesday.setTime(sampleTime);

        this.wednesday.workingType = sampleWorkingType;
        this.wednesday.setTime(sampleTime);

        this.thursday.workingType = sampleWorkingType;
        this.thursday.setTime(sampleTime);

        this.friday.workingType = sampleWorkingType;
        this.friday.setTime(sampleTime);

        this.saturday.workingType = sampleWorkingType;
        this.saturday.setTime(sampleTime);

        this.sunday.workingType = sampleWorkingType;
        this.sunday.setTime(sampleTime);
    }

    setHours(): void {
        this.monday.setTime(this.workingHoursDto.MonStartEnd);
        this.tuesday.setTime(this.workingHoursDto.TuesStartEnd);
        this.wednesday.setTime(this.workingHoursDto.WedStartEnd);
        this.thursday.setTime(this.workingHoursDto.ThursStartEnd);
        this.friday.setTime(this.workingHoursDto.FriStartEnd);
        this.saturday.setTime(this.workingHoursDto.SatStartEnd);
        this.sunday.setTime(this.workingHoursDto.SunStartEnd);
    }
    getHours(): void {
        this.workingHoursDto.MonStartEnd = this.monday.getTime();
        this.workingHoursDto.TuesStartEnd = this.tuesday.getTime();
        this.workingHoursDto.WedStartEnd = this.wednesday.getTime();
        this.workingHoursDto.ThursStartEnd = this.thursday.getTime();
        this.workingHoursDto.FriStartEnd = this.friday.getTime();
        this.workingHoursDto.SatStartEnd = this.saturday.getTime();
        this.workingHoursDto.SunStartEnd = this.sunday.getTime();
    }

    loadData(shopId: number): void {
        this.shopId = shopId;
        this.busy = true;
        const criteriaDto = new ShopWorkingHoursGetCriteriaDto();
        criteriaDto.PersonId = shopId;
        let subs = this.shopPersonService.getWorkingHours(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                
                if (x.IsSuccess) {
                    this.workingHoursDto = x.Dto;

                    this.setHours();

                    this.setDirtyAll(false);
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }
    submitAll(): boolean {
        let retValue: boolean = false;

        retValue = this.monday.submit()
            && this.tuesday.submit()
            && this.wednesday.submit()
            && this.thursday.submit()
            && this.friday.submit()
            && this.saturday.submit()
            && this.sunday.submit();

        return retValue;
    }
    setDirtyAll(value: boolean): void {
        setTimeout(
            (): void => {
                this.monday.isDirty = value;
                this.tuesday.isDirty = value;
                this.wednesday.isDirty = value;
                this.thursday.isDirty = value;
                this.friday.isDirty = value;
                this.saturday.isDirty = value;
                this.sunday.isDirty = value;
            }, 500
        );
    }
    isDirtyAll(): boolean {
        let isDirty: boolean = false;

        isDirty = this.monday.isDirty
            || this.tuesday.isDirty
            || this.wednesday.isDirty
            || this.thursday.isDirty
            || this.friday.isDirty
            || this.saturday.isDirty
            || this.sunday.isDirty;

        return isDirty;
    }
    update(): void {
        //Manual validation
        if (this.submitAll() == false) {
            return;
        }
        if (this.isDirtyAll()) {
            this.workingHoursForm.form.markAsDirty();
        } else {
            this.workingHoursForm.form.markAsPristine();
        }
        /**
         * No need to check this.
         *  if (this.workingHoursForm.pristine) {
             this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
             return;
         }
         */
        this.getHours();

        /**
         *No need to check this
         *  if (this.checkAllDays()) {
            this.dialogService.show({
                text: 'Napıyon olum sen dükkanı hiç açmıcan mı?',
                icon: DialogIcons.Warning,
                buttons: DialogButtons.OK,
                closeIconVisible: true
            });
            return;
        }
         */

        this.busy = true;
        this.setDirtyAll(false);
        this.workingHoursDto.PersonId = this.shopId;
        let subscribe = this.shopPersonService.updateWorkingHours(this.workingHoursDto).subscribe(
            x => {
                subscribe.unsubscribe();

                this.busy = false;

                if (x.IsSuccess) {
                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, 'PersonSettingShopOrderWorkingHoursComp');
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                subscribe.unsubscribe();

                this.busy = false;

                this.dialogService.show({
                    text: err,
                    icon: DialogIcons.Warning,
                    buttons: DialogButtons.OK,
                    closeIconVisible: true
                });
            }
        );
    }

    checkAllDays(): boolean {
        const retValue = this.monday.workingType == -1
            && this.tuesday.workingType == -1
            && this.wednesday.workingType == -1
            && this.thursday.workingType == -1
            && this.friday.workingType == -1
            && this.saturday.workingType == -1
            && this.sunday.workingType == -1

        return retValue;
    }
}