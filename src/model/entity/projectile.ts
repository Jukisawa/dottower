import { Entity, EntityType, Option }       from './entity';
import { Unit }                             from './unit';
//import { Location }                         from '../../types/base.types';
import { GameService }                      from '../../service';

interface Location {
    x: number;
    y: number;
}

export interface ProjectileValue {
    damage          : number;                   // the base damage value applied on hit
    damageFalloff   : number;                   // percentage of damage reduction -> for aoe center to outer bound and for penetration the amount per hit
    areaOfEffect    : number;                   // the radius of the area in wich damage will be applied
    maxHits         : number;                   // how many targets can the projectile hit
    lifetime        : number;                   // the maximum amount of time the projectile can exist
    velocity        : number;
    maxTurnAngle    : number;                   // how fast can the projectile correct its flightpath
    canPenetrate    : boolean;                  // can the projectile go through a target (up to maxHits)
    canSelfDestruct : boolean;                  // will the projectile apply damage (aoe) if lifetime reaches zero
    canAutoTarget   : boolean;                  // can the projectile search for a new target, if its current one does not exist
    autoTargetRange : number;                   // how far do we check to autoTarget a new Unit
}
export type ProjectileType<Value extends ProjectileValue = ProjectileValue> = { base: Value, current?: Value } & EntityType<Value>

export class Projectile<Value extends ProjectileValue = ProjectileValue, Type extends ProjectileType<Value> = ProjectileType<Value>> extends Entity<ProjectileType<Value>> {

    protected alive         : boolean;
    protected target        : Unit | Location | null;
    protected creationTime  : number;
    protected targetsHit    : number;

    public constructor(
        location    : Location,
        target      : Location|Unit,
        type        : Type,
        options     : Option<Value, Type> = {}
    ) {
        super(location, type, options);

        // set initial values
        this.values.current = {
            ...this.values.base,
            ...this.values.current,
        };
        this.target         = target;
        this.alive          = true;
        this.targetsHit     = 0;
        this.creationTime   = performance.now();

        this.values.angle

        this.visual.angle = this.values.angle ?? Math.atan2(
            this.visual.y - this.target.y,
            this.visual.x - this.target.x,
        );
    }

    get base(): Value {
        return { ...this.values.base };
    }

    get current(): Value {
        return { ...this.values.current};
    }

    public hitTarget(target: Unit | Location): void {
        // we only apply hit damage if the projectile is still alive
        if (!this.alive) return;

        if (target instanceof Location) {
            GameService.instance.getEnemiesInRage(this.location, this.current.areaOfEffect)
                .forEach(( unit, i) => {
                    if (this.targetsHit <= this.current.maxHits ) {
                        this.targetsHit++;
                        const distanceToCenter = unit.distance(target);
                        const distanceInPercent = distanceToCenter * 100 / this.current.areaOfEffect;
                        const damageFalloff = distanceInPercent / 100 * this.current.damageFalloff;
                        unit.changeValue('hp', -this.current.damage * ( 1 - damageFalloff));
                    }
                });
        }

        if (target instanceof Unit) {
            if (this.targetsHit <= this.current.maxHits ) {
                const damageFalloff = this.targetsHit * this.current.damageFalloff;
                this.targetsHit++; // hit is hit, whatever we do damage or not

                if (damageFalloff > 1) return;
                target.changeValue('hp', -this.current.damage * ( 1 - damageFalloff));
            }
        }

        this.alive = false;
    }
    public aliveCheck(): boolean {
        if ((this.creationTime + this.current.lifetime ) < performance.now()) {
            if (this.current.canSelfDestruct)
                this.hitTarget(this.location);
            this.alive = false
        }
        return this.alive;
    }

    public move() {
        if (this.target == null || (this.target instanceof Unit) && !this.target.isAlive) {
            this.target = null;
            if (this.current.canAutoTarget) {
                this.target = GameService.instance.getClosestEnemyInRage(this.location, this.current.autoTargetRange);
            }
            if (this.target === null) {
                // keep flight direction
                this.visual.x -= Math.cos(this.visual.angle) * this.current.velocity;
                this.visual.y -= Math.sin(this.visual.angle) * this.current.velocity;
                return;
            }
        }

        let angle = Math.atan2(
            this.visual.y - this.target.y,
            this.visual.x - this.target.x,
        );
        if (this.visual.angle + this.current.maxTurnAngle < angle)
            angle = this.visual.angle + this.current.maxTurnAngle;

        if (this.visual.angle - this.current.maxTurnAngle > angle)
            angle = this.visual.angle - this.current.maxTurnAngle;

        this.visual.angle = angle;

        this.visual.x -= Math.cos(angle) * this.current.velocity;
        this.visual.y -= Math.sin(angle) * this.current.velocity;

        GameService.instance.drawLine(this.location, { x: this.target.x, y:  this.target.y})
    }
}