class level1 extends Phaser.Scene {
    constructor() {
        super('level1')
    }

    preload() {
        this.load.image('ground', 'assets/platform.png')
        this.load.image('sky', 'assets/sky.png')
        this.load.image('ouh', 'assets/ouh.png')
        this.load.image('flag', 'assets/finish.png')
        this.load.image('nextlvl', 'assets/button.png')
        this.load.image('restart', 'assets/restart.png')

        this.load.audio('run', 'assets/run.mp3')
        this.load.audio('fall', 'assets/death.mp3')
        this.load.audio('jump', 'assets/hopp.wav')
        this.load.audio('whoop1', 'assets/whoop1.wav')
        this.load.audio('whoop2', 'assets/whoop2.wav')
        this.load.audio('whoop3', 'assets/whoop3.wav')
        this.load.audio('whoop4', 'assets/whoop4.wav')
        this.load.audio('ough', 'assets/ough.wav')
        this.load.audio('music', 'assets/SOOOSKOBABONGGOB.wav')
        this.load.audio('yippiii', 'assets/yippie.wav')

        this.load.spritesheet('peguig', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 })
        this.load.spritesheet('fell', 'assets/whoa.png', { frameWidth: 32, frameHeight: 48 })
    }

    create() {

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('peguig', {start: 0, end: 3}),
            frameRate: 15,
            repeat: -1 
        })

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'peguig', frame: 4}],
            frameRate: 20
        })

        this.anims.create({
            key: 'ouhh',
            frames: [{ key: 'ouh'}],
            frameRate: 20
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('peguig', {start: 5, end: 8}),
            frameRate: 15,
            repeat: -1
        })

        this.anims.create({
            key: 'fallinger',
            frames: this.anims.generateFrameNumbers('fell', {start: 0, end: 8}),
            frameRate: 20,
            repeat: -1
        })

        this.add.image(750, 400, 'sky').setScale(1, 1.1)
        this.platforms = this.physics.add.staticGroup()
        
        this.platforms.create(300, 390, 'ground').setScale(5, 1).refreshBody()
        this.platforms.create(800, 700, 'ground').setScale(3, 1).refreshBody()

        this.finishFlag = this.physics.add.image(800, 650, 'flag')
        this.finishFlag.body.setAllowGravity(false)

        this.player = this.physics.add.sprite(150, -1000, 'peguig').setOrigin(0.5, 0.5)

        this.splat = [
            this.sound.add('whoop1'),
            this.sound.add('whoop2'),
            this.sound.add('whoop3'),
            this.sound.add('whoop4'),
            this.sound.add('ough')
        ]
        this.hopp = this.sound.add('jump')
        this.run = this.sound.add('run')
        this.fall = this.sound.add('fall')
        this.yippie = this.sound.add('yippiii')
        this.bkcgrndMusic = this.sound.add('music', { loop: true })
        this.bkcgrndMusic.play()

        this.lastVelocity = 0
        this.fallVelocity = 0
        this.oof = false
        this.fallen = false
        this.speechCube = this.add.container(200, 200)
        
        this.cursor = this.input.keyboard.createCursorKeys()
        
        this.physics.add.collider(this.platforms, this.player)
        this.physics.add.overlap(this.player, this.finishFlag, this.congratulation, null, this)
        this.player.anims.play('turn', true)
        
        this.dialog = [
            "OUGH",
            "man never tell me to transcend universes",
            "hi there player",
            "please get me to the finish line",
            "why? i dunno lmfao"
        ]
        
        for (let i = 0; i < this.dialog.length; i++) {
            if (this.fallen)
                break

            this.time.delayedCall(i * 2000 + 2000, () => {
                this.dialogText = this.add.text(0, -100 + (i * 20), this.dialog[i], {
                    backgroundColor: '#000000'
                })
                
                this.speechCube.add(this.dialogText)
            })
        }
    }

    update() {
        this.speechCube.setPosition(this.player.body.position.x, this.player.body.position.y)
        this.player.setVelocityX(this.lastVelocity)

        if (!this.oof) {
            if (this.cursor.left.isDown && this.player.body.touching.down && !this.cursor.up.isDown) {
                this.lastVelocity = -170
                this.player.anims.play('left', true)
    
                if (!this.run.isPlaying) {
                    this.run.play()
                }
            } else if (this.cursor.right.isDown && this.player.body.touching.down && !this.cursor.up.isDown) {
                this.lastVelocity = 170
                this.player.anims.play('right', true)
    
                if (!this.run.isPlaying) {
                    this.run.play()
                }
            } else {
                if (this.player.body.touching.down) {
                    this.player.anims.play('turn', true)
                    this.lastVelocity = 0
                }
    
                if (this.run.isPlaying) {
                    this.run.stop()
                }
            }
            if (!this.player.body.touching.down) {
                this.player.anims.play("fallinger", true)
            }
        }

        if (!this.player.body.touching.down) {
            if ((this.player.body.touching.right || this.player.body.touching.left)) {
                this.player.setPosition(this.player.x - (Math.sign(this.lastVelocity) * (this.lastVelocity / 25)), this.player.y)
                this.lastVelocity = -this.lastVelocity

                this.splat[Math.floor(Math.random() * this.splat.length)].play()
            }
        }

        if (this.cursor.up.isDown && this.player.body.touching.down && !this.oof) {
            this.jumps -= 1
            this.player.setVelocityY(-300)
            
            this.lastVelocity += this.player.body.velocity.x * 1.4

            if (this.fallVelocity < 100) {
                this.hopp.play()
            }
        }

        if (!this.player.body.touching.down) {
            this.fallVelocity = this.player.body.velocity.y
        }

        if (this.fallVelocity >= 150 && this.player.body.touching.down && !this.oof) {
            this.oof = true
            this.lastVelocity = 0
            this.player.setVelocityY(300)
            this.fallVelocity = 0
            this.player.anims.play("ouhh", true)
            
            this.run.stop()
            this.splat[Math.floor(Math.random() * this.splat.length)].play()

            this.time.delayedCall(2000, () => {
                this.oof = false
                this.player.anims.play("ouhh", false)
            })
        }

        if (this.player.y > 720 && !this.fall.isPlaying && !this.fallen) {
            this.fall.play()
            this.fallen = true
            this.bkcgrndMusic.stop()  
            this.yippie.stop()

            this.speechCube.list.forEach(child => child.destroy())
            this.speechCube.removeAll(true)

            this.dialogText = this.add.text(0, -100, 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', {
                backgroundColor: '#000000'
            })
            
            this.speechCube.add(this.dialogText)

            if (this.nextLevel != null) {
                this.nextLevel.destroy()
            }
            
            if (this.player.body.x < 80) {
                this.restartBtn = this.add.image(80, 830, 'restart').setScale(.2, .2)
            } else if (this.player.body.x > 1420) {
                this.restartBtn = this.add.image(1420, 830, 'restart').setScale(.2, .2)
            } else {
                this.restartBtn = this.add.image(this.player.body.x, 830, 'restart').setScale(.2, .2)
            }

            this.restartBtn.setInteractive()
            .on('pointerdown', ()=>{
                this.hopp.stop()
                this.yippie.stop()
                this.run.stop()
                this.fall.stop()
                this.bkcgrndMusic.stop()

                this.scene.start("level1")
            })

            for (let i = 0; i < 200; i++) {
                this.time.delayedCall(50 * i, ()=>{
                    this.restartBtn.setPosition(this.restartBtn.x, this.restartBtn.y - .5)
                })
            }
        }
    }

    congratulation() {
        this.nextLevel = this.add.image(1500/2, 790/2, 'nextlvl').setScale(3, 3)
        .setInteractive()
        .on('pointerdown', () => {
            this.hopp.stop()
            this.yippie.stop()
            this.run.stop()
            this.fall.stop()
            this.bkcgrndMusic.stop()
            this.scene.start("level2")
        })

        this.finishFlag.disableBody(true, true)
        this.yippie.play()
    }
}