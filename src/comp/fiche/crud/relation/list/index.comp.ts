import { Component, OnInit, ViewChild, OnDestroy, Host, Input } from '@angular/core';
import { Subscription } from 'rxjs';

// Service
import { FicheService } from '../../../../../service/fiche/fiche.service';
import { PersonProductService } from '../../../../../service/person/product.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { ToastrService } from 'ngx-toastr';

// Dto
import { ProductPriceDto } from '../../../../../dto/product/price/price.dto';

// Component
import { FicheCrudComp } from '../../crud.comp';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../../enum/sys/dialog/dialog-buttons.enum';
import { FicheSearchIndexComp } from '../../../search/index.comp';
import { FicheSearchShowCriteriaBo } from '../../../../../bo/fiche/search-show-criteria.bo';
import { FicheRelationSaveDto } from '../../../../../dto/fiche/relation/save.dto';
import { FicheRelationTypes } from '../../../../../enum/fiche/relation-types.enum';
import { UtilService } from '../../../../../service/sys/util.service';

@Component({
    selector: 'fiche-relation-list-index',
    templateUrl: './index.comp.html'
})
export class FicheRelationListIndexComp implements OnInit, OnDestroy {
    constructor(
        @Host() host: FicheCrudComp,
        private personProductService: PersonProductService,
        private ficheService: FicheService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private utils: UtilService,
        private toastr: ToastrService) {
        this.host = host;
        this.host.relatedFicheListDto = [];
        this.handleFicheRelationList();
    }

    @ViewChild(FicheSearchIndexComp, { static: false }) ficheSearchCrud: FicheSearchIndexComp;
    modalProductClosedSubscription: Subscription;
    isFicheModalOpen: boolean = false;

    busy: boolean = false;

    host: FicheCrudComp;

    ngOnInit(): void {
        this.modalProductClosedSubscription = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'FicheSearch') {
                    this.isFicheModalOpen = false;
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.modalProductClosedSubscription);
    }

    codeStr: string = '';

    openModal(): void {
        this.isFicheModalOpen = true;

        const newPriceDto: ProductPriceDto = new ProductPriceDto();
        newPriceDto.CurrencyId = this.host.ficheDto.CurrencyId;

        setTimeout(() => {
            const criteriaBo = new FicheSearchShowCriteriaBo();
            criteriaBo.CreditPersonId = this.host.ficheDto.DebtPersonId;
            criteriaBo.DebtPersonId = this.host.ficheDto.CreditPersonId;

            criteriaBo.MyPersonId = this.host.profile.PersonId;

            if (this.host.relatedFicheListDto.length > 0) {
                criteriaBo.ExcludingFicheIdList = [];
                this.host.relatedFicheListDto.forEach(element => {
                    // To prevent selecting same fiche.
                    criteriaBo.ExcludingFicheIdList.push(element.Id);
                });
            } else {
                criteriaBo.ExcludingFicheIdList = null;
            }

            criteriaBo.Multiple = true;
            let subscribeShowModal = this.ficheSearchCrud.showModal(criteriaBo).subscribe(
                x => {
                    this.utils.unsubs(subscribeShowModal);

                    let count: number = 0;
                    x.forEach(element => {
                        count++;

                        this.host.relatedFicheListDto.push(element);

                        if (count == this.host.relatedFicheListDto.length) {
                            this.handleFicheRelationList();
                        }
                    });

                    //this.ficheService.addProduct(x, this.host.ficheDto.CreditPersonId, this.host.ficheDto);
                }
            );
        });
    }

    itemValueChanged(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'FicheCalculation');
    }

    delete(id: number): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.removeItem(id);
            },
            no: () => {
            }
        });
    }

    removeItem(id: number): void {
        const ind: number = this.host.relatedFicheListDto.findIndex(x => x.Id == id);
        this.host.relatedFicheListDto.splice(ind, 1);

        this.handleFicheRelationList();

        this.itemValueChanged();
    }

    handleFicheRelationList(): void {
        this.host.relatedRemainingTotal = 0;
        if (this.host.relatedFicheListDto.length == 0) {
            this.host.ficheDto.RelationList = null;
        }

        this.host.ficheDto.RelationList = [];
        let item: FicheRelationSaveDto = null;
        let count: number = 0;
        this.host.relatedFicheListDto.forEach(element => {
            count++;
            this.host.relatedRemainingTotal += this.utils.round(element.GrandTotal - element.PaidTotal, 2);

            item = new FicheRelationSaveDto();
            item.FicheRelationTypeId = FicheRelationTypes.xPayment;
            item.ChildFicheId = element.Id;
            this.host.ficheDto.RelationList.push(item);

            if (count == this.host.relatedFicheListDto.length) {
                this.host.relatedRemainingTotal = this.utils.round(this.host.relatedRemainingTotal, 2);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'FicheRelationChanged');
            }
        });
    }
}