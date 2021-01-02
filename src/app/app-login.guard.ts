import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

// Service
import { AuthService } from '../service/auth/auth.service'

// Enum
import { Stc } from '../stc';

@Injectable()
export class AppLoginGuard implements CanActivate {
    private resultCanActivate = new Subject<boolean>();

    constructor(
        private authService: AuthService) {
    }

    canActivate(): Observable<boolean> {
        setTimeout(() => {
            this.authService.isRealLogin().subscribe(
                x => {
                    Stc.isRealLogin = x.IsSuccess;
                    this.authService.handleRealLoginRequired();

                    this.resultCanActivate.next(x.IsSuccess);
                }
            );
        });

        return this.resultCanActivate.asObservable();
    }
}
