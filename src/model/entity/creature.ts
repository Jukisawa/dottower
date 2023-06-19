import * as PIXI from 'pixi.js';
import { Entity, Location } from './entity';

export class Creature extends Entity {
public lastAttack: number;
public level: number;
protected attackSpeed: number;
protected health: number;
protected healthTotal: number;
protected mana: number;
protected manaTotal: number;
protected angle: number;

constructor(location: Location, size: number, velocity: number, color: string, sprite: PIXI.Sprite,  health: number = 100, attackSpeed: number = 1000, alive = true) {
    super(location, color, size, sprite, velocity, alive);

    this.health = health;
    this.healthTotal = health;
    this.mana = 50;
    this.manaTotal = 50;
    this.lastAttack = performance.now();
    this.attackSpeed = attackSpeed;
    this.level = 1;
    this.angle = 90;
}

get getHealth(): number { return this.health }
get getHealthTotal(): number { return this.healthTotal }
get getMana(): number { return this.mana }
get getManaTotal(): number { return this.manaTotal }

set setHealth(value: number) {
    this.health = value;
}

public changeState(state: 'hp', value: number): void {
    switch (state) {
        case 'hp':
            this.health += value;
            if (this.health <= 0)
                this.alive = false;
            break;
    }
}

public canAttack(): boolean {
    return performance.now() - this.lastAttack > this.attackSpeed;
}

get damage(): number {
    return 10;
}

public move(target: Entity) {
    if (this.distance(target.getLocation) < 30) { return; }

    const angle = Math.atan2(
        this.sprite.y - target.y,
        this.sprite.x - target.x,
    );

    this.angle = angle;

    this.sprite.x -= Math.cos(angle) * this.velocity;
    this.sprite.y -= Math.sin(angle) * this.velocity;
}
}