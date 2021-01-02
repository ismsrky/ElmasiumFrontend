import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { catchError, map, tap } from 'rxjs/operators';
import { LocalStorageService } from '../sys/local-storage.service';
import { Stc } from '../../stc';
import { environment } from '../../environments/environment';
import { UtilService } from './util.service';

@Injectable()
export abstract class BaseService {
    get baseUrl(): string {
        if (environment.production)
            return environment.virtualFolder;
        else
            return `http://${environment.serverIP}:${environment.webApiPort}`;
    }

    private controllerName: string;

    protected setControllerName(value: string) {
        this.controllerName = value;
    }

    constructor(
        private http1: HttpClient,
        private localStorageService1: LocalStorageService,
        private utilService1: UtilService) {
    }

    private getOptions(isFile: boolean): any {
        let tokenId: string = '';
        if (this.utilService1.isNotNull(this.localStorageService1.realPerson)) {
            tokenId = this.localStorageService1.realPerson.TokenId;
        }

        if (isFile) {
            const httpOptions = {
                headers: new HttpHeaders({ 'Authorization': `${tokenId}` })
            };

            return httpOptions;
        } else {
            const httpOptions = {
                headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `${tokenId}` })
            };

            return httpOptions;
        }
    }

    protected post(actionName: string, dto: any): any {
        let bodyStr: string = null;
        if (this.utilService1.isNotNull(dto)) {
            bodyStr = JSON.stringify(dto);
        }

        const url1 = `${this.baseUrl}/${this.controllerName}/${actionName}`;

        return this.http1.post(url1, bodyStr, this.getOptions(false));
        /**
         * .pipe(
            tap(
                x => {
                }                //this.log(`deleted hero id=${id}`)
            ),
            catchError(
                y=>{
                    //this.handleError<Hero>('deleteHero')
                }
            )
        );
         */
    }

    protected postFile(actionName: string, file: any): any {
        const url1 = `${this.baseUrl}/${this.controllerName}/${actionName}`;

        return this.http1.post(url1, file, this.getOptions(true));
        /**
         * .pipe(
            map(res => res.json())
        );
         */
    }
}