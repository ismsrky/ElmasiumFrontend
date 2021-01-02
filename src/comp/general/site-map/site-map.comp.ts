import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Comp

// Service
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { PersonNavMenuDto } from '../../../dto/person/nav-menu.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { NavMenuPositions } from '../../../enum/person/nav-menu-position.enum';
import { AppRoutes } from '../../../enum/sys/routes.enum';
import { Stc, expandCollapse } from '../../../stc';

@Component({
    selector: 'app-site-map',
    templateUrl: './site-map.comp.html',
    animations: [expandCollapse]
})
export class AppSiteMapComp implements OnInit, OnDestroy {
    navMenuList: PersonNavMenuDto[] = null;

    subsNeedRefresh: Subscription;

    xIcon: string = 'sitemap';
    xTitle: string = 'xSiteMap';
    xIconColor: string = null;

    isNarrow: boolean = true;

    busy: boolean = false;
    constructor(
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService,
        private dicService: DictionaryService,
        private router: Router) {
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
                    if (this.router.url == '/' + AppRoutes.siteMap) {
                        this.navMenuList.push(element);
                    } else if (element.Url == this.router.url) {
                        this.navMenuList.push(element);

                        this.xIcon = element.IconClass;
                        this.xIconColor = element.IconColor;
                        this.xTitle = element.Name;
                    }
                }
            });
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
}