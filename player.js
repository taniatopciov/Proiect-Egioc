p = (() => {

    class Player {
      animations;
      action;
      jump = false;
  
      constructor(params) {
        this.position_ = new THREE.Vector3(0, 0, 0);
        this.velocity_ = 0.0;
  
        // this.mesh_ = new THREE.Mesh(
        //     new THREE.BoxBufferGeometry(1, 1, 1),
        //     new THREE.MeshStandardMaterial({
        //         color: 0x80FF80,
        //     }),
        // );
        // this.mesh_.castShadow = true;
        // this.mesh_.receiveShadow = true;
        // params.scene.add(this.mesh_);
  
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
          this.mixer_.timeScale = 1.5;
  
          for (let i = 0; i < this.animations.length; ++i) {
            if (this.animations[i].name.includes('Walk')) {
              const clip = this.animations[i];
              this.action = this.mixer_.clipAction(clip);
              this.action.play();
            }
          }
        }, undefined, function (error) {

              console.error(error);
  
          });
      }
  
      InitInput_() {
        this.keys_ = {
            spacebar: false,
        };
        this.oldKeys = {...this.keys_};
  
        document.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
        document.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
      }
  
      OnKeyDown_(event) {
        switch(event.keyCode) {
          case 32:
            this.keys_.space = true;
            this.jump = true;
            for (let i = 0; i < this.animations.length; ++i) {
              if (this.animations[i].name.includes('Jump')) {
                const clip = this.animations[i];
                this.action.stop();
                this.action = this.mixer_.clipAction(clip);
                this.action.play();
                console.log("orice");
              }
            }
            break;
        }
      }
  
      OnKeyUp_(event) {
        switch(event.keyCode) {
          case 32:
            this.keys_.space = false;
            // for (let i = 0; i < this.animations.length; ++i) {
            //   if (this.animations[i].name.includes('Jum')) {
            //     const clip = this.animations[i];
            //     this.action.stop();
            //     this.action = this.mixer_.clipAction(clip);
            //     this.action.play();
            //   }
            // }
            break;
        }
      }
  
      CheckCollisions_() {
        const colliders = this.params_.world.GetColliders();
  
        this.playerBox_.setFromObject(this.mesh_);
  
        for (let c of colliders) {
          const cur = c.collider;
  
          if (cur.intersectsBox(this.playerBox_)) {
            // this.gameOver = true;
          }
        }
      }
  
      Update(timeElapsed) {
        
        if (this.keys_.space && this.position_.y == 0.0) {
          
          this.velocity_ = 30;
        }
  
        const acceleration = -75 * timeElapsed;
  
        this.position_.y += timeElapsed * (
            this.velocity_ + acceleration * 0.8);
        this.position_.y = Math.max(this.position_.y, 0.0)

        if(this.position_.y == 0 && this.jump == true) {
          for (let i = 0; i < this.animations.length; ++i) {
            if (this.animations[i].name.includes('Walk')) {
              const clip = this.animations[i];
              this.action.stop();
              this.action = this.mixer_.clipAction(clip);
              this.action.play();
              this.jump = false;
            }
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
    };
  
    return {
        Player: Player,
    };
  })();