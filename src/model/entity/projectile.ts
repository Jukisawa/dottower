import * as PIXI from 'pixi.js';
import { Entity } from './entity';
import { Creature } from './creature';


export class Projectile extends Entity {
    protected damage: number;
    protected target: Creature | null;
    protected time: number;
    protected created: number;
    protected areaOfEffect: number;
    protected maxTargets: number;
    protected hits: number;

    constructor(x: number, y: number, damage: number, color: string, sprite: PIXI.Sprite, target: Creature | null, time: number = 10000, aoe: number = 0,  size: number = 3, maxTarget = 1) {
        super({ x, y }, color, size, sprite, size);
        this.damage = damage;
        this.target = target;
        this.time = time;
        this.created = performance.now();
        this.areaOfEffect = aoe;
        this.hits = 0;
        this.maxTargets = maxTarget;

    }

    get getAoe(): number { return this.areaOfEffect; }

    public hitEnemy(enemy: Creature): void {
        if (this.hits <= this.maxTargets) {
            enemy.changeState('hp', -this.damage);
            this.hits += 1;
        }
        else {
            this.alive = false;
        }
    }

    public move() {

        if ((this.created + this.time) < performance.now()) { this.alive = false; }

        if (this.target !== null) {
            if (!this.target.isAlive) {
                this.destroy();
                this.alive = false;
            }

            const angle = Math.atan2(
                this.sprite.y - this.target.y,
                this.sprite.x - this.target.x,
            );

            this.sprite.x -= Math.cos(angle) * this.velocity;
            this.sprite.y -= Math.sin(angle) * this.velocity;
        }
    }
}