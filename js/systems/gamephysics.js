/**
 * Created with JetBrains WebStorm.
 * User: navid
 * Date: 11/24/12
 * Time: 12:37 AM
 * To change this template use File | Settings | File Templates.
 */

GamePhysics = pc.systems.Physics.extend('GamePhysics',
    {},
    {
        explosionSheet:null,
        explosionSound:null,
        explosionNames:['exploding1','exploding2','exploding3','exploding4','exploding5','exploding6','exploding7','exploding8'],

        init:function (options)
        {
            this._super(options);

            this.explosionSheet = new pc.SpriteSheet({image:pc.device.loader.get('explosions').resource, framesWide:16, framesHigh:8, useRotation:true});
            this.explosionSheet.addAnimation({ name:'exploding1', frameY:0, frameCount:16, time:500, loops:1 });
            this.explosionSheet.addAnimation({ name:'exploding2', frameY:1, frameCount:16, time:500, loops:1 });
            this.explosionSheet.addAnimation({ name:'exploding3', frameY:2, frameCount:16, time:500, loops:1 });
            this.explosionSheet.addAnimation({ name:'exploding4', frameY:3, frameCount:16, time:500, loops:1 });
            this.explosionSheet.addAnimation({ name:'exploding5', frameY:4, frameCount:16, time:500, loops:1 });
            this.explosionSheet.addAnimation({ name:'exploding6', frameY:5, frameCount:16, time:500, loops:1 });
            this.explosionSheet.addAnimation({ name:'exploding7', frameY:6, frameCount:16, time:500, loops:1 });
            this.explosionSheet.addAnimation({ name:'exploding8', frameY:7, frameCount:16, time:500, loops:1 });

            if (pc.device.soundEnabled)
            {
                this.explosionSound = pc.device.loader.get('explosion').resource;
                this.explosionSound.setVolume(0.8);
            }

        },

        onCollision:function (aType, bType, entityA, entityB, force, fixtureAType, fixtureBType, contact)
        {

        },

        onCollisionStart:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {
            if(entityB.hasTag('BLOCK')){

                this.explosionSound.play(false);

                // change the asteroid (entityB in this case)
                if (!entityB.hasComponentOfType('expiry'))
                {
                    // switch the asteroid sprite into a smoke explosion
                    entityB.getComponent('sprite').sprite.setSpriteSheet(this.explosionSheet);
                    entityB.getComponent('sprite').sprite.setAnimation(this.explosionNames[Math.floor(Math.random()*8)],0,true);
                    entityB.addComponent(pc.components.Expiry.create({ lifetime:500 }));

                    if(entityA.hasTag('BALL')){
                        entityA.getComponent('physics').setLinearVelocity(2, 50);
                    }
                }

            }else if(entityA.hasTag('BALL') && entityB.hasTag('PADDLE')){
                entityA.getComponent('physics').setLinearVelocity(2, 600);
            }
        },

        onCollisionEnd:function (aType, bType, entityA, entityB, fixtureAType, fixtureBType, contact)
        {

        }

    });