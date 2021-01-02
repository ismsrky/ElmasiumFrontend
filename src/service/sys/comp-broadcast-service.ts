import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { CompBroadcastArgBo } from '../../bo/sys/comp-broadcast-arg.bo';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class CompBroadCastService {
    private _eventBus: Subject<CompBroadcastArgBo>;

    constructor() {
        this._eventBus = new Subject<CompBroadcastArgBo>();
    }

    sendMessage(type: CompBroadCastTypes, data?: any) {
        this._eventBus.next({ type, data });
    }

    clearMessage() {
        this._eventBus.next();
    }

    getMessage<T>(type: CompBroadCastTypes): Observable<T> {
        return this._eventBus.asObservable().pipe(
            filter(event => event.type === type),
            map(event => <T>event.data)
        );
    }
}