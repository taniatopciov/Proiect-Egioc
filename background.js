b = (() => {

  class BackgroundCloud {
    constructor(params) {
      this.params_ = params;
      this.position_ = new THREE.Vector3();
      this.quaternion_ = new THREE.Quaternion();
      this.scale_ = 1.0;
      this.mesh_ = null;

      this.LoadModel_();
    }

    LoadModel_() {
      var cloud = cloudsPool.getRandomAsset();

      if (!cloud) {
        return;
      }

      this.mesh_ = cloud.scene.clone();
      this.params_.scene.add(this.mesh_);

      this.position_.x = math.rand_range(0, 2000);
      this.position_.y = math.rand_range(100, 200);
      this.position_.z = math.rand_range(500, -1000);
      this.scale_ = math.rand_range(10, 20);

      const q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
      this.quaternion_.copy(q);

      this.mesh_.traverse(c => {
        if (c.geometry) {
          c.geometry.computeBoundingBox();
        }

        let materials = c.material;
        if (!(c.material instanceof Array)) {
          materials = [c.material];
        }

        for (let m of materials) {
          if (m) {
            m.specular = new THREE.Color(0x000000);
            m.emissive = new THREE.Color(0xC0C0C0);
          }
        }
        c.castShadow = true;
        c.receiveShadow = true;
      });
    }

    Update(timeElapsed) {
      if (!this.mesh_) {
        return;
      }

      this.position_.x -= timeElapsed * 10;
      if (this.position_.x < -1000) {
        this.position_.x = math.rand_range(2000, 3000);
      }

      this.mesh_.position.copy(this.position_);
      this.mesh_.quaternion.copy(this.quaternion_);
      this.mesh_.scale.setScalar(this.scale_);
    }
  };

  class BackgroundNature {
    constructor(params) {
      this.params_ = params;
      this.position_ = new THREE.Vector3();
      this.quaternion_ = new THREE.Quaternion();
      this.scale_ = 1.0;
      this.mesh_ = null;

      this.LoadModel_();
    }

    LoadModel_() {
      var foliage = foliagePool.getRandomAsset();;

      if (!foliage) {
        return;
      }

      this.mesh_ = foliage.scene.clone();
      this.params_.scene.add(this.mesh_);
      this.parallaxEffectInfluence = 0;

      var random_z_left = math.rand_range(-250, -20);
      var random_z_right = math.rand_range(25, 250);

      this.position_.x = math.rand_range(0, 500);
      this.position_.z = Math.random();

      if (this.position_.z <= 0.5) {
        this.position_.z = random_z_left;
        this.parallaxEffectInfluence = math.inverseLerp(this.position_.z, -250, -20);
      } else {
        this.position_.z = random_z_right;
        this.parallaxEffectInfluence = math.inverseLerp(this.position_.z, 250, 20);
      }

      const scale = 5;
      this.scale_ = scale;

      const q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
      this.quaternion_.copy(q);

      this.mesh_.traverse(c => {
        let materials = c.material;
        if (!(c.material instanceof Array)) {
          materials = [c.material];
        }

        c.castShadow = true;
        c.receiveShadow = true;
      });
    }

    Update(timeElapsed) {
      if (!this.mesh_) {
        return;
      }

      this.position_.x -= timeElapsed * playerMovementSpeed * this.parallaxEffectInfluence;
      if (this.position_.x < -250) {
        this.position_.x = math.rand_range(250, 1000);
      }

      this.mesh_.position.copy(this.position_);
      this.mesh_.quaternion.copy(this.quaternion_);
      this.mesh_.scale.setScalar(this.scale_);
    }
  };

  class Background {
    constructor(params) {
      this.params_ = params;
      this.clouds_ = [];
      this.foliage = [];

      this.SpawnClouds();
      this.SpawnDecorations();
    }

    SpawnClouds() {
      for (let i = 0; i < 25; ++i) {
        const cloud = new BackgroundCloud(this.params_);

        this.clouds_.push(cloud);
      }
    }

    SpawnDecorations() {
      for (let i = 0; i < 500; ++i) {
        const decor = new BackgroundNature(this.params_);

        this.foliage.push(decor);
      }
    }

    Update(timeElapsed) {
      for (let c of this.clouds_) {
        c.Update(timeElapsed);
      }
      for (let c of this.foliage) {
        c.Update(timeElapsed);
      }
    }
  }

  return {
    Background: Background,
  };
})();