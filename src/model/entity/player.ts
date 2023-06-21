import { Subject }              from 'rxjs';
import { fromEvent }            from 'rxjs';
import { takeUntil, merge }     from 'rxjs/operators';

import { Unit }                 from './unit';
import { UnitType, UnitValue }  from './unit';
import { EntityType, Option }   from './entity';
import { Location }             from '../../types/base.types';

export interface PlayerValue extends UnitValue {
    exp         : number;
    attackRange : number;
}

export type PlayerType<Value extends PlayerValue = PlayerValue> = { base: Value, current?: Value } & UnitType<Value>;

export class Player extends Unit<PlayerValue, PlayerType> {
    public readonly $onDestroy: Subject<void>;

    public constructor(
        location    : Location,
        type        : PlayerType,
        options     : Option<PlayerValue, PlayerType> = {}
    ) {
        super(location, type, options);

        this.$onDestroy = new Subject<void>();
    }

    public destroy(): void {
        super.destroy();
        this.$onDestroy.next();
        this.$onDestroy.complete();
    }

    public get base(): PlayerValue {
        return { ...this.values.base };
    }

    public get current(): PlayerValue {
        return { ...this.values.current };
    }

    public changeValue(type: 'hp'|'exp', value: number) {
        switch (type) {
            case 'exp':
                this.current.exp += value;
                return;
            default:
                super.changeValue(type, value);
        }
    }

    public playerReset(): void {
        this.current.hp     = this.base.hp;
        this.current.exp    = this.base.exp;
        this.current.level  = this.base.level;

        this.alive = true;
    }
}