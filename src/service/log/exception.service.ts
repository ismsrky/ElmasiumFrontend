import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { LogExceptionDto } from '../../dto/log/exception.dto';
import { ApplicationTypes } from '../../enum/sys/app-types.enum';
import { UtilService } from '../sys/util.service';
import { LogExceptionBo } from '../../bo/sys/log-ex.bo';

@Injectable()
export class LogExceptionService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('LogException');
    }

    save(saveDto: LogExceptionDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    /**
     *  saveEx(ex: Error, className: string, methodName: string): Observable<ResponseDto> {
         const saveDto = new LogExceptionDto();
 
         saveDto.ApplicationTypeId = ApplicationTypes.Angular;
 
         saveDto.Class = className;
         saveDto.Method = methodName;
 
         saveDto.Message = ex.message;
         saveDto.Stack = ex.stack;
         saveDto.Source = ex.name;
 
         return this.save(saveDto);
     }
     */

    saveObservableEx(ex: Error, className: string, methodName: string, subscribe: Subscription): void {
        this.utils.unsubs(subscribe);
        this.saveEx(ex, className, methodName);
    }

    saveEx(ex: Error, className: string, methodName: string): void {
        const saveBo = new LogExceptionBo();

        saveBo.Class = className;
        saveBo.Method = methodName;

        saveBo.Message = ex.message;
        saveBo.Stack = ex.stack;
        saveBo.Source = ex.name;

        saveBo.InnerCreateDateNumber = Date.now();

        saveBo.IsSent = false;

        this.addLocal(saveBo);
    }

    getLocal(): LogExceptionBo[] {
        const str = localStorage.getItem('ExList');
        if (this.utils.isNull(str)) {
            return []; // we should not return null.
        }
        /**
         *  const json = JSON.parse(str);
 
         // create an instance of the User class
         const list = Object.create(Array.prototype);
 
         // copy all the fields from the json object
         return Object.assign(list, json);
         */

        return JSON.parse(str);
    }
    private addLocal(value: LogExceptionBo): void {
        const list: LogExceptionBo[] = this.getLocal();

        const smilarItem = list.find(f => f.Message == value.Message && f.Stack == value.Stack && f.Source == value.Source && Date.now() - f.InnerCreateDateNumber < 30000);
        if (this.utils.isNotNull(smilarItem)) return;

        list.push(value);
        localStorage.setItem('ExList', JSON.stringify(list));

        setTimeout(() => {
            this.saveSendFirst();
        }, 500);
    }

    saveSendFirst(): Observable<boolean> {
        let result = new Subject<boolean>();

        setTimeout(() => {
            const list = this.getLocal();

            if (this.utils.isNull(list) || list.length == 0) {
                result.next(false);
                return;
            }

            const firstOne = list.sort((s1, s2) => s1.InnerCreateDateNumber - s2.InnerCreateDateNumber).find(f => !f.IsSent);

            if (this.utils.isNull(firstOne)) {
                result.next(false);
                return;
            }

            localStorage.setItem('ExList', JSON.stringify(list));

            const saveDto = new LogExceptionDto();
            saveDto.ApplicationTypeId = ApplicationTypes.Angular;
            saveDto.Class = firstOne.Class;
            saveDto.Method = firstOne.Method;
            saveDto.Message = firstOne.Message;
            saveDto.Stack = firstOne.Stack;
            saveDto.Source = firstOne.Source;
            saveDto.InnerCreateDateNumber = firstOne.InnerCreateDateNumber;

            let subscribeSave = this.save(saveDto).subscribe(
                x => {
                    const newList = this.getLocal();
                    if (this.utils.isNull(newList) || newList.length == 0) {
                        result.next(true);
                        return;
                    }
                    this.utils.unsubs(subscribeSave);

                    if (x.IsSuccess) {
                        newList.forEach(element => {
                            if (element.InnerCreateDateNumber == firstOne.InnerCreateDateNumber) {
                                element.IsSent = true;
                                localStorage.setItem('ExList', JSON.stringify(newList));

                                result.next(true);
                                return;
                            }
                        });
                    } else {
                    }
                },
                err => {
                }
            );
        }, 200);

        return result.asObservable();
    }
}