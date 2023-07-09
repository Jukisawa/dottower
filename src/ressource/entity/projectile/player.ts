import { ProjectileTypeResource }   from '../../ressource.types';

export const basicAttack: ProjectileTypeResource = {
    base: {
        damage          : 15,                  // the base damage value applied on hit
        damageFalloff   : 10,                  // percentage of damage reduction -> for aoe center to outer bound and for penetration the amount per hit
        areaOfEffect    : 1,                   // the radius of the area in wich damage will be applied
        maxHits         : 3,                   // how many targets can the projectile hit
        lifetime        : 3000,                // the maximum amount of time the projectile can exist
        velocity        : 12,
        maxTurnAngle    : 0.05,                // how fast can the projectile correct its flightpath
        canPenetrate    : true,                // can the projectile go through a target (up to maxHits)
        canSelfDestruct : false,               // will the projectile apply damage (aoe) if lifetime reaches zero
        canAutoTarget   : false,               // can the projectile search for a new target, if its current one does not exist
        autoTargetRange : 450,                 // how far do we check to autoTarget a new Unit
    },
    size        : 5,                // radius
    color       : '#b73232',        // fallback if no asset is provided -> defaults to #fff
    assetPath   : 'assets/img/bullet.png'
}