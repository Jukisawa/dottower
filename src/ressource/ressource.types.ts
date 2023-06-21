import { UnitType }             from '../model/entity/unit';
import { PlayerType }           from '../model/entity/player';
import { ProjectileType }       from '../model/entity/projectile';

export interface PlayerTypeResource extends Omit<PlayerType, 'current'> {
    assetPath?: string;
}
export interface UnitTypeResource extends Omit<UnitType, 'current'> {
    assetPath?: string;
}
export interface ProjectileTypeResource extends Omit<ProjectileType, 'current'>  {
    assetPath?: string;
}