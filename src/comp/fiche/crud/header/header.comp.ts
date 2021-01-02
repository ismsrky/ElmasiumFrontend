import { Component, OnInit, ViewChild, OnDestroy, Host, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { FicheCrudComp } from '../crud.comp';
import { PersonSearchIndexComp } from '../../../person/search/index.comp';

// Service
import { FicheService } from '../../../../service/fiche/fiche.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { EnumsOpService } from '../../../../service/enumsop/enumsop.service';

// Dto

// Bo
import { PersonSearchShowCriteriaBo } from '../../../../bo/person/search-show-criteria.bo';

// Enum
import { Stats } from '../../../../enum/sys/stats.enum';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { RelationTypes } from '../../../../enum/person/relation-types.enum';
import { PersonTypes } from '../../../../enum/person/person-types.enum';
import { FicheContentGroups } from '../../../../enum/fiche/content-groups.enum';
import { FicheContents } from '../../../../enum/fiche/contents.enum';
import { FicheTypes } from '../../../../enum/fiche/types.enum';
import { FicheTypeFakes } from '../../../../enum/fiche/type-fakes.enum';
import { Stc, expandCollapse } from '../../../../stc';
import { UtilService } from '../../../../service/sys/util.service';

@Component({
    selector: 'fiche-crud-header',
    templateUrl: './header.comp.html',
    animations: [expandCollapse]
})
export class FicheCrudHeaderComp implements OnInit, OnDestroy {
    host: FicheCrudComp;
    @ViewChild(PersonSearchIndexComp, { static: false }) childPersonSearch: PersonSearchIndexComp;

    relationTypes = RelationTypes;
    stats = Stats;
    personTypes = PersonTypes;
    ficheTypes = FicheTypes;
    ficheTypeFakes = FicheTypeFakes;
    ficheContents = FicheContents;
    ficheContentGroups = FicheContentGroups;

    ficheContentGroupBoList = Stc.ficheContentGroupBoList;

    isPersonSearchModalOpen: boolean = false;

    subscriptionModalClosed: Subscription;

    busy: boolean = false;

    constructor(
        @Host() host: FicheCrudComp,
        private ficheService: FicheService,
        private dialogService: DialogService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private enumsOpService: EnumsOpService,
        private utils: UtilService,
        private localStorageService: LocalStorageService) {
        this.isNarrow = window.innerWidth <= 768;

        this.host = host;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
    isNarrow: boolean = true;

    ngOnInit(): void {
        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'PersonSearch') {
                    this.isPersonSearchModalOpen = false;
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionModalClosed);
    }

    selectPerson(): void {
        this.isPersonSearchModalOpen = true;

        const criteriaBo = new PersonSearchShowCriteriaBo();
        criteriaBo.Multiple = false;

        criteriaBo.PersonId = this.host.profile.PersonId;
        criteriaBo.PersonTypeId = this.host.profile.PersonTypeId;
        criteriaBo.IsOppositeOperation = true;

        setTimeout(() => {
            let subscriptionCloseSearchModal = this.childPersonSearch.showModal(criteriaBo).subscribe(
                x => {
                    this.utils.unsubs(subscriptionCloseSearchModal);

                    this.host.otherPersonRelation = x[0];
                    this.host.otherPersonRelation.handleRelationTypes();

                   this.host.handleOtherPerson();
                }
            );
        });
    }

    ficheContentChanged(): void {
        this.ficheService.handleFicheContentGroupId(this.host.ficheDto);
    }

    includingVatChanged(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'FicheCalculation');
    }
}