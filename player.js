p = (() => {

  class Player {
    animations;
    action;
    jump = false;
    isDead = false;

    constructor(params) {
      this.position_ = new THREE.Vector3(0, 0, 0);
      this.velocity_ = 0.0;

      this.playerBox_ = new THREE.Box3();

      this.params_ = params;

      this.LoadModel_();
      this.InitInput_();
    }

    LoadModel_() {
      const loader = new THREE.GLTFLoader();
      loader.load('resources/horse/Horse.json', (horse) => {

        this.animations = horse.animations;
        this.mesh_ = horse.scene;
        this.mesh_.scale.setScalar(0.5);
        this.params_.scene.add(this.mesh_);
        this.gateCollided;

        this.isRunning = false;

        //AICI O VIATA 
        this.lives = 1;
        this.updateLivesText();
        this.grassSound;

        this.mesh_.quaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0), Math.PI / 2);

        this.mesh_.traverse(c => {
          let materials = c.material;
          if (!(c.material instanceof Array)) {
            materials = [c.material];
          }

          for (let m of materials) {
            if (m) {
              m.specular = new THREE.Color(0x000000);
              m.color.offsetHSL(0, 0, 0.25);
            }
          }
          c.castShadow = true;
          c.receiveShadow = true;
        });

        const m = new THREE.AnimationMixer(this.mesh_);
        this.mixer_ = m;
        this.walkSlow();

      }, undefined, function (error) {

        console.error(error);

      });
    }

    InitInput_() {
      this.keys_ = {
        spacebar: false,
      };
      this.oldKeys = { ...this.keys_ };

      document.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
      document.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
    }

    playAnimation(clipName, animationSpeed = 1.5, loopMode = THREE.LoopRepeat) {
      for (let i = 0; i < this.animations.length; ++i) {
        if (this.animations[i].name.includes(clipName)) {
          const clip = this.animations[i];
          if (this.action) {
            this.action.stop();
          }
          this.action = this.mixer_.clipAction(clip);
          this.action.setLoop(loopMode);
          this.action.clampWhenFinished = true;
          this.action.play();

          this.mixer_.timeScale = animationSpeed;
        }
      }
    }

    die() {
      this.isDead = true;
      document.getElementById('container').classList.remove('no-events');
      this.stopPlayingGrassSound();
      playSound('./resources/audio/horseDeath.wav')
      this.playAnimation("Death", 1.5, THREE.LoopOnce);
      playerMovementSpeed = 0;
    }

    OnKeyDown_(event) {
      if (this.isDead) {
        return
      }

      switch (event.code) {
        case "Space":
          {
            this.keys_.space = true;
            if (!this.jump) {
              this.stopPlayingGrassSound();
              this.playAnimation("Jump", 1.5, THREE.LoopOnce);
            }
            this.jump = true;
          }
          break;

        case "ArrowLeft": {

          if (this.isRunning) {
            this.walkSlow();
          }
          this.isRunning = false;
        } break;

        case "ArrowRight": {

          if (!this.isRunning) {
            this.walkFast();
          }
          this.isRunning = true;

        } break;
      }
    }

    OnKeyUp_(event) {
      switch (event.keyCode) {
        case 32:
          this.keys_.space = false;
          break;
      }
    }

    CheckCollisions_() {
      const colliders = this.params_.world.GetColliders();

      this.playerBox_.setFromObject(this.mesh_);

      for (let c of colliders) {
        const current_collider = c.collider;

        if (this.gateCollided == current_collider) {
          continue;
        }

        if (current_collider.intersectsBox(this.playerBox_)) {
          if (this.lives > 0) {
            this.gateCollided = current_collider;

            this.lives--;
            this.updateLivesText();

            if (this.lives == 0) {
              this.die();

              setTimeout(() => {
                this.gameOver = true;
              }, 1000);

            } else {
              playSound('./resources/audio/horseSnort.wav');

              // change color of horse to a random one

              this.mesh_.traverse(c => {
                let materials = c.material;
                if (!(c.material instanceof Array)) {
                  materials = [c.material];
                }

                for (let m of materials) {
                  if (m) {
                    m.color.set(0xffffff * Math.random())
                  }
                }
              });
            }
          }
        }
      }
    }

    updateLivesText() {
      document.getElementById('lives-text').innerText = "Lives: " + this.lives;
    }

    Update(timeElapsed) {

      if (this.keys_.space && this.position_.y == 0.0) {

        this.velocity_ = 30;
      }

      const acceleration = -75 * timeElapsed;

      this.position_.y += timeElapsed * (
        this.velocity_ + acceleration * 0.8);
      this.position_.y = Math.max(this.position_.y, 0.0)

      if (this.position_.y == 0 && this.jump == true && this.lives > 0) {
        playSound('./resources/audio/horseLanding.wav');

        this.jump = false;
        if (this.isRunning) {
          this.walkFast();
        } else {
          this.walkSlow();
        }
      }

      this.velocity_ += acceleration;
      this.velocity_ = Math.max(this.velocity_, -100);

      if (this.mesh_) {
        this.mixer_.update(timeElapsed);
        this.mesh_.position.copy(this.position_);
        this.CheckCollisions_();
      }
    }

    walkFast() {
      this.playGrassSound();

      playerMovementSpeed = 18;
      this.playAnimation("Walk", 8);
      // playerMovementSpeed = 12;
      // this.playAnimation("Walk", 6);

    }

    walkSlow() {
      this.playGrassSound();

      playerMovementSpeed = 12;
      this.playAnimation("Walk", 6);

      // playerMovementSpeed = 6;
      // this.playAnimation("Walk", 1.5);
    }

    playGrassSound() {
      if (this.grassSound) {
        this.grassSound.stop();
      } else {
        this.grassSound = new THREE.Audio(listener);
        const buffer = audioPool.getAsset('./resources/audio/horseWalking.wav');
        this.grassSound.setBuffer(buffer);
        this.grassSound.setLoop(true);
        this.grassSound.setVolume(1);
      }

      this.grassSound.play();
    }

    stopPlayingGrassSound() {
      if (this.grassSound) {
        this.grassSound.stop();
      }
    }
  };

  return {
    Player: Player,
  };
})();