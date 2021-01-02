import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { FicheDto } from '../../dto/fiche/fiche.dto';
import { FicheTypes } from '../../enum/fiche/types.enum';
import { Stc } from '../../stc';
import { FicheVatTotalDto } from '../../dto/fiche/vat-total.dto';
import { FicheProductDto } from '../../dto/fiche/product/product.dto';
import { FicheGetListCriteriaDto } from '../../dto/fiche/getlist-criteria.dto';
import { FicheListDto } from '../../dto/fiche/list.dto';
import { PersonProductDto } from '../../dto/person/product/product.dto';
import { FicheGetCriteriaDto } from '../../dto/fiche/get-criteria.dto';
import { FicheDeleteDto } from '../../dto/fiche/delete.dto';
import { ApprovalStats } from '../../enum/approval/stats.enum';
import { DictionaryService } from '../dictionary/dictionary.service';
import { FicheTypeFakes } from '../../enum/fiche/type-fakes.enum';
import { FicheApprovalHistoryGetListCriteriaDto } from '../../dto/fiche/approval-history-getlist-criteria.dto';
import { FicheApprovalHistoryListDto } from '../../dto/fiche/approval-history-list.dto';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { FicheGetActionsCriteriaDto } from '../../dto/fiche/getactions-criteria.dto';
import { FicheActionsDto } from '../../dto/fiche/actions.dto';
import { UtilService } from '../sys/util.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class FicheService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private toastr: ToastrService) {

        super(http, localStorageService, utils);
        super.setControllerName('Fiche');
    }

    save(ficheDto: FicheDto): Observable<ResponseDto> {
        return super.post('Save', ficheDto);
    }

    get(criteriaDto: FicheGetCriteriaDto): Observable<ResponseGenDto<FicheDto>> {
        return super.post('Get', criteriaDto);
    }

    getList(criteriaDto: FicheGetListCriteriaDto): Observable<ResponseGenDto<FicheListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    delete(deleteDto: FicheDeleteDto): Observable<ResponseDto> {
        return super.post('Delete', deleteDto);
    }

    getApprovalHistoryList(criteriaDto: FicheApprovalHistoryGetListCriteriaDto): Observable<ResponseGenDto<FicheApprovalHistoryListDto[]>> {
        return super.post('GetApprovalHistoryList', criteriaDto);
    }

    getNextId(): Observable<ResponseDto> {
        return super.post('GetNextId', null);
    }

    getActions(criteriaDto: FicheGetActionsCriteriaDto): Observable<ResponseGenDto<FicheActionsDto>> {
        return super.post('GetActions', criteriaDto);
    }

    // inside
    calculateTotals(ficheDto: FicheDto): void {
        ficheDto.LastChangeTime = this.utils.getNow();

        if (ficheDto.FicheTypeId == FicheTypes.xDebtCredit) {
            ficheDto.Total = ficheDto.GrandTotal;
        } else {
            ficheDto.GrandTotal = 0;
            ficheDto.Total = 0;
        }
        ficheDto.RowDiscountTotal = 0;
        ficheDto.UnderDiscountTotal = 0;

        if (ficheDto.FicheTypeId == FicheTypes.xMoneyTransfer
            || ficheDto.FicheTypeId == FicheTypes.xPayment) {
            if (this.utils.isNotNull(ficheDto.MoneyList) || ficheDto.MoneyList.length > 0) {
                ficheDto.MoneyList.forEach(element => {
                    ficheDto.GrandTotal += element.Total;

                    ficheDto.Total = ficheDto.GrandTotal;
                });
            }
        } else if (ficheDto.FicheTypeId == FicheTypes.xReceipt || ficheDto.FicheTypeId == FicheTypes.xInvoice) {
            ficheDto.VatTotalList = [];

            ficheDto.ProductList.filter(y => !y.IsDeleted).forEach(item => {
                item.Quantity = item.Quantity <= 0 ? 1 : this.utils.round(item.Quantity, 4);
                item.UnitPrice = item.UnitPrice < 0 ? 0 : this.utils.round(item.UnitPrice, 4);
                item.DiscountRate = item.DiscountRate < 0 ? 0 : this.utils.round(item.DiscountRate, 2);
                item.VatRate = item.VatRate < 0 ? 0 : this.utils.round(item.VatRate, 2);

                item.Total = this.utils.round(item.Quantity * item.UnitPrice, 4);

                item.VatTotal = ficheDto.IncludingVat ?
                    item.Total - item.Total / (1 + item.VatRate / 100) :
                    this.utils.round(item.Total / 100 * item.VatRate, 4);
                item.VatTotal = this.utils.round(item.VatTotal, 4);

                item.DiscountTotal = this.utils.round((item.Total + (ficheDto.IncludingVat ? 0 : item.VatTotal)) / 100 * item.DiscountRate, 2);
                item.GrandTotal = item.Total + (ficheDto.IncludingVat ? 0 : item.VatTotal) - item.DiscountTotal;

                item.GrandTotal = this.utils.round(item.GrandTotal, 2);

                ficheDto.RowDiscountTotal += item.DiscountTotal;
                ficheDto.Total += item.Total;
                ficheDto.GrandTotal += item.GrandTotal;

                if (item.VatRate > 0 && item.VatTotal > 0) {
                    if (this.utils.isNull(ficheDto.VatTotalList.find(v => v.VatRate == item.VatRate))) {
                        const t_vatTotalItem: FicheVatTotalDto = new FicheVatTotalDto();
                        t_vatTotalItem.FicheId = ficheDto.Id;
                        t_vatTotalItem.VatRate = item.VatRate;
                        t_vatTotalItem.VatTotal = 0;
                        ficheDto.VatTotalList.push(t_vatTotalItem);
                    }
                    ficheDto.VatTotalList.find(v => v.VatRate == item.VatRate).VatTotal += item.VatTotal;
                }
            }); // end of foreach

            ficheDto.RowDiscountTotal = this.utils.round(ficheDto.RowDiscountTotal, 2);
            ficheDto.Total = this.utils.round(ficheDto.Total, 4);

            ficheDto.UnderDiscountTotal = this.utils.round(ficheDto.GrandTotal / 100 * ficheDto.UnderDiscountRate, 2);

            ficheDto.GrandTotal -= ficheDto.UnderDiscountTotal;

            ficheDto.GrandTotal = this.utils.round(ficheDto.GrandTotal, 2);

            ficheDto.VatTotalList = ficheDto.VatTotalList.sort((one, two) => (one.VatRate > two.VatRate ? -1 : 1));
        }

        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'FicheCalculated');
    }

    checkQuantity(newValue: number): number {
        if (newValue > 1000000) {
            this.toastr.warning(this.dicService.getValue('xInvalidQuantity'));
            return 1;
        }
        /**
         * else if (newValue > 100) {
            this.toastr.info("Miktarı 100'den büyük girdiniz.");
            return newValue;
        }
         */

        return newValue;
    }

    /**
     * check(ficheDto: FicheDto): Observable<boolean> {
        let result = new Subject<boolean>();

        if (this.utils.isNull(ficheDto)) {
            result.next(false);
            return;
        }

        if (ficheDto.IssueDateNumber) {
            result.next(false);
            return;
        }

        return result.asObservable();
    }
     */

    // inside
    addProduct(productDto: PersonProductDto, shopId: number, ficheDto: FicheDto, isDebt: boolean, quantity: number = 1) {
        const t_product: FicheProductDto = ficheDto.ProductList.find(p => p.ProductId == productDto.ProductId && !p.IsDeleted);
        if (this.utils.isNull(t_product)) {
            const ficheProductDto: FicheProductDto = new FicheProductDto();
            ficheProductDto.Id = this.getNextFicheProductId(ficheDto);
            ficheProductDto.ProductId = productDto.ProductId;
            ficheProductDto.PersonProductId = productDto.Id;
            ficheProductDto.ProductName = productDto.ProductName;
            ficheProductDto.ProductTypeId = productDto.ProductTypeId;
            ficheProductDto.Quantity = quantity;
            ficheProductDto.PortraitImageUniqueIdStr = productDto.PortraitImageUniqueIdStr;

            // Currency of current fiche must must be same in the price currency.
            if (ficheDto.DebtPersonId == shopId) {
                ficheProductDto.UnitPrice = productDto.Price.PurhasePrice;
            } else {
                ficheProductDto.UnitPrice = productDto.Price.SalePrice;
            }

            ficheProductDto.FromPool = productDto.Price.FromPool;

            ficheProductDto.CodeList = productDto.CodeList;

            ficheProductDto.VatRate = isDebt ? productDto.PurchaseVatRate : productDto.SaleVatRate;

            ficheProductDto.CurrencyId = ficheDto.CurrencyId;

            ficheDto.ProductList.push(ficheProductDto);

            ficheDto.ProductList = ficheDto.ProductList.sort((one, two) => (one.Id < two.Id ? -1 : 1));
        } else {
            t_product.Quantity += quantity;
        }

        this.calculateTotals(ficheDto);
    }

    // inside
    private getNextFicheProductId(ficheDto: FicheDto): number {
        let result: number = 0;

        while (ficheDto.ProductList.find(x => x.Id == result)) {
            result--;
        }

        return result;
    }

    // inside
    handleFicheContentGroupId(ficheDto: FicheDto): void {
        let t_ficheContentId = null;

        Stc.ficheContentGroupBoList.forEach(x => {
            t_ficheContentId = x.ContentList.find(y => y == ficheDto.FicheContentId);

            if (this.utils.isNotNull(t_ficheContentId)) {
                ficheDto.FicheContentGroupId = x.ContentGroupId;
                return;
            }
        });
    }

    // inside
    getFicheSavedText(approvalStatId: ApprovalStats): string {
        let result: string;

        switch (approvalStatId) {
            case ApprovalStats.xAccepted:
                result = 'xFicheAccepted';
                break;
            case ApprovalStats.xRejected:
                result = 'xFicheRejected';
                break;
            case ApprovalStats.xDeleted:
                result = 'xFicheDeleted';
                break;
            case ApprovalStats.xPulledBack:
                result = 'xFichePulledBack';
                break;
            default:
                break;
        }

        return this.dicService.getValue(result);
    }

    // inside
    isDebt(ficheTypeFakeId: FicheTypeFakes): boolean {
        let result: boolean = false;
        if (ficheTypeFakeId == FicheTypeFakes.xSaleReceipt
            || ficheTypeFakeId == FicheTypeFakes.xSaleInvoice
            || ficheTypeFakeId == FicheTypeFakes.xOutgoingPayment
            || ficheTypeFakeId == FicheTypeFakes.xOutgoingMoney
            || ficheTypeFakeId == FicheTypeFakes.xPurchaseReturnReceipt
            || ficheTypeFakeId == FicheTypeFakes.xPurchaseReturnInvoice
            || ficheTypeFakeId == FicheTypeFakes.xDebted
        ) {
            result = false;
        } else {
            result = true;
        }

        return result;
    }

    // inside
    getFicheTypeId(ficheTypeFakeId: FicheTypeFakes): FicheTypes {
        let ficheTypeId: FicheTypes;

        if (ficheTypeFakeId == FicheTypeFakes.xPurchaseInvoice
            || ficheTypeFakeId == FicheTypeFakes.xPurchaseReturnInvoice
            || ficheTypeFakeId == FicheTypeFakes.xSaleInvoice
            || ficheTypeFakeId == FicheTypeFakes.xSaleReturnInvoice) {
            ficheTypeId = FicheTypes.xInvoice;
        }
        else if (ficheTypeFakeId == FicheTypeFakes.xPurchaseReceipt
            || ficheTypeFakeId == FicheTypeFakes.xPurchaseReturnReceipt
            || ficheTypeFakeId == FicheTypeFakes.xSaleReceipt
            || ficheTypeFakeId == FicheTypeFakes.xSaleReturnReceipt) {
            ficheTypeId = FicheTypes.xReceipt;
        }
        else if (ficheTypeFakeId == FicheTypeFakes.xIncomingPayment
            || ficheTypeFakeId == FicheTypeFakes.xOutgoingPayment) {
            ficheTypeId = FicheTypes.xPayment;
        } else if (ficheTypeFakeId == FicheTypeFakes.xIncomingMoney
            || ficheTypeFakeId == FicheTypeFakes.xOutgoingMoney
            || ficheTypeFakeId == FicheTypeFakes.xVirementMoney) {
            ficheTypeId = FicheTypes.xMoneyTransfer;
        } else if (ficheTypeFakeId == FicheTypeFakes.xDebted
            || ficheTypeFakeId == FicheTypeFakes.xCredited) {
            ficheTypeId = FicheTypes.xDebtCredit;
        }

        return ficheTypeId;
    }

    // inside
    getFicheCaption(ficheTypeId: FicheTypes, ficheTypeFakeId: FicheTypeFakes): string {
        let result: string = null;

        if (ficheTypeId == FicheTypes.xInvoice || ficheTypeId == FicheTypes.xReceipt) {
            result = FicheTypeFakes[ficheTypeFakeId];
        } else if (ficheTypeFakeId == FicheTypeFakes.xOutgoingMoney) {
            result = 'xGiveMoney';
        } else if (ficheTypeFakeId == FicheTypeFakes.xIncomingMoney) {
            result = 'xTakeMoney';
        } else if (ficheTypeFakeId == FicheTypeFakes.xOutgoingPayment) {
            result = 'xMakePayment';
        } else if (ficheTypeFakeId == FicheTypeFakes.xIncomingPayment) {
            result = 'xTakePayment';
        } else if (ficheTypeFakeId == FicheTypeFakes.xCredited) {
            result = 'xCredit';
        } else if (ficheTypeFakeId == FicheTypeFakes.xDebted) {
            result = 'xDebt';
        }

        return result;
    }

    // inside
    getOtherPersonCaption(ficheTypeId: FicheTypes, isDebt: boolean): string {
        let result: string = null;

        if (ficheTypeId == FicheTypes.xPayment) {
            result = isDebt ? 'xPayerConnection' : 'xPayeeConnection';
        } else if (ficheTypeId == FicheTypes.xMoneyTransfer) {
            result = isDebt ? 'xSenderConnection' : 'xReceiverConnection';
        } else if (ficheTypeId == FicheTypes.xReceipt || ficheTypeId == FicheTypes.xInvoice) {
            result = isDebt ? 'xSeller' : 'xCustomer';
        } else if (ficheTypeId == FicheTypes.xDebtCredit) {
            result = isDebt ? 'xCreditorConnection' : 'xDebtorConnection';
        }

        return result;
    }
}