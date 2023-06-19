import * as PIXI from 'pixi.js';
import { Creature } from './creature';
import { Entity, Location } from './entity';
import { Subject, takeUntil, fromEvent, merge } from 'rxjs';

export class Tower extends Creature {

    protected readonly onDestroy: Subject<void>;

    private exp: number;

    get getExp(): number { return this.exp }

    constructor(x: number, y: number, sprite: PIXI.Sprite) {
        super({ x, y }, 30, 6, 'lime', sprite, 100000, 1,true);

        this.mana = 50;
        this.manaTotal = 50;
        this.attackSpeed = 1000;
        this.lastAttack = 0;
        this.exp = 0;
        this.onDestroy = new Subject<void>()
    }

    public destroy(): void {
        super.destroy();
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    public playerReset(location: Location) {
        this.sprite.x = location.x;
        this.sprite.y = location.y;

        this.health = this.healthTotal;
        this.alive = true;
    }

    public gainExp(exp: number) {
        this.exp += exp;
    }
}