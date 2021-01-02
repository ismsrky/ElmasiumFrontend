import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp

// Service
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonNavMenuDto } from '../../../../dto/person/nav-menu.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { NavMenuPositions } from '../../../../enum/person/nav-menu-position.enum';
import { Stc, expandCollapse } from '../../../../stc';

@Component({
    selector: 'layout-navbar-bottom',
    templateUrl: './bottom.comp.html',
    animations: [expandCollapse]
})
export class LayoutNavbarBottomComp implements OnInit, OnDestroy {
    navMenuList: PersonNavMenuDto[] = null;

    subsNeedRefresh: Subscription;

    isNarrow: boolean = true;

    busy: boolean = false;
    constructor(
        private compBroadCastService: CompBroadCastService,       
        private utils: UtilService,
        private dicService: DictionaryService) {

        this.isNarrow = window.innerWidth <= 768;

        this.handleMenu();

        // This must be here:
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'NavMenuList') {
                    this.handleMenu();
                }
            }
        );
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    handleMenu(): void {
        if (this.utils.isNull(Stc.navMenuList)) {
            this.navMenuList = null;
        } else {
            this.navMenuList = [];
            Stc.navMenuList.forEach(element => {
                if (element.Position == NavMenuPositions.Both || element.Position == NavMenuPositions.Bottom) {
                    this.navMenuList.push(element);
                }
            });
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
}