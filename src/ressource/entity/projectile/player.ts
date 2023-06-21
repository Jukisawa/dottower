import { ProjectileTypeResource }   from '../../ressource.types';

export const basicAttack: ProjectileTypeResource = {
    base: {
        damage          : 5,                   // the base damage value applied on hit
        damageFalloff   : 0,                   // percentage of damage reduction -> for aoe center to outer bound and for penetration the amount per hit
        areaOfEffect    : 1,                   // the radius of the area in wich damage will be applied
        maxHits         : 1,                   // how many targets can the projectile hit
        lifetime        : 5000,                // the maximum amount of time the projectile can exist
        velocity        : 10,
        maxTurnAngle    : 360,                 // how fast can the projectile correct its flightpath
        canPenetrate    : false,               // can the projectile go through a target (up to maxHits)
        canSelfDestruct : false,               // will the projectile apply damage (aoe) if lifetime reaches zero
        canAutoTarget   : false,               // can the projectile search for a new target, if its current one does not exist
        autoTargetRange : 0,                   // how far do we check to autoTarget a new Unit
    },
    size        : 5,                // radius
    color       : '#b73232',        // fallback if no asset is provided -> defaults to #fff
    assetPath   : 'assets/img/bullet.png'
}