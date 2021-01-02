import { trigger, state, transition, style, animate, query, sequence } from '@angular/animations';

// Dto
import { CurrenciesDto } from './dto/enumsOp/currencies.dto';
import { FicheContentGroupBo } from './bo/fiche/fiche-content-group.bo';
import { LanguageDto } from './dto/dictionary/language.dto';
import { FicheTypeFakeDto } from './dto/fiche/type-fake.dto';
import { PersonNotificationSummaryDto } from './dto/person/notification-summary.dto';
import { BootstrapColors } from './enum/bootstrap/colors.enum';
import { OrderStatListDto } from './dto/order/stat-list.dto';
import { OrderStatNextListDto } from './dto/order/stat-next-list.dto';
import { PersonNavMenuDto } from './dto/person/nav-menu.dto';

export class Stc {
    static version: number = 15;
    static newVersionReleased: boolean = false;

    static notificationSummaryDto = new PersonNotificationSummaryDto();

    static navMenuList: PersonNavMenuDto[] = null;
    static activeNavMenu: PersonNavMenuDto = null;

    static currenciesDto: CurrenciesDto[];
    static ficheContentGroupBoList: FicheContentGroupBo[];
    static languagesDto: LanguageDto[];
    static ficheTypeFakeDto: FicheTypeFakeDto[];

    static orderStatListDto: OrderStatListDto[];
    static orderStatNextListDto: OrderStatNextListDto[];

    static isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    static isIPad = /IPad/i.test(window.navigator.userAgent);
    static supportsWebSockets = 'WebSocket' in window || 'MozWebSocket' in window;

    static selectedColor: BootstrapColors;

    static waitRepeatTimeout: number = 1000;
    static typingEndTime: number = 600;

    static defaultRetailCustomerId = -1;

    static isHelpOpen: boolean = false;

    static isLogin: boolean = false;
    static isRealLogin: boolean = false;

    static paramPageNumber: string = 'page';
    static paramMinPrice: string = 'minPrice';
    static paramMaxPrice: string = 'maxPrice';
    static paramSearchWord: string = 'searchWord';
}

export const expandCollapse =
    trigger('expandCollapse', [
        state('*', style({
            height: '*',
            width: '*'
        })),
        state('void', style({
            opacity: '0',
            overflow: 'hidden',
            height: '0px',
            width: '0px'
        })),
        transition(':enter', animate('400ms ease-in-out')),
        transition(':leave', animate('400ms ease-in-out'))
    ]);

export const expandCollapseHidden =
    trigger('expandCollapseHidden', [
        state('visible', style({
            height: '*',
            width: '*'
        })),
        state('hidden', style({
            opacity: '0',
            overflow: 'hidden',
            height: '0px',
            width: '0px'
        })),
        transition('* => *', animate('400ms ease-in-out')),
    ]);

export const fadeInOut = trigger('fadeInOut', [
    state('void', style({ opacity: 0 })),
    state('*', style({ opacity: 1 })),
    transition(':enter', animate('100ms ease-out')),
    transition(':leave', animate('100ms ease-in')),
]);

export const fadeInAnimation =
    trigger('fadeInAnimation', [
        // route 'enter' transition
        transition(':enter', [

            // styles at start of transition
            style({ opacity: 0 }),

            // animation and styles at end of transition
            animate('800ms', style({ opacity: 1 }))
        ])
    ]);

export const animations = [
    trigger('animateState', [
        state('seen', style({
            backgroundColor: 'white'
        })),
        state('unseen', style({
            backgroundColor: 'rgba(33, 150, 243, 0.4)'
        })),
        transition('unseen => seen', animate(2000))
    ])
]

export const routerAnimation =
    trigger('routerAnimation', [
        transition('* <=> *', [
            sequence([
                query(
                    ':enter > *',
                    [
                        style({
                            transform: 'translateY(-3%)',
                            opacity: 0,
                            position: 'static'
                        }),
                        animate(
                            '700ms ease-in-out',
                            style({ transform: 'translateY(0%)', opacity: 1 })
                        )
                    ],
                    { optional: true }
                )
            ])
        ])
    ]);