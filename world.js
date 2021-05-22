w = (() => {

  const START_POS = 70;
  const SEPARATION_DISTANCE = 20;


  class WorldObject {
    constructor(params) {
      this.position = new THREE.Vector3();
      this.quaternion = new THREE.Quaternion();
      this.scale = 1.0;
      this.collider = new THREE.Box3();

      this.params_ = params;
      this.LoadModel_();
    }

    LoadModel_() {
      var gate = gatePool.getRandomAsset();

      if (!gate) {
        return;
      }
      gate = gate.scene.clone();
      gate.scale.setScalar(1);

      this.mesh = gate;
      this.params_.scene.add(this.mesh);

      gate.traverse(c => {
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
          }
        }
        c.castShadow = true;
        c.receiveShadow = true;
      });
    }

    UpdateCollider_() {
      this.collider.setFromObject(this.mesh);
    }

    Update(timeElapsed) {
      if (!this.mesh) {
        return;
      }
      this.mesh.position.copy(this.position);
      this.mesh.quaternion.copy(this.quaternion);
      this.mesh.scale.setScalar(this.scale);
      this.UpdateCollider_();
    }
  }

  class WorldManager {
    constructor(params) {
      this.objects_ = [];
      this.unused_ = [];
      this.params_ = params;
      this.score = 0.0;
      this.scoreText_ = '00000';
      this.separationDistance_ = SEPARATION_DISTANCE;
    }

    GetColliders() {
      return this.objects_;
    }

    LastObjectPosition_() {
      if (this.objects_.length == 0) {
        return SEPARATION_DISTANCE;
      }

      return this.objects_[this.objects_.length - 1].position.x;
    }

    SpawnObj_(scale, offset) {
      let obj = null;

      if (this.unused_.length > 0) {
        obj = this.unused_.pop();
        obj.mesh.visible = true;
      } else {
        obj = new WorldObject(this.params_);
      }

      obj.quaternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), Math.PI / 2.0);
      obj.position.x = START_POS + offset;
      obj.scale = scale;
      this.objects_.push(obj);
    }

    SpawnCluster_() {
      const scale = 0.4;
      const offset = 0;

      this.SpawnObj_(scale, offset);

    }

    MaybeSpawn_() {
      const closest = this.LastObjectPosition_();
      if (Math.abs(START_POS - closest) > this.separationDistance_) {
        this.SpawnCluster_();
        this.separationDistance_ = math.rand_range(SEPARATION_DISTANCE, SEPARATION_DISTANCE * 1.5);
      }
    }

    Update(timeElapsed) {
      this.MaybeSpawn_();
      this.UpdateColliders_(timeElapsed);
      this.UpdateScore_(timeElapsed);
    }

    UpdateScore_(timeElapsed) {
      if (playerMovementSpeed > 0) {
        this.score += timeElapsed * playerMovementSpeed;
      }

      const scoreText = Math.round(this.score).toLocaleString(
        'en-US', { minimumIntegerDigits: 5, useGrouping: false });

      if (scoreText == this.scoreText_) {
        return;
      }

      document.getElementById('score-text').innerText = scoreText;
    }

    UpdateColliders_(timeElapsed) {
      const invisible = [];
      const visible = [];

      for (let obj of this.objects_) {
        obj.position.x -= timeElapsed * playerMovementSpeed;

        if (obj.position.x < -100) {
          invisible.push(obj);
          obj.mesh.visible = false;
        } else {
          visible.push(obj);
        }

        obj.Update(timeElapsed);
      }

      this.objects_ = visible;
      this.unused_.push(...invisible);
    }
  };

  return {
    WorldManager: WorldManager,
  };
})();