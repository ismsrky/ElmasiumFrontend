import { Component, OnInit, OnDestroy, Input, Host } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { OrderListIndexComp } from '../index.comp';

// Service
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { OrderListDto } from '../../../../dto/order/list.dto';
import { CommentDto } from '../../../../dto/comment/comment.dto';

// Enum
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { ProductTypes } from '../../../../enum/product/types.enum';
import { ProductCodeTypes } from '../../../../enum/product/code-types.enum';
import { environment } from '../../../../environments/environment';
import { OrderStats } from '../../../../enum/order/stats.enum';
import { PersonTypes } from '../../../../enum/person/person-types.enum';
import { CommentTypes } from '../../../../enum/comment/types.enum';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse, Stc } from '../../../../stc';

@Component({
    selector: 'order-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class OrderListItemComp implements OnInit, OnDestroy {
    @Input('listItem') listItem: OrderListDto;

    host: OrderListIndexComp;

    isOpenNotes: boolean = false;

    isOpenExcludeList: boolean = false;
    isOpenIncludeList: boolean = false;
    isOpenOptionList: boolean = false;

    configQuantity: CurrencyMaskConfig;

    subsSaved: Subscription;
    subsDeleted: Subscription;
    
    orderStats = OrderStats;
    personTypes = PersonTypes;
    environment = environment;

    busy: boolean = false;
    constructor(
        @Host() host: OrderListIndexComp,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private toastr: ToastrService,
        private utils: UtilService,
        private dialogService: DialogService) {
        this.host = host;

        this.configQuantity = this.utils.getQuantityMaskOptions();
        this.configQuantity.prefix = this.dicService.getValue('xQuantity') + ': ';
    }

    ngOnInit(): void {
        let statDto = Stc.orderStatListDto.find(f => f.Id == this.listItem.OrderStatId);
        let isOpen: boolean = !this.host.top10 && !statDto.IsEndPoint && this.host.profile.PersonId == this.listItem.ShopId;

        //this.isOpenAddress = isOpen;

        if (isOpen) {
            this.host.openAddress(this.listItem);
        }

        this.isOpenNotes = isOpen && this.utils.isNotNull(this.listItem.Notes);

        this.isOpenExcludeList = isOpen;
        this.isOpenIncludeList = isOpen;
        this.isOpenOptionList = isOpen;

        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('CommentCrudComp')) {
                        const commentDto: CommentDto = JSON.parse(x).CommentCrudComp;

                        if (commentDto.CommentTypeId == CommentTypes.Person && commentDto.OrderId == this.listItem.Id) {
                            this.listItem.CommentId = commentDto.Id;
                        }

                        if (this.utils.isNotNull(this.listItem.ProductList) && commentDto.CommentTypeId == CommentTypes.PersonProduct) {
                            this.listItem.ProductList.forEach(p => {
                                if (p.Id == commentDto.OrderProductId) {
                                    p.CommentId = commentDto.Id;;
                                }
                            });
                        }
                    }
                }
            }
        );

        this.subsDeleted = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Deleted).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('CommentCrudComp')) {
                        const commentDto: CommentDto = JSON.parse(x).CommentCrudComp;

                        if (commentDto.CommentTypeId == CommentTypes.Person && commentDto.OrderId == this.listItem.Id) {
                            this.listItem.CommentId = null;
                        }

                        if (this.utils.isNotNull(this.listItem.ProductList) && commentDto.CommentTypeId == CommentTypes.PersonProduct) {
                            this.listItem.ProductList.forEach(p => {
                                if (p.Id == commentDto.OrderProductId) {
                                    p.CommentId = null;
                                }
                            });
                        }
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsSaved);
        this.utils.unsubs(this.subsDeleted);
    }
}