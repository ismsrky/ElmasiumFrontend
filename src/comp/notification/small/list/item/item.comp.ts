import { Component, OnInit, OnDestroy, Input, HostListener, ElementRef } from '@angular/core';

// Comp

// Service
import { FicheService } from '../../../../../service/fiche/fiche.service';
import { PersonRelationService } from '../../../../../service/person/relation.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';

// Dto
import { NotificationListDto } from '../../../../../dto/notification/list.dto';

// Enum
import { ApprovalStats } from '../../../../../enum/approval/stats.enum';
import { FicheTypeFakes } from '../../../../../enum/fiche/type-fakes.enum';
import { NotificationTypes } from '../../../../../enum/general/notification-types.enum';
import { PersonTypes } from '../../../../../enum/person/person-types.enum';
import { RelationTypes } from '../../../../../enum/person/relation-types.enum';
import { BootstrapColors } from '../../../../../enum/bootstrap/colors.enum';
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { Stc, animations } from '../../../../../stc';
import { AppRouterService } from '../../../../../service/sys/router.service';
import { AppRoutes } from '../../../../../enum/sys/routes.enum';

@Component({
    selector: 'notification-small-list-item',
    templateUrl: './item.comp.html',
    animations: [animations]
})
export class NotificationSmallListItemComp implements OnInit, OnDestroy {
    @Input('listItem') listItem: NotificationListDto;

    iconColor: BootstrapColors;

    ficheTypeFakes = FicheTypeFakes;
    approvalStats = ApprovalStats;
    notificationTypes = NotificationTypes;
    personTypes = PersonTypes;
    relationTypes = RelationTypes;
    bootstrapColors = BootstrapColors;

    amIParent: boolean = false;

    addAsText: string = '';

    busy: boolean = false;

    amIDebt: boolean = false;

    xCaption: string = '';
    relatedPersonFullName: string = '';
    relatePersonTypeId: PersonTypes;

    profile = this.localStorageService.personProfile;

    constructor(
        private ficheService: FicheService,
        private personRelationService: PersonRelationService,
        private compBroadCastService: CompBroadCastService,
        private appRouterService: AppRouterService,
        private dicService: DictionaryService,
        private localStorageService: LocalStorageService,
        public el: ElementRef) {
        this.profile = this.localStorageService.personProfile;
    }

    ngOnInit(): void {
        this.amIParent = this.listItem.ParentPersonId == this.profile.PersonId;

        const debtPersonId = this.listItem.IsParentDebt ? this.listItem.ParentPersonId : this.listItem.ChildPersonId;
        const creditPersonId = this.listItem.IsParentDebt ? this.listItem.ChildPersonId : this.listItem.ParentPersonId;

        const debtPersonFullName = this.listItem.IsParentDebt ? this.listItem.ParentPersonFullName : this.listItem.ChildPersonFullName;
        const creditPersonFullName = this.listItem.IsParentDebt ? this.listItem.ChildPersonFullName : this.listItem.ParentPersonFullName;

        const debtPersonTypeId = this.listItem.IsParentDebt ? this.listItem.ParentPersonTypeId : this.listItem.ChildPersonTypeId;
        const creditPersonTypeId = this.listItem.IsParentDebt ? this.listItem.ChildPersonTypeId : this.listItem.ParentPersonTypeId;

        this.amIDebt = debtPersonId == this.profile.PersonId;

        this.relatedPersonFullName = this.amIDebt ? creditPersonFullName : debtPersonFullName;
        this.relatePersonTypeId = this.amIDebt ? creditPersonTypeId : debtPersonTypeId;

        this.xCaption = this.ficheService.getOtherPersonCaption(this.listItem.FicheTypeId, this.amIDebt);

        this.addAsText = this.personRelationService.getAddAsText(this.listItem.ChildRelationTypeId, this.amIParent);

        if (this.listItem.NotificationTypeId == NotificationTypes.xFiche
            || this.listItem.NotificationTypeId == NotificationTypes.xFicheDeleted) {
            this.iconColor = this.amIDebt ? BootstrapColors.success : BootstrapColors.warning;
        } else if (this.listItem.NotificationTypeId == this.notificationTypes.xConnectionDeleted) {
            this.iconColor = BootstrapColors.danger;
        } else if (this.listItem.NotificationTypeId == this.notificationTypes.xConnection) {
            this.iconColor = this.amIParent ? BootstrapColors.warning : BootstrapColors.success;
        }
    }
    ngOnDestroy(): void {
    }

    openFiche(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.Open, JSON.stringify({ 'FicheListItemModalComp': { 'ficheId': this.listItem.FicheId } }));
    }

    openOrder(): void {
        if (this.listItem.NotificationTypeId != NotificationTypes.xOrder) return;

        if (this.profile.PersonTypeId == PersonTypes.xRealPerson) {
            if (this.listItem.OrderIsReturn) {
                this.appRouterService.navigate(AppRoutes.myReturns);
            } else {
                this.appRouterService.navigate(AppRoutes.myOrders);
            }
        } else if (this.profile.PersonTypeId == PersonTypes.xShop) {
            if (this.listItem.OrderIsReturn) {
                this.appRouterService.navigate(AppRoutes.incomingOrderReturns);
            } else {
                this.appRouterService.navigate(AppRoutes.incomingOrders);
            }
        }
    }
}