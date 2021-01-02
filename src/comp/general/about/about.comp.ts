import { Component, ViewChild, Input } from '@angular/core';

import { PageTitleComp } from '../page-title/page-title.comp';

@Component({
    selector: 'app-about',
    templateUrl: './about.comp.html'
})
export class AppAbout {
    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;

    @Input('IsInside') IsInside: boolean = false;
}