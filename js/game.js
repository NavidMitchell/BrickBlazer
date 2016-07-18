/**
 * A sample game.js for you to work from
 */


CollisionType =
{
    NONE:0x0000, // BIT MAP
    BALL:0x0001, // 0000001
    WALL:0x0002, // 0000010
    PADDLE:0x0004, // 0000100
    PADDLE_HOLDER:0x0008, // 0001000
    BLOCK:0x0016 //0010000
};


/**
 * GameScene
 * A template game scene
 */
GameScene = pc.Scene.extend('GameScene',
    { },
    {
        gameLayer:null,
        paddle: null,
        paddleDirection:0,
        paddleSheet:null,
        blockSheet:null,
        starSheet:null,

        init:function ()
        {
            this._super();


            this.paddleSheet = new pc.SpriteSheet({ image:pc.device.loader.get('paddle').resource, frameWidth:100, frameHeight:31, useRotation:false});

            this.blockSheet = new pc.SpriteSheet({  image:pc.device.loader.get('BlockGlow').resource, useRotation:true, frameWidth:49, frameHeight:50 });
            this.blockSheet.addAnimation({ name:'moving', time:300, frameCount:5 });

            var starsImage = pc.device.loader.get('stars').resource;
            this.starSheet = new pc.SpriteSheet({sourceX:20, image:starsImage, frameWidth:20, frameHeight:20, framesWide:3, framesHigh:3});

            //-----------------------------------------------------------------------------
            // game layer
            //-----------------------------------------------------------------------------
            this.gameLayer = this.addLayer(new pc.EntityLayer('game layer', 10000, 10000));

            // all we need is the render system
            this.gameLayer.addSystem(
                new GamePhysics( { gravity: { x: 0, y: 50 } })
            );
            this.gameLayer.addSystem(new pc.systems.Particles());
            this.gameLayer.addSystem(new pc.systems.Effects());
            this.gameLayer.addSystem(new pc.systems.Render());
            this.gameLayer.addSystem(new pc.systems.Expiration());

            this.paddle = this.createPaddle();

            this.createBall(this.gameLayer,50,300,15,15);

            this.createBlocks();

            // create some boundary walls on the edges of the screen
            this.createWall(this.gameLayer, 0, 0, 1, pc.device.canvasHeight); // left
            this.createWall(this.gameLayer, 0, 0, pc.device.canvasWidth, 1); // top
            this.createWall(this.gameLayer, pc.device.canvasWidth, 0, 1, pc.device.canvasHeight); // right
            this.createWall(this.gameLayer, 0, pc.device.canvasHeight, pc.device.canvasWidth, 1); // bottom

            // a simple move action bound to the space key
            pc.device.input.bindState(this, 'moving left', 'LEFT');
            pc.device.input.bindState(this, 'moving right', 'RIGHT');
        },

        createPaddle:function(){
            var paddlePos = pc.device.canvasHeight - 50;

            var paddle = pc.Entity.create(this.gameLayer);
            paddle.addTag("PADDLE");
            paddle.addComponent(pc.components.Sprite.create({ spriteSheet:this.paddleSheet }));
            paddle.addComponent(pc.components.Spatial.create({ x:200, y:paddlePos,w:this.paddleSheet.frameWidth, h:this.paddleSheet.frameHeight}));
            paddle.addComponent(pc.components.Physics.create({
                fixedRotation: true,
                mass:1.8,
                maxSpeed:{x:150, y:0},
                gravity:{x:0, y:0},
                collisionCategory: CollisionType.PADDLE,
                collisionMask: CollisionType.BALL | CollisionType.WALL | CollisionType.PADDLE_HOLDER,
                shapes:[
                    { shape:pc.CollisionShape.RECT }
                ]
            }));

            //create 2 paddle holders to keep the paddle from moving vertically
            var e = pc.Entity.create(this.gameLayer);
            e.addTag('PADDLE_HOLDER');
            e.addComponent(pc.components.Spatial.create({x:0, y:paddlePos-1, dir:0, w:pc.device.canvasWidth, h:1 }));
            e.addComponent(pc.components.Physics.create({
                immovable:true,
                collisionCategory: CollisionType.PADDLE_HOLDER,
                collisionMask: CollisionType.PADDLE,
                shapes:[
                    { shape:pc.CollisionShape.RECT }
                ]
            }));

            var e2 = pc.Entity.create(this.gameLayer);
            e2.addTag('PADDLE_HOLDER');
            e2.addComponent(pc.components.Spatial.create({x:0, y:paddlePos+this.paddleSheet.frameHeight+1, dir:0, w:pc.device.canvasWidth, h:1 }));
            e2.addComponent(pc.components.Physics.create({
                immovable:true,
                collisionCategory: CollisionType.PADDLE_HOLDER,
                collisionMask: CollisionType.PADDLE,
                shapes:[
                    { shape:pc.CollisionShape.RECT }
                ]
            }));

            return paddle;
        },

        createBlocks:function(){
            var blockCount = pc.device.canvasWidth / 50;
            for(y = 0; y < 4; y++){
                for(x = 0; x < blockCount;x++){
                    var e = pc.Entity.create(this.gameLayer);
                    e.addTag("BLOCK");
                    e.addComponent(pc.components.Sprite.create({ spriteSheet:this.blockSheet, animationStart:'moving',animationStartDelay:Math.floor(Math.random()*600) }));
                    e.addComponent(pc.components.Spatial.create({ x:x*50, y:y*50, w:this.blockSheet.frameWidth, h:this.blockSheet.frameHeight }));
                    e.addComponent(pc.components.Physics.create({
                        immovable:true,
                        collisionCategory: CollisionType.BLOCK,
                        collisionMask: CollisionType.BALL,
                        shapes:[
                            { shape:pc.CollisionShape.RECT }
                        ]
                    }));
                }
            }
        },

        createBall:function(layer,x,y,w,h){
            var ball = pc.Entity.create(layer);
            ball.addTag("BALL");
            ball.addComponent(pc.components.Circle.create({ color:'#ffffff' }));
            ball.addComponent(pc.components.Spatial.create({ x:x, y:y, w:w, h:h }));
            ball.addComponent(pc.components.Physics.create({
                bounce: 2,
                turn: 45,
                friction:0.2,
                maxSpeed:{x:80, y:1000},
                collisionCategory: CollisionType.BALL,
                collisionMask: CollisionType.BALL | CollisionType.WALL | CollisionType.PADDLE | CollisionType.BLOCK,
                shapes:[
                    { shape:pc.CollisionShape.RECT }
                ]
            }));
            ball.addComponent(pc.components.ParticleEmitter.create(
                {
                    spriteSheet:this.starSheet,
                    burst:3,
                    delay:20,
                    thrustMin:8, thrustTime:300,
                    maxVelX:5, maxVelY:5,
                    rangeX:10, rangeY:10, // x axis modification: 10 equals -5 position.x to +5 position.x
                    angleMin:-100, angleMax:-80,
                    lifeMin:500,
                    alphaMin:0, alphaMax:1, alphaDelay:50,
                    gravityY:0.02,
                    compositeOperation:'lighter',
                    spinMin:-80, spinMax:80,
                    rotateSprite:true
                }));
        },

        createWall:function (layer, x, y, w, h)
        {
            var e = pc.Entity.create(layer);
            e.addTag('WALL');
            e.addComponent(pc.components.Spatial.create({x:x, y:y, dir:0, w:w, h:h }));
            e.addComponent(pc.components.Physics.create({
                immovable:true,
                collisionCategory: CollisionType.WALL,
                collisionMask: CollisionType.BALL | CollisionType.PADDLE,
                shapes:[
                    { shape:pc.CollisionShape.RECT }
                ]
            }));
        },

        onAction:function (actionName, event, pos)
        {


        },

        process:function ()
        {
            //
            // ... do extra processing in here
            //

            if (pc.device.input.isInputState(this, 'moving right')){
                if(this.paddleDirection < 0){
                    this.paddle.getComponent('physics').setLinearVelocity(0,0);
                }
                this.paddleDirection = 1;

                //this.box.getComponent('spatial').pos.x += 20;
                this.paddle.getComponent('physics').applyImpulse(2,0);

            }else if(pc.device.input.isInputState(this, 'moving left')){
                if(this.paddleDirection > 0){
                    this.paddle.getComponent('physics').setLinearVelocity(0,0);
                }
                this.paddleDirection = -1;

                //this.box.getComponent('spatial').pos.x -= 20;
                this.paddle.getComponent('physics').applyImpulse(2,180);

            }else if(!pc.device.input.isInputState(this, 'moving left') && !pc.device.input.isInputState(this, 'moving right')){
                this.paddle.getComponent('physics').setLinearVelocity(0,0);
                this.paddleDirection = 0;
            }

            // clear the background
            pc.device.ctx.clearRect(0, 0, pc.device.canvasWidth, pc.device.canvasHeight);

            // always call the super
            this._super();
        }
    });


BrickBlazer = pc.Game.extend('BrickBlazer',
    { },
    {
        gameScene:null,

        onReady:function ()
        {
            this._super();

            // disable caching when developing
            if (pc.device.devMode)
                pc.device.loader.setDisableCache();

            pc.device.loader.add(new pc.Image('explosions', 'images/explosions.png'));
            pc.device.loader.add(new pc.Image('stars', 'images/stars.png'));
            pc.device.loader.add(new pc.Image('paddle', 'images/paddle.png'));
            pc.device.loader.add(new pc.Image('blockAlien', 'images/blocks_alien.png'));
            pc.device.loader.add(new pc.Image('blockGlow', 'images/blocks_glow.png'));


            if (pc.device.soundEnabled){
                pc.device.loader.add(new pc.Sound('fire', 'sounds/lowfire', ['ogg', 'mp3'], 15));
                pc.device.loader.add(new pc.Sound('explosion', 'sounds/explosion', ['ogg', 'mp3'], 12));
            }


            // fire up the loader
            pc.device.loader.start(this.onLoading.bind(this), this.onLoaded.bind(this));
        },

        onLoading:function (percentageComplete)
        {
            // draw title screen -- with loading bar
        },

        onLoaded:function ()
        {
            // resources are all ready, start the main game scene
            // (or a menu if you have one of those)
            this.gameScene = new GameScene();
            this.addScene(this.gameScene);
        }
    });


