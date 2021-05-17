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
      const loader = new THREE.GLTFLoader();
      loader.setPath('./resources/clouds/');
      loader.load('cloud' + math.rand_int(1, 3) + '.json', (cloud) => {
        this.mesh_ = cloud.scene;
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
      });
    }

    Update(timeElapsed) {
      if (!this.mesh_) {
        return;
      }

      this.position_.x -= timeElapsed * 10;
      if (this.position_.x < -100) {
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
      const assets = [
        ['willow.json', 5],
        ['bush2.json', 5],
        ['commontree.json', 5],
        ['commontree2.json', 5],
        ['birchtree.json', 5],  
        ['bush1.json', 5],
        ['pine.json', 5],
        ['commontree3.json', 5],
      ];

      const [asset, scale] = assets[math.rand_int(0, assets.length - 1)];

      const loader = new THREE.GLTFLoader();
      loader.setPath('./resources/trees/');
      loader.load(asset, (glb) => {
        this.mesh_ = glb.scene;
        this.params_.scene.add(this.mesh_);

        var random_z_left = math.rand_range(-500, -20);
        var random_z_right = math.rand_range(15, 500);

        this.position_.x = math.rand_range(0, 1000);
        this.position_.z = Math.random();

        if(this.position_.z <= 0.5) {
            this.position_.z = random_z_left;
        } else {
            this.position_.z = random_z_right;
        }

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
      });
    }

    Update(timeElapsed) {
      if (!this.mesh_) {
        return;
      }

      this.position_.x -= timeElapsed * 10;
      if (this.position_.x < -100) {
        this.position_.x = math.rand_range(2000, 3000);
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
      this.crap_ = [];

      this.SpawnClouds_();
      this.SpawnCrap_();
    }

    SpawnClouds_() {
      for (let i = 0; i < 25; ++i) {
        const cloud = new BackgroundCloud(this.params_);

        this.clouds_.push(cloud);
      }
    }

    SpawnCrap_() {
      for (let i = 0; i < 500; ++i) {
        const crap = new BackgroundNature(this.params_);

        this.crap_.push(crap);
      }
    }

    Update(timeElapsed) {
      for (let c of this.clouds_) {
        c.Update(timeElapsed);
      }
      for (let c of this.crap_) {
        c.Update(timeElapsed);
      }
    }
  }

  return {
      Background: Background,
  };
})();