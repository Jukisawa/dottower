import { Entity, Option }                   from './entity';
import { EntityType }                       from './entity';
import { Location }                         from '../../types/base.types';

export interface UnitValue {
    level       : number;
    attack      : number;
    hp          : number;
    armor       : number;
    attackSpeed : number;
    velocity    : number;
}
export type UnitType<Value extends UnitValue = UnitValue> = { base: Value, current?: Value } & EntityType<Value>;

export class Unit<Value extends UnitValue = UnitValue, Type extends UnitType<Value> = UnitType<Value>> extends Entity<UnitType<Value>> {

    protected alive         : boolean;
    protected lastAttack    : number;

    public constructor(
        location    : Location,
        type        : Type,
        options     : Option<Value, Type> = {}
    ) {
        super(location, type, options);

        // set initial values
        this.values.current = {
            ...this.values.base,
            ...this.values.current,
        };

        this.alive = this.current.hp > 0;
        this.lastAttack = 0;
    }

    public get base(): Value {
        return { ...this.values.base };
    }

    public get current(): Value {
        return { ...this.values.current};
    }

    public get isAlive(): boolean {
        return this.alive;
    }

    public changeValue(type: 'hp', value: number): void {
        switch (type) {
            case 'hp':
                this.current[type] += value;
                if (this.current[type] <= 0)
                    this.alive = false;
                break;
        }
    }

    public attackNow(): void {
        this.lastAttack = performance.now();
    }

    public canAttack(): boolean {
        return performance.now() - this.lastAttack > this.current.attackSpeed;
    }

    public move(target: Entity) {
        if (this.distance(target.location) < ( this.size + target.size )) return;

        const angle = Math.atan2(
            this.visual.y - target.y,
            this.visual.x - target.x,
        );
        this.visual.angle = angle;

        this.visual.x -= Math.cos(angle) * this.current.velocity;
        this.visual.y -= Math.sin(angle) * this.current.velocity;
    }
}