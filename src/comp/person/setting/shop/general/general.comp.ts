import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Service
import { PersonRelationService } from '../../../../../service/person/relation.service';
import { ShopPersonService } from '../../../../../service/person/shop.service';
import { EnumsOpService } from '../../../../../service/enumsop/enumsop.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { ShopGeneralGetCriteriaDto } from '../../../../../dto/person/shop/general-get-criteria.dto';
import { ShopGeneralDto } from '../../../../../dto/person/shop/general.dto';
import { ShopTypeDto } from '../../../../../dto/enumsOp/shop-type.dto';

// Enum
import { ShopTypes } from "../../../../../enum/person/shop-types.enum";
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { Currencies } from '../../../../../enum/person/currencies.enum';
import { RelationTypes } from '../../../../../enum/person/relation-types.enum';

@Component({
    selector: 'person-setting-shop-general',
    templateUrl: './general.comp.html'
})
export class PersonSettingShopGeneralComp implements OnInit, OnDestroy {
    shopId: number;

    @ViewChild('generalShopForm', { static: false }) generalShopForm: NgForm;

    generalDto: ShopGeneralDto;
    shopTypes = ShopTypes;

    shopTypeList: ShopTypeDto[];

    currencies = Currencies;

    busy: boolean = false;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private shopPersonService: ShopPersonService,
        private personRelationService: PersonRelationService,
        private enumsOpService: EnumsOpService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.generalDto = new ShopGeneralDto();

        this.getShopTypeList();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    loadData(shopId: number): void {
        setTimeout(() => {
            this.shopId = shopId;

            const criteriaDto = new ShopGeneralGetCriteriaDto();
            criteriaDto.PersonId = shopId;

            this.busy = true;
            let subs = this.shopPersonService.getGeneral(criteriaDto).subscribe(
                x => {
                    this.utils.unsubs(subs);
                    this.busy = false;

                    if (x.IsSuccess) {
                        this.generalDto = x.Dto;
                    } else {
                        this.dialogService.showError(x.Message);
                    }
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                    this.busy = false;
                }
            );
        });
    }

    save(): void {
        if (!this.personRelationService.hasRelationIn(RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthOnlyShopOwners'));
            return;
        }

        if (this.generalShopForm.invalid) {
            return;
        }
        if (this.generalShopForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
        this.busy = true;

        let subs = this.shopPersonService.updateGeneral(this.generalDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));

                    const profile = this.localStorageService.personProfile;
                    if (profile.PersonId == this.generalDto.ShopId) {
                        profile.FullName = this.generalDto.ShortName;
                        profile.DefaultCurrencyId = this.generalDto.DefaultCurrencyId;

                        this.localStorageService.setPersonProfile(profile);

                        this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, 'PersonSettingShopGeneralComp');

                        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'ProfileChanged');
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;
            }
        );
    }

    getShopTypeList(): void {
        this.shopTypeList = [];
        let subs = this.enumsOpService.getShopTypeList().subscribe(
            x => {
                this.utils.unsubs(subs);

                this.shopTypeList = x.Dto;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getShopTypeList', subs);
            }
        );
    }
}